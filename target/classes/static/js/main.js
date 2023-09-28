'use strict';
var chatContainer = document.querySelector('#chat');
var messageInput = document.querySelector('#message-input');
var sendButton = document.querySelector('#send-button');
var connectButton = document.querySelector('#connect-button');
var usernameElement = document.querySelector('#username');
var RIDElement = document.querySelector('#RID');
var stompClient;
var subscription;
var RID;
var socket = null;
var connected = false;
let UID = null;
let username = null;
var connectButtonDisabled = false;
var disconnectButtonDisabled = true;
var reconnectTimeout = null;

function connect() {
    if (!connected) {
        username = usernameElement.textContent;
        if (username) {
            connected = true;
            if (!socket) {
                socket = new SockJS('/ws');
                stompClient = Stomp.over(socket);
                stompClient.connect({}, connectChat, onError);
            } else { connectChat();}
            if (!connectButtonDisabled) {
                connectButton.disabled = true;
                setTimeout(function() {
                    connectButton.disabled = false;
                    connectButton.textContent = 'Rozłącz';
                }, 15000);
            }
            connectButton.textContent = '15sek';
            chatContainer.innerHTML = '';
            onError("Limited Test Build v1.0 [Public Release]");
            onError("========================================");
        }
    } else { onElo(); disconnectChat(); onInfo("Rozłączono."); }
}
function connectChat() {
    if (stompClient && UID) {
        var link = `/app/search/${UID}`
        stompClient.send(link, {}, JSON.stringify({uid: UID}));
        var roomTopic = `/topic/session/${UID}`;
        subscription = stompClient.subscribe(roomTopic, function (payload) {
            var message = JSON.parse(payload.body);
            if (message.uid === UID) {
                RID = message.rid;
                RIDElement.textContent = RID;
                if (message.type === 'JOIN') { onInfo("Dołączono do pokoju: " + RID); onHello(); }
                if (message.type === 'CREATE') { onInfo("Stworzono pokój: " + RID + ", oczekiwanie na użytkownika..."); }
                if (subscription) { subscription.unsubscribe(); }
                subscribeRoom();
            }
        });
    }
}
function subscribeRoom() {
    if (stompClient && RID) {
        var roomTopic = `/topic/room/${RID}`;
        subscription = stompClient.subscribe(roomTopic, onMessageReceived);

    }
}
function disconnectChat() {
    connected = false;
    messageInput.disabled = true;
    sendButton.disabled = true;
    connectButton.textContent = '10sek';
    connectButton.disabled = true;
    setTimeout(function() {
        connectButton.disabled = false;
        connectButton.textContent = 'Połącz';
        }, 10000);
    messageInput.placeholder = 'Połącz się, aby rozpocząć nowy chat!';
    if (subscription) { subscription.unsubscribe(); }
    stompClient.send("/app/disconnect", {}, JSON.stringify({rid: RID}));
    RID = null;
    //location.reload();
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
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.placeholder = 'Wiadomość...';
    }
    if (message.type === 'LEAVE') {
        messageElement.textContent = message.sender + message.content;
        messageElement.classList.add('info-message');
        disconnectChat();
        messageInput.disabled = true;
        sendButton.disabled = true;
    }
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
function sendMessage() {
    var messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        var chatMessage = { id: RID, type: 'CHAT', sender: username, content: messageInput.value };
        stompClient.send(`/app/chat.message/${RID}`, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
}
function onHello() {
    if (stompClient) {
        var chatMessage = { id: RID, type: 'JOIN',  sender: username, content: " dołącza do chatu." };
        stompClient.send(`/app/chat.message/${RID}`, {}, JSON.stringify(chatMessage));
    }
}
function onElo() {
    if (stompClient) {
        var chatMessage = { id: RID, type: 'LEAVE',  sender: username, content: " wychodzi z chatu." };
        stompClient.send(`/app/chat.message/${RID}`, {}, JSON.stringify(chatMessage));
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
    const colors = ['red', 'green', 'teal', 'olive', 'orange', 'purple', 'pink', 'brown', 'turquoise', 'gray'];
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
function newUsernumer(username) {
    const currentSecond = Math.floor(new Date().getTime() / 1000) % 86400;
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const uniqueNumber = (hash + currentSecond) % 1000;
    return `${currentSecond}${String(uniqueNumber).padStart(3, '0')}`;
}
const savedUsername = getCookie('username');
const savedUsernumer = getCookie('usernumer');

if (savedUsername && savedUsernumer) {
    username = savedUsername;
    UID = savedUsernumer;
    usernameElement.textContent = username;
    setCookie('username', username, 1/48);
    setCookie('usernumer', UID, 1/48);
} else {
    do {
        username = prompt('Podając nick akceptujesz regulamin, oraz politykę cookie.\n[Maksymalnie 13 znaków, tylko litery i cyfry]\nTwój nick:');
    } while (username && !isValidUsername(username));
    if (username) {
        UID = newUsernumer(username);
        usernameElement.textContent = username;
        setCookie('username', username, 1/48);
        setCookie('usernumer', UID, 1/48);
        console.log(username + UID);
    }
}

sendButton.addEventListener('click', sendMessage);
connectButton.addEventListener('click', connect );
messageInput.addEventListener('keyup', handleEnter);
function handleEnter(event) { if (event.keyCode === 13) { sendMessage();} }

