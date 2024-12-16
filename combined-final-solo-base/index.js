// this file may be a bit of a mess but i hope it's organized well enough

const express = require('express');
const expressWs = require('express-ws');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');

const PORT = 3000;
const MONGO_URI = 'mongodb://localhost:27017/jbatabase';
const app = express();
expressWs(app);

// Using this to import the schema from schemas.js, this allows for poll voting to work properly
const { User, Poll } = require('./models/schemas');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'voting-app-secret',
    resave: false,
    saveUninitialized: false,
}));

let connectedClients = [];

// WebSocket handling
app.ws('/ws', (socket, request) => {
    connectedClients.push(socket);

    socket.on('message', async (message) => {
        const data = JSON.parse(message);
        if (data.type === 'new_vote') {
            await onNewVote(data.pollId, data.selectedOption);
        }
    });

    socket.on('close', async () => {
        connectedClients = connectedClients.filter(client => client !== socket);
    });
});

// ===================================================================================================

// Landing page route (im keeping these in the same subsection just because this route is so small)
app.get('/', (request, response) => {
    response.render('index/unauthenticatedIndex', { errorMessage: null }); 
});


// Signup route
app.get('/signup', (request, response) => {
    response.render('signup', { errorMessage: null });
});

app.post('/signup', async (request, response) => {
    const { username, password, email } = request.body;
    console.log(`Received signup request for username: ${username}, email: ${email}`); // logs signup req

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // salt rounds of 10, good luck decrypting
        const newUser = new User({ username, password: hashedPassword, email }); 
        await newUser.save();
        request.session.user = { id: newUser._id, username: newUser.username };
        return response.redirect('/createPoll'); // redirect to createPoll page after signup
    } catch (error) {
        console.error(error);
        return response.render('signup', { errorMessage: 'Error creating account. Please try again!' });
    }
});

// ===================================================================================================

// Route to serve the createPoll page
app.get('/createPoll', (request, response) => {
    if (!request.session.user?.id) {
        return response.redirect('/login'); // redirect to login if not authenticated
    }
    response.render('createPoll', { errorMessage: null });
});

app.post('/createPoll', async (request, response) => {
    const { question, options } = request.body;
    const formattedOptions = Object.values(options).map((option) => ({ answer: option, votes: 0 }));

    const pollCreationError = await onCreateNewPoll(question, formattedOptions); // this calls on the onCreateNewPoll func when a user makes a new poll
    if (pollCreationError) {
        return response.render('createPoll', { errorMessage: pollCreationError }); 
    }

    return response.redirect('/dashboard');
});

// Added /vote here since it pretty much directly correlates to createPoll, and for overall better organization

app.post('/vote', async (request, response) => {
    const { pollId, selectedOption } = request.body;
    const userId = request.session.user.id;

    console.log(`Vote received: Poll ID: ${pollId}, Option: ${selectedOption}, User ID: ${userId}`);

    try { // find user info
        const user = await User.findById(userId);
        const poll = await Poll.findById(pollId);

        if (!user || !poll) {
            console.log('Invalid poll or user');
            return response.redirect('/dashboard');
        }

        if (user.votedPolls.includes(pollId)) {
            console.log('User already voted on this poll');
            return response.redirect('/dashboard');
        }

        const option = poll.options.find(opt => opt.answer === selectedOption);

        if (!option) {
            console.log('Invalid option selected');
            return response.redirect('/dashboard');
        }

        option.votes += 1; // updates vote count when user selects option in dashboard
        user.votedPolls.push(pollId);

        // save updated poll & user information to db
        await poll.save();
        await user.save();

        console.log('Vote processed successfully');
        response.redirect('/profile');
    } catch (error) {
        console.error('Error processing vote:', error);
        response.redirect('/dashboard');
    }
});

// ===================================================================================================

// Profile route
app.get('/profile', async (request, response) => {
    const userId = request.session.user?.id;

    if (!userId) {
        return response.redirect('/login'); // redirected to login if not properly authenticated
    }

    try {
        // find user by id, and populate votedPolls path with poll options
        const user = await User.findById(userId).populate({
            path: 'votedPolls',
            populate: {
                path: 'options',
                model: 'Poll'
            }
        });

        if (!user) {
            return response.redirect('/login'); 
        }

        response.render('profile', { user });
    } catch (error) {
        console.error(error);
        response.redirect('/login'); // redirects to login for error
    }
});

// ===================================================================================================

// Login route
app.get('/login', (request, response, next) => {
    try {
        response.render('login', { errorMessage: null }); // render login page with hopefully no errors
    } catch (err) {
        next(err); // pass any errors to error handler
    }
});

app.post('/login', async (request, response) => {
    const { username, password } = request.body;

    try { // mostly just finding user information from database and allows for successful login if credentials are met
        const user = await User.findOne({ username }); 
        if (user && await bcrypt.compare(password, user.password)) { // like this, just compares the password you type in with what's hashed & stored
            request.session.user = { id: user._id, username: user.username }; 
            return response.redirect('/dashboard');
        }
        return response.render('login', { errorMessage: 'Login failed, wrong username or password' }); // keeping vague like usual for better security
    } catch (error) {
        console.error(error);
        return response.render('login', { errorMessage: 'Login failed. Try again.' });
    }
});

// ===================================================================================================

// Dashboard route
app.get('/dashboard', async (request, response) => {
    // checks for user authentication through verifying if session contains user ID
    if (!request.session.user?.id) {
        return response.redirect('/login'); // because otherwise, redirects back to login
    }

    const polls = await Poll.find(); // when a user logs in, this should grab all polls from the db and renders the dashboard view with them 
    return response.render('dashboard', { polls });
});

app.get('/logout', (request, response) => {
    request.session.destroy((err) => {
        if (err) {
            console.error(err);
            return response.redirect('/profile'); // sends you back to profile incase of error
        }

        response.redirect('/'); // if logout is successful, brings you back to landing page (in this case, unauthenticatedIndex.js lol)
    });
});

// ===================================================================================================

// Mongoose connection information, this helps establish a connection to the MongoDB database with MONGO_URI
mongoose.connect(MONGO_URI)
    .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
    .catch((err) => console.error('MongoDB connection error:', err));

// Creation of a new poll
async function onCreateNewPoll(question, pollOptions) {
    try {
        // by doing this, it creates a new poll based on question and options given, then saves it to the local database
        const poll = new Poll({ question, options: pollOptions }); 
        await poll.save();

        const newPoll = { id: poll._id, question: poll.question, options: poll.options };
        // while down here, this newPoll will send the poll information to all connected clients in the db
        connectedClients.forEach(socket => {
            socket.send(JSON.stringify({ type: 'new_poll', poll: newPoll }));
        });

        return null; // if successfull, this returns null, otherwise should log any potential errors
    } catch (error) {
        console.error(error);
        return "Error creating the poll, please try again";
    }
}

// Function for handling new votes
async function onNewVote(pollId, selectedOption) {
    try {
        const poll = await Poll.findById(pollId); // find poll by id, otherwise get tossed an error 
        if (!poll) {
            throw new Error('Poll not found');
        }

        const option = poll.options.find(opt => opt.answer === selectedOption); // same thing as above, but for the options in the poll 
        if (!option) {
            throw new Error('Option not found');
        }

        option.votes += 1; // increment vote count when a user selects an option, then saves poll to db
        await poll.save();

        connectedClients.forEach(socket => {
            socket.send(JSON.stringify({ type: 'vote_update', pollId, selectedOption, votes: option.votes }));
        });
    } catch (error) {
        console.error('Error updating poll:', error);
    }
}

