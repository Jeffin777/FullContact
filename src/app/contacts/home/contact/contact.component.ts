import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Contact } from '../../contact.model';
import { AuthService } from '../../../auth/auth.service';
import { ContactService } from '../../contact.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  p: number = 1;
  userID: string = '';
  contacts: Contact[] = [];
  userIsAuthenticated = false;
  private contactsSub: Subscription;
  private authListenerSubs: Subscription;

  constructor(private authService: AuthService, private contactsService: ContactService) {}

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.userID = this.authService.getUserId();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
    this.contactsService.getContacts(null)
    this.contactsSub = this.contactsService.getContactUpdateListener()
    .subscribe((postData: {contacts: Contact[]}) => {
      this.contacts = postData.contacts;
    });
  }

  delete_contact(contactId: string) {
      this.contactsService.deleteContact(contactId);
  }
}
