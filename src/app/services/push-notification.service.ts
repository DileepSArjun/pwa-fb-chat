import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { take } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor(
    private angularFireMessaging: AngularFireMessaging,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase
  ) {
    
  }

  subscribePermission = () => this.angularFireMessaging.messaging.subscribe(
    (messagingContext) => {
      messagingContext.onMessage = messagingContext.onMessage.bind(messagingContext);
      messagingContext.onTokenRefresh = messagingContext.onTokenRefresh.bind(messagingContext);
    }
  );

  requestPermission = () => this.angularFireMessaging.requestToken.subscribe(
    (token) => {
      //maintaining on db to send push notification to all users
      this.updateToken(token);
    },
    (error) => { console.error(error); }
  );

  updateToken(token) {
    this.afAuth.authState.pipe(take(1)).subscribe(user => {
      if (!user) return;

      const data = { [user.uid]: token }
      this.db.object('fcmTokens/').update(data)
    })
  }

  receiveMessage = () => this.angularFireMessaging.messages.subscribe(
    message => {
      console.log(message);
      new Notification(message['notification']['title'], {
              body: message['notification']['body']
      });
    }
  );

  pushNotificationToAllUsers(msg: any) {
    const key = environment.chatmessage.serverKey;

    let notification = {
      'title': `New Message - ${msg.userName}`,
      'body': msg.message,
      'icon': 'https://placeimg.com/250/250/people',
      'click_action': 'http://127.0.0.1:8080/chat'
    }; 

    //get the list of fcmTokens
    this.db.list('fcmTokens')
      .valueChanges()
      .subscribe(
        (tokenSnapShot) => {

          tokenSnapShot.forEach((value: string) => {
            const fcmToken = value;

            fetch('https://fcm.googleapis.com/fcm/send', {
              'method': 'POST',
              'headers': {
                'Authorization': 'key=' + key,
                'Content-Type': 'application/json'
              },
              'body': JSON.stringify({
                'notification': notification,
                'to': fcmToken
              })
            }).then(function(response) {
              console.log("Pushed notiication");
              console.log(response);
            }).catch(function(error) {
              console.error(error);
            });
          });
        },
        (error) => console.log(error)
      );
  }
}
