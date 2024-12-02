// Project: Database and Backend Integration, connecting an existing Express backend to PSQL and using a MongoDB collection to write queries.
//          This file will be utilizing a connection to MongoDB via mongoose
// By: Cameron Beanland
// Date: Dec. 2nd, 2024

const mongoose = require('mongoose');

mongoose.connect('mongo.db://localhost:3000/taskmanager', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'sorry! connection error:'));
db.once('open', () => {
    console.log('You made it to MongoDB');
});

module.exports = mongoose;
