// Establish a WebSocket connection to the server
const socket = new WebSocket('ws://localhost:3000/ws'); // Creating a WebSocket connection to the server

// Listen for messages from the server
socket.onmessage = function(event) {
    const data = JSON.parse(event.data); // parses any incoming data from the server

    if (data.type === 'new_poll') {
        const poll = data.poll; // extract new poll data
        const pollElement = createPollElement(poll); // then, create new poll element
        document.getElementById('polls').appendChild(pollElement); // finally, append to the polls list
    } else if (data.type === 'vote_update') {
        const {pollId, selectedOption, votes} = data; // similarly, this will extract vote update data
        const voteElement = document.getElementById(`${pollId}_${selectedOption}`); // now we grab the vote element
        voteElement.innerHTML = `<strong>${selectedOption}:</strong> ${votes} votes`; // and then update the vote count
    }
};

// Listen for additional messages from the server
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    // Handle events from the socket (e.g., new polls, vote updates)
});

/**
 * Handles adding a new poll to the page when one is received from the server
 * 
 * @param {*} data The data from the server (ideally containing the new poll's ID and its corresponding questions)
 */
function onNewPollAdded(data) {
    // using information from above, this will create a new poll element and add it to the page 
    const pollContainer = document.getElementById('polls');
    const newPoll = createPollElement(data);
    pollContainer.appendChild(newPoll);

    // event listeners to each vote button within the new poll
    newPoll.querySelectorAll('.poll-form').forEach((pollForm) => {
        pollForm.addEventListener('submit', onVoteClicked);
    });
}

/**
 * Handles updating the number of votes an option has when a new vote is received from the server
 * 
 * @param {*} data The data from the server (probably containing which poll was updated and the new vote values for that poll)
 */
function onIncomingVote(data) {
    const { pollId, selectedOption, votes } = data; // same as above, grab data, find element, update vote count
    const voteElement = document.getElementById(`${pollId}_${selectedOption}`); 
    voteElement.innerHTML = `<strong>${selectedOption}:</strong> ${votes} votes`; 
}

/**
 * Handles processing a user's vote when they click on an option to vote
 * 
 * @param {FormDataEvent} event The form event sent after the user clicks a poll option to "submit" the form
 */
function onVoteClicked(event) {
    event.preventDefault();

    // using this to extract the poll ID and selected option from the form data
    const formData = new FormData(event.target);
    const pollId = formData.get("poll-id");
    const selectedOption = event.submitter.value;

    // send the vote data to the server via WebSocket
    socket.send(JSON.stringify({type: 'new_vote', pollId, selectedOption}));
}

// Adds a listener to each existing poll to handle things when the user attempts to vote
document.querySelectorAll('.poll-form').forEach((pollForm) => {
    pollForm.onsubmit = function(event) {
        event.preventDefault(); 

        // do the same thing from onVoteClicked, but now we're extracting the poll ID and selected option 
        const pollId = this.querySelector('input[name="poll-id"]').value;
        const selectedOption = this.querySelector('button[name="poll-option"]:focus').value;

        socket.send(JSON.stringify({type: 'new_vote', pollId, selectedOption}));
    };
});

/**
 * Creates a new poll element to be added to the page
 * 
 * @param {Object} poll The poll data containing the poll's question and options
 * @returns {HTMLElement} The newly created poll element
 */
function createPollElement(poll) {
    const pollContainer = document.createElement('li'); 
    pollContainer.className = 'poll-container';
    pollContainer.id = poll.id;

    const question = document.createElement('h2');
    question.textContent = poll.question;
    pollContainer.appendChild(question);

    const optionsList = document.createElement('ul');
    optionsList.className = 'poll-options';

    poll.options.forEach(option => {
        const optionElement = document.createElement('li');
        optionElement.id = `${poll.id}_${option.answer}`;
        optionElement.innerHTML = `<strong>${option.answer}:</strong> ${option.votes} votes`;
        optionsList.appendChild(optionElement);
    });

    pollContainer.appendChild(optionsList);

    const form = document.createElement('form');
    form.className = 'poll-form button-container';                  // this entire section is confusing af, but it's using some html structure to help organize the polls
                                                                    // when they finish being created
    poll.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'action-button vote-button';
        button.type = 'submit';
        button.value = option.answer;
        button.name = 'poll-option';
        button.textContent = `Vote for ${option.answer}`;
        form.appendChild(button);
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.style.display = 'none';
    input.value = poll.id;
    input.name = 'poll-id';
    form.appendChild(input);

    pollContainer.appendChild(form);

    return pollContainer;
}
