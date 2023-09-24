'use strict';
var chatContainer = document.querySelector('#chat');
var messageInput = document.querySelector('#message-input');
var sendButton = document.querySelector('#send-button');
var connectButton = document.querySelector('#connect-button');
var usernameElement = document.querySelector('#username');
var roomIDElement = document.querySelector('#ID');
var stompClient;
var subscription;
var username;
var ID;
var socket = null;
var connected = false;

function connect() {
    if (!connected) {
        username = usernameElement.textContent;
        if (username) {
            connected = true;
            if (!socket) {
                socket = new SockJS('/ws');
                stompClient = Stomp.over(socket);
                stompClient.connect({}, connectChat, onError);
            } else {connectChat();}
            connectButton.textContent = 'Rozłącz';
            chatContainer.innerHTML = '';
            onError("Limited Test Build v1.0 [Public Release]");
            onError("========================================");
        }
    } else { disconnectChat(); }
}
function connectChat() {
    stompClient.send("/app/room.start", {}, JSON.stringify({ sender: username }));
    subscription = stompClient.subscribe('/topic', function (payload) {
        var message = JSON.parse(payload.body);
        {
            if(message.sender === username) {
                roomIDElement.textContent = message.id;
                console.log('ID:', message.id);
                console.log('Type:', message.type);
                console.log('sender:', message.sender);
                console.log('session:', message.session);
                ID = message.id;
                if (subscription) { subscription.unsubscribe(); }
                subscribeRoom();
                if (message.type === 'JOIN') { onInfo("Dołączono do pokoju: " + ID); onHello(); }
                if (message.type === 'CREATE') { onInfo("Stworzono pokój: " + ID + ", oczekiwanie na użytkownika..."); }
            } else { onError("Połącz ponownie"); disconnectChat(); }
        }
    });
}
function subscribeRoom() {
    if (stompClient && ID) {
        var roomTopic = `/topic/room/${ID}`;
        subscription = stompClient.subscribe(roomTopic, onMessageReceived);
    }
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.placeholder = 'Wiadomość...';
}
function disconnectChat() {
    connected = false;
    connectButton.textContent = 'Połącz';
    messageInput.disabled = true;
    sendButton.disabled = true;
    messageInput.placeholder = 'Połącz się, aby rozpocząć nowy chat!';
    stompClient.send("/app/room.stop", {}, JSON.stringify({id: ID}));
    ID = null;
    onInfo("Rozłączono.");
    subscription = null;
}
function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    var messageElement = document.createElement('li');
    if (message.type === 'CHAT') {
        messageElement.textContent = message.sender + ': ' + message.content;
        messageElement.classList.add('chat-message');
        messageElement.style.color = randomColor(message.sender);
    }
    if (message.type === 'JOIN') {
        messageElement.textContent = message.sender + message.content;
        messageElement.classList.add('info-message');
    }
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
function sendMessage() {
    var messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        var chatMessage = { id: ID, type: 'CHAT', sender: username, content: messageInput.value };
        stompClient.send(`/app/chat.message/${ID}`, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
}
function onHello() {
    if (stompClient) {
        var chatMessage = { id: ID,  type: 'JOIN',  sender: username, content: " dołącza do chatu." };
        stompClient.send(`/app/chat.message/${ID}`, {}, JSON.stringify(chatMessage));
    }
}
function onError(error) {
    var messageElement = document.createElement('li');
    messageElement.textContent = error;
    messageElement.classList.add('error-message');
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    //disconnectChat();
}
function onInfo(info) {
    var messageElement = document.createElement('li');
    messageElement.textContent = info;
    messageElement.classList.add('info-message');
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
function randomColor(messageSender) {
    const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'brown', 'turquoise', 'gray'];
    const hash = messageSender.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

// cookie & username
function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9]{1,13}$/;
    return usernameRegex.test(username);
}
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}
function getCookie(name) {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + "=")) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}
const savedUsername = getCookie('username');
if (savedUsername) {
    usernameElement.textContent = savedUsername;
} else {
    let username;
    do {
        username = prompt('Podając nick akceptujesz regulamin, oraz politykę cookie.\n[Maksymalnie 13 znaków, tylko litery i cyfry]\nTwój nick:');
    } while (username && !isValidUsername(username));
    if (username) {
        usernameElement.textContent = username;
        setCookie('username', username, 1);
    }
}
sendButton.addEventListener('click', sendMessage);
connectButton.addEventListener('click', connect);
messageInput.addEventListener('keyup', handleEnter);
function handleEnter(event) { if (event.keyCode === 13) { sendMessage();} }