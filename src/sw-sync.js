importScripts('dexie.min.js');

self.addEventListener('sync', (event) => {
    if(event.tag.includes('outbox')) {
        event.waitUntil(serverSync());
    }
});

async function serverSync() {
    console.log('serverSync called');
    const idb = new Dexie('messages');

    idb.version(1).stores({
        tasks: "++id,email,message,timeSent,userName,userId"
    });
    idb.open();

    let tasks = await idb.tasks.toArray();

    tasks.forEach(msg => {
        if(msg) {
            putMessageToFB(msg).then((response) => {
                idb.tasks.where('email').equals(response.email).delete();
            });
        }
    });
}

async function putMessageToFB(messageObj) {
    console.log('putMessageToFB called');
    const fbURL = `https://fall-ee5b7.firebaseio.com/messages/${messageObj.userId + messageObj.id}.json`;

    delete messageObj.id;
    delete messageObj.userId;

    try {
        const response = await fetch(fbURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(messageObj),
        });

        handleResponseStatus(response);

        const json = await response.json();
        return json;

    } catch (error) {
        return await handleResponseErrors(error);
    }

}

function handleResponseStatus(response) {
    if (response.ok) {
        return response;
    }

    throw response;
}

async function handleResponseErrors(error) {
    if (error.text) {

        const errorResponse = await error.text();
        let jsonMsg;

        try {
            jsonMsg = JSON.parse(errorResponse);
            throw jsonMsg;

        } catch (err) {
            throw err;
        }
    } else {
        throw error;
    }
}