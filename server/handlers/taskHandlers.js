const { v4: uuidv4 } = require("uuid");
const { getUser } = require("./utils");

const MAX_BULK_TASKS = 200;
const MAX_TITLE_LEN = 300;

module.exports = (io, socket) => {
    const createTaskHandler = ({ roomId, title }) => {
        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        const task = {
            id: uuidv4(),
            title: title.trim().slice(0, MAX_TITLE_LEN),
            votes: null,
            status: 'PENDING' // PENDING, VOTING, COMPLETED
        };

        room.tasks.push(task);
        io.to(roomId).emit("tasks_updated", { tasks: room.tasks });
    };

    const bulkCreateTasksHandler = ({ roomId, titles }) => {
        // SEC-06: Rate limit check
        if (!socket.checkRateLimit('bulk_create_tasks')) return;

        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        // QA-07: Cap input to prevent memory exhaustion from huge payloads
        const newTasks = titles.slice(0, MAX_BULK_TASKS * (MAX_TITLE_LEN + 1)).split('\n')
            .map(t => t.trim().slice(0, MAX_TITLE_LEN))
            .filter(Boolean)
            .slice(0, MAX_BULK_TASKS)
            .map(title => ({
                id: uuidv4(),
                title,
                votes: null,
                status: 'PENDING'
            }));

        room.tasks.push(...newTasks);
        io.to(roomId).emit("tasks_updated", { tasks: room.tasks });
    };

    const deleteTaskHandler = ({ roomId, taskId }) => {
        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        room.tasks = room.tasks.filter(t => t.id !== taskId);
        if (room.activeTaskId === taskId) {
            room.activeTaskId = null;
        }

        io.to(roomId).emit("tasks_updated", { tasks: room.tasks, activeTaskId: room.activeTaskId });
    };

    const selectTaskHandler = ({ roomId, taskId }) => {
        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        // Reset previous voting task status if it was in 'VOTING'
        room.tasks.forEach(t => {
            if (t.status === 'VOTING') t.status = 'PENDING';
        });

        const task = room.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'VOTING';
            room.activeTaskId = taskId;
        } else {
            room.activeTaskId = null;
        }

        io.to(roomId).emit("tasks_updated", { tasks: room.tasks, activeTaskId: room.activeTaskId });
    };

    socket.on("create_task", createTaskHandler);
    socket.on("bulk_create_tasks", bulkCreateTasksHandler);
    socket.on("delete_task", deleteTaskHandler);
    socket.on("select_task", selectTaskHandler);
};
