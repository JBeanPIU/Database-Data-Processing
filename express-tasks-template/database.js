// Project: Database and Backend Integration, connecting an existing Express backend to PSQL and using a MongoDB collection to write queries.
//          This file will be utilizing a connection to MongoDB via mongoose
// By: Cameron Beanland
// Date: Dec. 2nd, 2024

const mongoose = require('mongoose');

// connecting to MDB
mongoose.connect('mongo.db://localhost:27017/taskmanager', {
    useNewUrlParser: true, // helps avoid deprecation warnings
    useUnifiedTopology: true // mainly a discovery and monitering engine
});

// default connection setup
const db = mongoose.connection;

// bind connections
db.on('error', console.error.bind(console, 'sorry! connection error:')); // binds to error event and displays message if there's a connection error lol
db.once('open', () => {
    console.log('You made it to MongoDB'); // displays whether you successfully connected or not
});

module.exports = mongoose; // export so it can be used elsewhere
