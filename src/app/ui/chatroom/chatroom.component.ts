import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { MessagingService } from 'src/app/services/messaging.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent implements OnInit, AfterViewChecked {
  @ViewChild('scroller', {static: false}) private feedContainer: ElementRef;

  constructor(
    private msgService: MessagingService,
    private pushNotifyService: PushNotificationService
  ) { }

  ngOnInit() {
    this.pushNotifyService.subscribePermission();
    this.pushNotifyService.requestPermission();
    this.pushNotifyService.receiveMessage();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    this.feedContainer.nativeElement.scrollTop
    = this.feedContainer.nativeElement.scrollHeight;
  }

}
