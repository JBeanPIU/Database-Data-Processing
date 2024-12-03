// Project: Database and Backend Integration, connecting an existing Express backend to PSQL and using a MongoDB collection to write queries.
//          This file will be utilizing a connection to MongoDB via mongoose
// By: Cameron Beanland
// Date: Dec. 2nd, 2024

const mongoose = require('mongoose');

// Connecting to MongoDB
mongoose.connect('mongodb://localhost:27017/taskmanager');

// Default connection setup
const db = mongoose.connection;

// Bind connections
db.on('error', console.error.bind(console, 'sorry! connection error:'));  // Binds to error event
db.once('open', () => {
    console.log('You made it to MongoDB');  // Successful connection message
});

module.exports = mongoose;  // Export for use in other parts of the application


