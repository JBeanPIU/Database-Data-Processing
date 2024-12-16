const express = require('express');
const expressWs = require('express-ws');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');

const PORT = 3000;
const MONGO_URI = 'mongodb://localhost:27017/keyin_test';
const app = express();
expressWs(app);

// Import the models
const User = require('./models/User');
const Poll = require('./models/Poll');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'voting-app-secret', // a secret key used for session encryption
    resave: false,
    saveUninitialized: false,
}));
let connectedClients = []; // this array keeps track of connected WebSocket clients

// WebSocket handling
app.ws('/ws', (socket, request) => {
    connectedClients.push(socket); 

    socket.on('message', async (message) => {
        const data = JSON.parse(message);

        if (data.type === 'new_vote') {
            await onNewVote(data.pollId, data.selectedOption); // handles new vote, most data here found in frontend.js
        }
    });

    socket.on('close', async () => {
        connectedClients = connectedClients.filter(client => client !== socket);
    });
});

// Sign up route
app.post('/signup', async (request, response) => {
    const { username, password, email } = request.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // bcrypt setup to keep passwords and authentication secure
        const newUser = new User({username, password: hashedPassword, email});
        await newUser.save(); // once user setup is complete, saves new user to database
        request.session.user = {id: newUser._id, username: newUser.username};
        return response.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        return response.render('signup', {errorMessage: 'Error creating account. Please try again!'});
    }
});

// Login route
app.post('/login', async (request, response) => {
    const { username, password } = request.body;

    try {
        const user = await User.findOne({ username }); // finds user by their username
        if (user && await bcrypt.compare(password, user.password)) { // .compare used to verify password
            request.session.user = { id: user._id, username: user.username }; // and this stores user data in session
            return response.redirect('/dashboard');
        }
        return response.render('index/unauthenticatedIndex', { errorMessage: 'Login failed, wrong username or password' });
    } catch (error) {
        console.error(error);
        return response.render('index/unauthenticatedIndex', { errorMessage: 'Login failed. Try again.' });
    }
});

// Create poll route
app.post('/createPoll', async (request, response) => {
    const { question, options } = request.body;
    const formattedOptions = Object.values(options).map((option) => ({ answer: option, votes: 0 }));

    const pollCreationError = await onCreateNewPoll(question, formattedOptions);
    if (pollCreationError) {
        return response.render('createPoll', { errorMessage: pollCreationError });
    }

    return response.redirect('/dashboard');
});

mongoose.connect(MONGO_URI)
    .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
    .catch((err) => console.error('MongoDB connection error:', err));

/**
 * Handles creating a new poll, based on the data provided to the server
 * 
 * @param {string} question The question the poll is asking
 * @param {[answer: string, votes: number]} pollOptions The various answers the poll allows and how many votes each answer should start with
 * @returns {string?} An error message if an error occurs, or null if no error occurs.
 */
async function onCreateNewPoll(question, pollOptions) {
    try {
        const poll = new Poll({ question, options: pollOptions });
        await poll.save();

        // Notify all connected clients
        const newPoll = { id: poll._id, question: poll.question, options: poll.options };
        connectedClients.forEach(socket => {
            socket.send(JSON.stringify({ type: 'new_poll', poll: newPoll }));
        });

        return null;
    } catch (error) {
        console.error(error);
        return "Error creating the poll, please try again";
    }
}

/**
 * Handles processing a new vote on a poll
 * 
 * @param {string} pollId The ID of the poll that was voted on
 * @param {string} selectedOption Which option the user voted for
 */
async function onNewVote(pollId, selectedOption) {
    try {
        const poll = await Poll.findById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        const option = poll.options.find(opt => opt.answer === selectedOption);
        if (!option) {
            throw new Error('Option not found');
        }

        option.votes += 1; // increment vote count
        await poll.save(); // save updated info to the database

        // Notify all connected clients
        connectedClients.forEach(socket => {
            socket.send(JSON.stringify({ type: 'vote_update', pollId, selectedOption, votes: option.votes }));
        });
    } catch (error) {
        console.error('Error updating poll:', error);
    }
}

