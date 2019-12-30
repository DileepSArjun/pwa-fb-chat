import { Injectable } from '@angular/core';

import { BehaviorSubject, from } from 'rxjs';
import { take } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireMessaging   } from '@angular/fire/messaging';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  //messaging = firebase.messaging();
  currentMessage = new BehaviorSubject(null);

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private afMessaging: AngularFireMessaging
  ) { }

  updateToken(token) {
    this.afAuth.authState.pipe(take(1)).subscribe(user => {
      if (!user) return;

      const data = { [user.uid]: token }
      this.db.object('fcmTokens/').update(data)
    })
  }

  getPermission() {
      this.afMessaging.requestPermission
        .subscribe(
          () => {
            console.log('Notification permission granted.');
            return this.afMessaging.getToken
              .subscribe(
                token => {
                  console.log(token)
                  this.updateToken(token);
                }
              );
          },
          (error) => console.log('Unable to get permission to notify.', error)
        );
  }

  receiveMessage() {
    this.afMessaging.messages
      .subscribe((message) => { 
        debugger;
        this.currentMessage.next(message);
       });
  }
}
