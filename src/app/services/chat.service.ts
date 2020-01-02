import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { ChatMessage } from '../models/chat-message.model';
import { Observable, from } from 'rxjs';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { PushNotificationService } from './push-notification.service';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  user: firebase.User;
  chatMessages: any;
  chatMessage: ChatMessage;
  userName: Observable<string>;
  idb: any;

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

    this.idb = new Dexie('messages');
    this.idb.version(1).stores({
      tasks: "++id,email,message,timeSent,userName,userId"
    });
    this.idb.open();
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

  syncMessageWithFB(messageObj) {
    this.chatMessages = this.getMessages();
    this.chatMessages.push(messageObj);
    this.pushService.pushNotificationToAllUsers(messageObj);
  }

  syncMessageWithIDB(messageObj) {
    messageObj["userId"] = this.user.uid;
    this.idb.tasks.put(messageObj);
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

    //first writing the message to indexdb and then doinf sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {

      navigator
        .serviceWorker.ready
        .then(
          (reg) => {
            this.syncMessageWithIDB(messageObj);
            return reg.sync.register('outbox');
          }
        ).catch(() => {
          // system was unable to register for a sync,
          // this could be an OS-level restriction
          this.syncMessageWithFB(messageObj);
        });
    } else {
      // serviceworker/sync not supported
      this.syncMessageWithFB(messageObj);
    }
  }

  requestSync() {
    navigator.serviceWorker.ready.then(swRegistration => swRegistration.sync.register('sync_messages'));
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
