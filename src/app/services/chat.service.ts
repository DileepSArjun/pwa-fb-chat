import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { ChatMessage } from '../models/chat-message.model';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { PushNotificationService } from './push-notification.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  user: firebase.User;
  chatMessages: any;
  chatMessage: ChatMessage;
  userName: Observable<string>;

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private afMessaging: AngularFireMessaging,
    private pushService: PushNotificationService
  ) { 
    this.afAuth.authState.subscribe(auth => {
      if(auth) {
        this.user = auth;
      }

      this.getUser();
    });
  }

  getUser() {
    const path = `/users/${this.user.uid}`;

    this.db.object(path)
      .valueChanges()
      .subscribe(
        response => {
          this.userName = response['displayName'];
        },
        error => {
          console.log(error);
        }
      );
  }

  getUsers() {
    const path = '/users';
    return this.db.list(path).valueChanges();
  }

  sendMessage(msg: string) {
    const timeStamp = this.getTimeStamp();
    const email = this.user.email;

    let messageObj = {
      email: email,
      userName: this.userName,
      message: msg,
      timeSent: this.getTimeStamp()
    };

    this.chatMessages = this.getMessages();
    this.chatMessages.push(messageObj);

    this.pushService.pushNotificationToAllUsers(messageObj);

    console.log('Sent chat message!!!');
  }

  sendPushNotification(message: string) {
    const key = environment.chatmessage.serverKey;

    let notification = {
      'title': 'New Message',
      'body': message,
      'icon': 'firebase-logo.png',
      'click_action': 'http://127.0.0.1:8080/chat'
    };

    this.afMessaging.getToken.subscribe(
      token => {
        fetch('https://fcm.googleapis.com/fcm/send', {
          'method': 'POST',
          'headers': {
            'Authorization': 'key=' + key,
            'Content-Type': 'application/json'
          },
          'body': JSON.stringify({
            'notification': notification,
            'to': "dW79GB5j8V_cYChs9S_Lbu:APA91bHCzWwn2vc66j-xwegvpY_JuAOWfxk1hWknWRxcHWUeo_iomiC69vwooKEz03akiBfLscRmcnMc3ovVYrv4LTjDvsWhN3GzSMAfAacTVxNBkRA4Kjprpj7F_fRzpuXJAXtqS20A"
          })
        }).then(function(response) {
          console.log("Pushed notiication");
          console.log(response);
        }).catch(function(error) {
          console.error(error);
        })
      },
      error => console.log(error)
    );
  }

  getMessages(): any {
    // query to create our message feed binding
    return this.db.list('messages');
    // return this.db.list('messages', {
    //   query: {
    //     limitToLast: 25,
    //     orderByKey: true
    //   }
    // });
  }

  getTimeStamp() {
    const now = new Date();
    const date = now.getUTCFullYear() + '/' +
                 (now.getUTCMonth() + 1) + '/' +
                 now.getUTCDate();
    const time = now.getUTCHours() + ':' +
                 now.getUTCMinutes() + ':' +
                 now.getUTCSeconds();

    return (date + ' ' + time);
  }
}
