// Project: Database and Backend Integration, connecting an existing Express backend to PSQL and using a MongoDB collection to write queries.
// By: Cameron Beanland
// Date: Dec. 2nd, 2024

// anything that has a /m in the comment is pre-existing code from the original git, but modified (self use to help figure out what i setup myself)

const express = require('express');
const app = express();
const PORT = 3000;
const Task = require('./task'); // links back to the task.js file to nab Task const (i swear it's different from the task const below)

app.use(express.json());

// originally had let tasks = so and so but now that we're using MongoDB we can use that for more persistant storage

// ============================================================================

// BROWSER page setup, anything that I need to display on a page will be put down here
app.get('/', (request, response) => {
    response.send('The J');
});

// ============================================================================

// GET /tasks/:id - Get all tasks                                                               /m
app.get('/tasks', async (req, res) => { // changed most of these to async so i can use additional features, await is an example of such
    try {
        const tasks = await Task.find();
        res.json(tasks);                // like it says at the top, this just retrieves all tasks from the db and displays to user 
    } catch (error) {
        res.status(500).json({error: 'Database query error!'});
    }
});

// ============================================================================

// POST /tasks/:id - Add a new task                                                               /m
app.post('/tasks', async (req, res) => {
    const { description, status } = req.body;
    if (!description || !status) {
        return res.status(400).json({ error: 'All fields (description, status) are required' });
    }

    const task = new Task({ description, status }); // used to add new task to the db, given it has a description and status
                                                    // because of MongoDB, we don't need id tag anymore since it auto generates
    try {
        const newTask = await task.save();
        res.status(201).json({ message: 'Task added successfully', task: newTask });
    } catch (error) {
        res.status(500).json({ error: 'Database insertion error' });
    }
});

// ============================================================================

// PUT /tasks/:id - Update a task's status
app.put('/tasks/:id', async (req, res) => {
    const { status } = req.body;

    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });   // this'll update status of an existing task in the db based on its id num
        }
        res.json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
        res.status(500).json({ error: 'Database update error' });
    }
});

// ============================================================================

// DELETE /tasks/:id - Delete a task                                                               /m
app.delete('/tasks/:id', async (req, res) => {
    try {
        const delTask = await Task.findByIdAndDelete(req.params.id);
        if (!delTask) {
            return res.status(404).json({ error: 'Task could not be found' }); // simply deletes a task from the db, based on its id as well
        }
        res.json({ message: 'Task successfully deleted', task: delTask });
    } catch (error) {
        res.status(500).json({ error: 'Deletion error, try again?' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
