import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { ChatMessage } from '../models/chat-message.model';
import { Observable } from 'rxjs';

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
    private afAuth: AngularFireAuth
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

    this.chatMessages = this.getMessages();
    this.chatMessages.push({
      email: email,
      userName: this.userName,
      message: msg,
      timeSent: this.getTimeStamp()
    });

    console.log('Sent chat message!!!');
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
