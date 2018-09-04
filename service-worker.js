const CACHE_VERSION = 1;
const CACHE_NAME = `PWA-CACHE-${CACHE_VERSION}`;
const PRECACHE_MANIFEST = 'resources-manifest.json';

importScripts('./appConfig.js');

/** Firebase Init */
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-database.js');

self.addEventListener('install', event => {
    event.waitUntil(
        new Promise((resolve, reject) => {
            caches
                .open(CACHE_NAME)
                .then(cache => {
                    fetch(PRECACHE_MANIFEST).then(resp => {
                        resp.json().then(jsonResp => {
                            Promise.all(
                                jsonResp.TO_PRECACHE.map(url =>
                                    fetch(url).then(resp => {
                                        cache.put(url, resp);
                                    })
                                )
                            ).then(resolve);
                        });
                    });
                })
                .catch(reject);
        })
    );
});

self.addEventListener('activate', function onActivate(event) {
    firebase.initializeApp(AppConfig.FIREBASE_CONFIG);

    event.waitUntil(
        caches.keys().then(keys => {
            keys.filter(key => key !== CACHE_NAME).forEach(key => caches.delete(key));
        })
    );
});

self.addEventListener('fetch', function onFetch(event) {
    if (event.request.url.indexOf(location.origin) === 0) {
        console.log(event.request);
        event.respondWith(precacheResourceOrNetwork(event));
    }
});

self.addEventListener('push', event => {
    event.waitUntil(
        displayNotification(event.data.json())
    );
});

function precacheResourceOrNetwork(event) {
    const clonedRequest = event.request.clone();
    return caches
        .match(event.request)
        .then(resp => {
            debugger;
            resp || fetch(clonedRequest);
        });
}

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({
            type: 'window'
        }).then(clientList => {
            for (let i = 0; i < clientList.length; i++) {
                if (
                    (clientList[i].url === location.origin || clientList[i].url.indexOf('localhost') !== -1) &&
                    'focus' in clientList[i]
                ) {
                    return clientList[i].focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow('https://carbunebogdan.github.io/push-pwa-clean/');
            }
            return Promise.reject();
        })
    );
});

function displayNotification(payload, tag = 'common-tag') {
    const title = 'clean pwa & push';

    return self.clients.matchAll({
        type: 'window'
    }).then(windowClients => {
        if (windowClients.filter(client => client.focused).length === 0) {
            return self.registration.showNotification(title, {
                icon: 'https://carbunebogdan.github.io/push-pwa-clean/public/images/icons/icon-512x512.png',
                body: `${payload.data.text}
${payload.data.author} | ${self.getDateString(new Date(Number(payload.data.timestamp)))}`,
                tag,
                vibrate: [100, 50, 100, 50, 100, 50],
                requireInteraction: false
            });
        }
        return true;
    });
}