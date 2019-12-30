const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp();

exports.fcmSend = functions.database.ref('/messages/{userId}').onCreate((snapshot, context) => {

  const message = snapshot.val();
  const userId  = context.params.userId;

  const payload = {
        notification: {
          title: "New Message",
          body: message.message,
          icon: "https://placeimg.com/250/250/people"
        }
      };

   admin.database()
        .ref(`/fcmTokens/${userId}`)
        .once('value')
        .then(token => token.val() )
        .then(userFcmToken => {
          return admin.messaging().sendToDevice(userFcmToken, payload)
        })
        .then(res => {
          console.log("Sent Successfully", res);
          return res;
        })
        .catch(err => {
          console.log(err);
        });

});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
