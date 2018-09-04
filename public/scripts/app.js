const databaseRef = window.firebase.database().ref('/messages');
let uid;

let init = () => {
    uid = localStorage.getItem('uid');
    if (!uid) {
        uid = new Date().getUTCMilliseconds();
        localStorage.setItem('uid', uid);
    }
    databaseRef.on('child_added', data => {
        const value = data.val();
        createMessageDOM(value.body, uid == value.sender_id);
    });
    document.getElementById('sendMsg').addEventListener('submit', e => {
        e.preventDefault();
        sendMessage(document.getElementById('msgInput').value);
    })

    /** Service Worker */
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js').then(
            registration => {
                setUpMessagingPushNotifications(registration);
            },
            err => {
                console.error(`Oups ${err}`);
            }
        );
    }
}

init();

let createMessageDOM = (text, owner) => {
    const container = document.getElementById('msgContainer');
    container.innerHTML += `<div class="message ${owner ? 'mine' : 'other'}"><p>${text}</p></div>`;
    container.scrollTo(0, container.scrollHeight);
}

let setUpMessagingPushNotifications = (registration) => {
    const messaging = firebase.messaging();
    let activeToken;

    messaging.useServiceWorker(registration);
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            messaging.getToken().then(token => {
                activeToken = token;
                console.log(token);
                firebase
                    .database()
                    .ref(`tokens/${token}`)
                    .set(true);
            });
        }
    });

    messaging.onTokenRefresh(() => {
        messaging.getToken()
            .then((refreshedToken) => {
                firebase
                    .database()
                    .ref(`tokens/${activeToken}`)
                    .remove();
                firebase
                    .database()
                    .ref(`tokens/${refreshedToken}`)
                    .set(true);
                activeToken = refreshedToken;
            })
            .catch((err) => {
                console.error('Unable to retrieve refreshed token ', err);
            });
    });
}


let sendMessage = (body) => {
    const msg = {
        sender_id: uid,
        body,
        timestamp: new Date().toISOString()
    };
    return databaseRef.push(msg);
}



