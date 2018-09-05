// database ref
let uid;

let init = () => {
    // set up service worker
    
    uid = localStorage.getItem('uid');
    if (!uid) {
        uid = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
        localStorage.setItem('uid', uid);
    }
    document.getElementById('sendMsg').addEventListener('submit', e => {
        e.preventDefault();
        sendMessage(document.getElementById('msgInput').value);
    })
    // get messages from database
}

init();

let createMessageDOM = (text, owner) => {
    const container = document.getElementById('msgContainer');
    container.innerHTML += `<div class="message ${owner ? 'mine' : 'other'}"><p>${text}</p></div>`;
    container.scrollTo(0, container.scrollHeight);
}

let setUpMessagingPushNotifications = (registration) => {
    // set up push notifications
}


let sendMessage = (body) => {
    const msg = {
        sender_id: uid,
        body,
        timestamp: new Date().toISOString()
    };
    // push message to database
}



