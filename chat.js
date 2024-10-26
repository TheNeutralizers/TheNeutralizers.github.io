// JavaScript Code

// URL of the Lambda function
const lambdaUrl = 'https://ahkd7hrnc35u2syh7jdkww5a7m0kvwgk.lambda-url.eu-central-1.on.aws/';

// Initialize chat history array
let chatHistory = [];

// Event listeners for send button and Enter key
document.getElementById('send-button').addEventListener('click', sendPrompt);
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendPrompt();
    }
});

function sendPrompt() {
    const promptInput = document.getElementById("user-input");
    const prompt = promptInput.value.trim();
    if (!prompt) return; // Do nothing if the input is empty

    // Add user's message to chat history and display it
    addMessage(prompt, 'user');
    chatHistory.push({ role: 'user', content: prompt });

    // Prepare the prompt by concatenating the chat history
    let conversation = chatHistory.map(msg => `${msg.role === 'user' ? 'User:' : 'Assistant:'} ${msg.content}`).join('\n');

    // The payload includes the entire conversation as the prompt
    const payload = { "prompt": conversation };

    fetch(lambdaUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        // Remove 'Assistant:' prefix from the response if present
        let assistantReply = data.response;
        if (assistantReply.startsWith('Assistant:')) {
            assistantReply = assistantReply.replace('Assistant:', '').trim();
        }

        // Add assistant's response to chat history and display it
        addMessage(assistantReply, 'bot', data.region);
        chatHistory.push({ role: 'assistant', content: assistantReply });

        // Update the sidebar with additional data
        updateEnvironmentalData(data);
    })
    .catch(error => {
        console.error("Error:", error);
        const errorMessage = "Sorry, an error occurred while processing your request.";
        addMessage(errorMessage, 'bot');
        chatHistory.push({ role: 'assistant', content: errorMessage });
    });

    // Clear the input field
    promptInput.value = '';
}

function addMessage(text, sender, region = '') {
    const chatMessages = document.getElementById('chat-messages');
    const messageElem = document.createElement('div');
    messageElem.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    messageElem.textContent = text;
    chatMessages.appendChild(messageElem);

    if (sender === 'bot' && region) {
        const regionElem = document.createElement('div');
        regionElem.classList.add('bot-source');
        regionElem.textContent = `Region: ${region}`;
        chatMessages.appendChild(regionElem);
    }

    // Scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateEnvironmentalData(data) {
    const environmentalData = document.getElementById('environmental-data');
    environmentalData.innerHTML = `
        <p><strong>Token Usage:</strong> ${data.token_usage}</p>
        <p><strong>Energy Consumption (Joules):</strong> ${data.estimated_energy_consumption_joules}</p>
        <p><strong>Execution Time (seconds):</strong> ${data.total_execution_time_seconds}</p>
    `;
}