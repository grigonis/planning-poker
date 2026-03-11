const { rooms } = require("../store");
const { v4: uuidv4 } = require("uuid");

module.exports = (io, socket) => {
    const createTaskHandler = ({ roomId, title }) => {
        const room = rooms.get(roomId);
        if (!room) return;

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
        const room = rooms.get(roomId);
        if (!room) return;

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
        const room = rooms.get(roomId);
        if (!room) return;

        room.tasks = room.tasks.filter(t => t.id !== taskId);
        if (room.activeTaskId === taskId) {
            room.activeTaskId = null;
        }

        io.to(roomId).emit("tasks_updated", { tasks: room.tasks, activeTaskId: room.activeTaskId });
    };

    const selectTaskHandler = ({ roomId, taskId }) => {
        const room = rooms.get(roomId);
        if (!room) return;

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
