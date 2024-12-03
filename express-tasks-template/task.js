// Project: Database and Backend Integration, connecting an existing Express backend to PSQL and using a MongoDB collection to write queries.
//          This section is to help with creating a Mongoose scheme/model for tasks (why it's called task.js lol)
// By: Cameron Beanland
// Date: Dec. 2nd, 2024

const mongoose = require('./database'); // import mongoose

// schema creation
const tSchema = new mongoose.Schema({
    description: {
        type: String, // lets us know that the desc. of a task = string
        required: true // and this just shows that desc. is required
    },
    status: {
        type: String,
        required: true
    }
});

// model based on schematic above
const Task = mongoose.model('Task', tSchema);

// export for usage in index.js
module.exports = Task;
