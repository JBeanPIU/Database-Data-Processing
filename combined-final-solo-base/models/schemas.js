// basic schematic file, this was setup to connect with mongoose and store polling information!
// this file is to be used for /vote and anything poll related, to help keep track of vote count

const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    votedPolls: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poll'
    }]
});

const User = mongoose.model('User', userSchema);

// Poll Option Schema
const pollOptionSchema = new mongoose.Schema({
    answer: {
        type: String,
        required: true
    },
    votes: {
        type: Number,
        required: true,
        default: 0
    }
});

// Poll Schema
const pollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: [pollOptionSchema]
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = { User, Poll };


