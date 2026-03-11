const { rooms } = require("../store");
const { v4: uuidv4 } = require("uuid");

const getUser = (socket) => {
    const roomId = socket.data.roomId;
    if (!roomId) return null;

    const room = rooms.get(roomId);
    if (!room) return null;

    const userId = socket.data.userId;
    if (!userId) return null;

    const user = room.users.get(userId);
    return { user, room, userId };
};

module.exports = (io, socket) => {
    const createTaskHandler = ({ roomId, title }) => {
        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        const task = {
            id: uuidv4(),
            title: title.trim(),
            votes: null,
            status: 'PENDING' // PENDING, VOTING, COMPLETED
        };

        room.tasks.push(task);
        io.to(roomId).emit("tasks_updated", { tasks: room.tasks });
    };

    const bulkCreateTasksHandler = ({ roomId, titles }) => {
        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        const newTasks = titles.split('\n')
            .map(t => t.trim())
            .filter(Boolean)
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
