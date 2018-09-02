import { Injectable } from '@angular/core';
import { FormGroup, NgForm, FormControlName } from "@angular/forms";
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Subject } from 'rxjs'
import { map } from "rxjs/operators";

import { environment } from '../../environments/environment';
import { Enrich } from './enrich.model';
import { Contact } from './contact.model';
import { NullVisitor } from '@angular/compiler/src/render3/r3_ast';

const BACKEND_URL = environment.apiContactUrl;

@Injectable({ providedIn: "root" })

export class ContactService {

  private contacts: Contact[] = [];
  private contactsUpdated = new Subject<{ contacts: Contact[] }>();
  private enrichAPIResults = new Subject<any>();

  constructor(public http: HttpClient, private router: Router) { }

  getContacts(search: string) {
    if(search){
      this.http.get<any>(BACKEND_URL + "/search/" + search)
      .subscribe(data => {
        this.contactsUpdated.next({
          contacts: data.contacts
        });
      });
    }
    else {
      this.http.get<any>(BACKEND_URL)
      .subscribe(data => {
        this.contactsUpdated.next({
          contacts: data.contacts
        });
      });
    }
  }

  getContactUpdateListener() {
    return this.contactsUpdated.asObservable();
  }

  getApiUpdateListener() {
    return this.enrichAPIResults.asObservable();
  }

  getContact(id: string) {
    return this.http.get<{
      _id: string;
      fname: string;
      lname: string;
      email: string;
      phone: number;
      org: string;
      title: string;
      desc: string;
      image: string;
      creator: string;
    }>(BACKEND_URL + "/" + id);
  }

  onCreateContact(form) {
    const postData = new FormData();
    postData.append("fname", form.fname);
    postData.append("lname", form.lname);
    postData.append("email", form.email);
    postData.append("phone", form.phone);
    postData.append("org", form.org);
    postData.append("title", form.title);
    postData.append("desc", form.desc);
    if (typeof form.image === "object") {
    postData.append("image", form.image, form.email);
    }
    else{
    postData.append("image", form.image);
    }
    this.http.post<{ message: string; contact: Contact }>(
        BACKEND_URL + "/create",
        postData
      )
      .subscribe(responseData => {
        this.router.navigate(["/"]);
      });
  }

  onUpdateContact(id: string, form) {

    let contactData: Contact | FormData;

    if (typeof form.image === "object") {
      contactData = new FormData();
      contactData.append("_id", id);
      contactData.append("fname", form.fname);
      contactData.append("lname", form.lname);
      contactData.append("email", form.email);
      contactData.append("phone", form.phone);
      contactData.append("org", form.org);
      contactData.append("title", form.title);
      contactData.append("desc", form.desc);
      contactData.append("image", form.image, form.email);
    } else {
      contactData = {
        _id: id,
        fname: form.fname,
        lname: form.lname,
        email: form.email,
        phone: form.phone,
        org: form.org,
        title: form.title,
        desc: form.desc,
        image: form.image,
        creator: null,
      };
    }

    this.http.put<{ message: string; contact: Contact }>(
        BACKEND_URL + "/update/" + id,
        contactData
      )
      .subscribe(responseData => {
        this.router.navigate(["/"]);
      });


  } 

  getEnrichApiInfo(email: string) {
    this.http.get<any>(BACKEND_URL + "/enrich/" + email)
    .subscribe((result) => {
      this.enrichAPIResults.next({
        info: result.info
      });
    });
  } 

  deleteContact(contactId: string) {
    this.http.delete(BACKEND_URL + "/delete/" + contactId)
    .subscribe(() => {
      this.getContacts(null);
    });
  } 
}
