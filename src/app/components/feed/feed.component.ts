import { Component, OnInit, OnChanges } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  feed: any;

  constructor(private chat: ChatService) {
    this.feed = this.chat.getMessages().valueChanges();
  }

  ngOnInit() {}

}
