import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";

import { Subscription } from "rxjs";
import { map } from "rxjs/operators";

import { Contact } from "../contact.model";
import { ContactService } from "../../contacts/contact.service";
import { AuthService } from '../../auth/auth.service';
import { mimeType } from "../mime.validator";

@Component({
  selector: 'app-edit-contact',
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.css']
})
export class EditContactComponent implements OnInit {

  form: FormGroup;
  contactID: string;
  contact: Contact;
  imagePreview ="../../../assets/images/ImageUploader.jpg";
  userIsAuthenticated = false;
  private authListenerSubs: Subscription;
  private enrichAPI: Subscription;

  constructor(private authService: AuthService, public route: ActivatedRoute, private contactService: ContactService, public router: Router) {}

  ngOnInit() {
      this.userIsAuthenticated = this.authService.getIsAuth();
      this.authListenerSubs = this.authService
        .getAuthStatusListener()
        .subscribe(isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated;
        });

      this.form = new FormGroup({
        fname: new FormControl(null, { validators: [Validators.required, Validators.minLength(3)]} ),
        lname: new FormControl(null, { validators: [Validators.required, Validators.minLength(3)]} ),
        email: new FormControl(null, { validators: [Validators.required, Validators.email]} ),
        phone: new FormControl(null, { validators: [Validators.required]} ),
        org: new FormControl({value: "N/A", disabled: true}),
        title: new FormControl({value: "N/A", disabled: true}),
        desc: new FormControl({value: "N/A", disabled: true}),
        image: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType]} )
      });  

      this.route.paramMap.subscribe((paramMap: ParamMap) => {
        if (paramMap.has("contactId")) {
          this.contactID = paramMap.get("contactId");
          this.contactService.getContact(this.contactID).subscribe(postData => {
            this.contact = {
              _id: postData._id,
              fname: postData.fname,
              lname: postData.lname,
              email: postData.email,
              phone: postData.phone,
              org: postData.org,
              title: postData.title,
              desc: postData.desc,
              image: postData.image,
              creator: postData.creator
            };
            this.form.setValue({
              fname: this.contact.fname,
              lname: this.contact.lname,
              email: this.contact.email,
              phone: this.contact.phone,
              org: this.contact.org,
              title: this.contact.title,
              desc: this.contact.desc,
              image: this.contact.image,
            });
            this.imagePreview = this.contact.image;
          });
        } 
        else {  
          this.router.navigate(["/"]);
        }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  getEnrichApi() {
    if(this.form.get("email").value==null){
      return;
    }
    var mail = this.form.get("email").value;
    this.contactService.getEnrichApiInfo(mail)
    
    this.enrichAPI = this.contactService.getApiUpdateListener()
    .subscribe((postData) => {

      if(postData.info.title) { 
        this.form.patchValue({ title: postData.info.title }); 
      }
      else { 
        this.form.patchValue({ title: "N/A" }); 
      }

      if(postData.info.organization) { 
        this.form.patchValue({ org: postData.info.organization }); 
      }
      else { 
        this.form.patchValue({ org: "N/A" }); 
      }

      if(postData.info.bio) { 
        this.form.patchValue({ desc: postData.info.bio }); 
      } 
      else { 
        this.form.patchValue({ desc: "N/A" }); 
      }

      if(postData.info.avatar) { 
        this.form.patchValue({ image: postData.info.avatar }); 
        this.imagePreview = postData.info.avatar;
      }
      else {
        if(this.imagePreview != "../../../assets/images/ImageUploader.jpg") {
          this.imagePreview = "../../../assets/images/ImageUploader.jpg"
        } 
      }

    });
  }

  onUpdateContact() {
    if(this.form.invalid){
      return;
    }
    this.contactService.onUpdateContact(this.contact._id, this.form.getRawValue());
  }

}
