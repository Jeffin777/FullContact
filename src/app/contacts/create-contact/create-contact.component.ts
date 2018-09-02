import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";

import { Subscription } from "rxjs";
import { map } from "rxjs/operators";

import { ContactService } from "../../contacts/contact.service";
import { AuthService } from '../../auth/auth.service';
import { mimeType } from "../mime.validator";

@Component({
  selector: 'app-create-contact',
  templateUrl: './create-contact.component.html',
  styleUrls: ['./create-contact.component.css']
})
export class CreateContactComponent implements OnInit {

  form: FormGroup;
  imagePreview ="../../../assets/images/ImageUploader.jpg";
  userIsAuthenticated = false;
  private authListenerSubs: Subscription;
  private enrichAPI: Subscription;

  constructor(private authService: AuthService, private contactService: ContactService, public router: Router) {}

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

  onCreateContact() {
    if(this.form.invalid){
      return;
    }
    this.contactService.onCreateContact(this.form.getRawValue());
  }

}
