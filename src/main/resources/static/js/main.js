'use strict';
var chatContainer = document.querySelector('#chat');
var messageInput = document.querySelector('#message-input');
var sendButton = document.querySelector('#send-button');
var connectButton = document.querySelector('#connect-button');
var usernameElement = document.querySelector('#username');
var roomIDElement = document.querySelector('#ID');
var serverStatusElement = document.querySelector('#server-status');

var stompClient = null;
var username;
var ID;
var socket = null;
var connected = false;


var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];
// Obsługa wiadomości otrzymanej z serwera
function connect() {
    if (!connected) {
        username = usernameElement.textContent;
        if (username) {
            connected = true;

            // Połącz z WebSocket
            socket = new SockJS('/ws');
            stompClient = Stomp.over(socket);
            stompClient.connect({}, connectChat, onError);

            connectButton.textContent = 'Rozłącz';
            serverStatusElement.textContent = 'Connect';
        }
    } else { disconnectChat(); }
}
function connectChat() {
    stompClient.send("/app/room.start", {}, JSON.stringify({
        sender: username,
        type: 'START'
    }));
    stompClient.subscribe('/topic', function (payload) {
        var message = JSON.parse(payload.body);
        if (message.type === 'START') {
            // Aktualizacja odebranego ID
            roomIDElement.textContent = message.id;
            console.log('ID pokoju:', message.id);
            ID = message.id;
            subscribeRoom();
        }
    });
}
function subscribeRoom() {
    if (stompClient && ID) {
        var roomTopic = `/topic/room/${ID}`;
        stompClient.subscribe(roomTopic, onMessageReceived);
    }
}
function disconnectChat() {
    connected = false;
    connectButton.textContent = 'Połącz';
    serverStatusElement.textContent = 'Disconnect';
    roomIDElement.textContent = '0';
    stompClient.send("/app/room.stop", {}, JSON.stringify({id: ID,  type: 'STOP'}));
    ID = null;
}
function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    var messageElement = document.createElement('li');
    if (message.type === 'START') {
        // Aktualizuj status pokoju w interfejsie
        //roomIDElement.textContent = message.id;
        //messageElement.textContent = 'Wyszukiwanie uzytkownika...';
    } else if (message.type === 'STOP') {
        //messageElement.textContent = message.sender + ' opuścił pokój.';
    } else {
        messageElement.textContent = message.sender + ': ' + message.content;
        messageElement.classList.add('chat-message');
        messageElement.style.color = getAvatarColor(message.sender);
    }

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
function sendMessage() {
    var messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        var chatMessage = {
            id: ID,
            type: 'CHAT',
            sender: username,
            content: messageInput.value
        };
        stompClient.send(`/app/chat.message/${ID}`, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
}
function onError(error) {
    serverStatusElement.textContent = 'OFF';
}
// avatar
function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}
// cookie
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
    } return null;
}
const savedUsername = getCookie("username");
if (savedUsername) {
    usernameElement.textContent = savedUsername;
} else {
    username = prompt("Podając nick akcpetujesz cookie. Podaj swój nick:");
    if (username) {
        usernameElement.textContent = username;
        setCookie("username", username, 1);
    }
}

// Nasłuchuj przycisku "Wyślij"
sendButton.addEventListener('click', sendMessage);
// Obsługa przycisku "Połącz/Rozłącz"
connectButton.addEventListener('click', connect);
// Obsługa klawisza Enter
messageInput.addEventListener('keyup', handleEnter);
function handleEnter(event) { if (event.keyCode === 13) { sendMessage();} }