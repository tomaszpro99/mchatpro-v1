'use strict';

var chatContainer = document.querySelector('#chat');
var messageInput = document.querySelector('#message-input');
var sendButton = document.querySelector('#send-button');
var connectButton = document.querySelector('#connect-button');
var usernameElement = document.querySelector('#username');
var serverStatusElement = document.querySelector('#server-status');
var connectingElement = document.querySelector('.connecting');

var stompClient = null;
var username = null;
var connected = false;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connectToChat() {
    if (!connected) { // Sprawdź, czy użytkownik nie jest już połączony
        username = usernameElement.textContent;
        if (username) {
            var socket = new SockJS('/ws');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, onConnected, onError);
            connected = true;
            connectButton.textContent = 'Rozłącz';
            serverStatusElement.textContent = 'ON';
        }
    } else {
        disconnectFromChat(); // Jeśli jesteś połączony, rozłącz się
    }
}

// Funkcja do rozłączania z czatem
function disconnectFromChat() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    connected = false;
    connectButton.textContent = 'Połącz';
    serverStatusElement.textContent = 'OFF';
}

// Obsługa przycisku "Połącz/Rozłącz"
connectButton.addEventListener('click', connectToChat);

function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({ sender: username, type: 'JOIN' })
    );
    connectingElement.classList.add('hidden');
}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
    serverStatusElement.textContent = 'OFF'; // Aktualizacja statusu serwera
}

function sendMessage() {
    var messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if (message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        messageElement.textContent = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        messageElement.textContent = message.sender + ' left!';
    } else {
        messageElement.textContent = message.sender + ': ' + message.content;
        messageElement.classList.add('chat-message'); // Dodaj klasę CSS do wiadomości
        messageElement.style.color = getAvatarColor(message.sender); // Ustaw kolor całego nicku
    }

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


// Funkcja do generowania koloru avatara
function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

// Funkcje do obsługi ciasteczek
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

// Sprawdź, czy istnieje już ciasteczko z nazwą użytkownika
const savedUsername = getCookie("username");
if (savedUsername) {
    usernameElement.textContent = savedUsername;
} else {
    // Jeśli nie istnieje, poproś użytkownika o podanie nicku
    username = prompt("Podaj swój nick:");
    if (username) {
        usernameElement.textContent = username;
        setCookie("username", username, 1); // Zapisz nick w ciasteczku na 24 godziny.
    }
}
// Obsługa klawisza Enter
function handleEnter(event) {
    if (event.keyCode === 13) {
        sendMessage();
    }
}

// Nasłuchuj przycisku "Wyślij"
sendButton.addEventListener('click', sendMessage);

// Obsługa klawisza Enter
//messageInput.addEventListener('keyup', handleEnter);