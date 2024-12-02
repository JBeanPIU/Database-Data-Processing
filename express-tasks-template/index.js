// Project: Database and Backend Integration, connecting an existing Express backend to PSQL and using a MongoDB collection to write queries.
// By: Cameron Beanland
// Date: Dec. 2nd, 2024

// anything that has a /m in the comment is pre-existing code from the original git, but modified (self use to help figure out what i setup myself)

const express = require('express');
const app = express();
const PORT = 3000;
const Task = require('./task'); // links back to the task.js file to nab Task const (i swear it's different from the task const below)

app.use(express.json());

let tasks = [
    { id: 1, description: 'Buy groceries', status: 'incomplete' },
    { id: 2, description: 'Read a book', status: 'complete' },
];

// BROWSER page setup, anything that I need to display on a page will be put down here
app.get('/', (request, response) => {
    response.send('The J');
});

// GET /tasks - Get all tasks                           /m
app.get('/tasks', (req, res) => {
    res.json(tasks);
});

// POST /tasks - Add a new task
app.post('/tasks', (request, response) => {
    const { id, description, status } = request.body;
    if (!id || !description || !status) {
        return response.status(400).json({ error: 'All fields (id, description, status) are required' });
    }

    tasks.push({ id, description, status });
    response.status(201).json({ message: 'Task added successfully' });
});

// PUT /tasks/:id - Update a task's status
app.put('/tasks/:id', (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    const { status } = request.body;
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return response.status(404).json({ error: 'Task not found' });
    }
    task.status = status;
    response.json({ message: 'Task updated successfully' });
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== taskId);

    if (tasks.length === initialLength) {
        return response.status(404).json({ error: 'Task not found' });
    }
    response.json({ message: 'Task deleted successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
