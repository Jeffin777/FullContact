import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from '../auth/login/login.component';
import { SignupComponent } from '../auth/signup/signup.component';
import { HomeComponent } from '../contacts/home/home.component';
import { CreateContactComponent } from '../contacts/create-contact/create-contact.component';
import { EditContactComponent } from '../contacts/edit-contact/edit-contact.component';
import { AuthGuard } from "../auth/auth.guard";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "add", component: CreateContactComponent, canActivate: [AuthGuard] },
  { path: "edit/:contactId", component: EditContactComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  providers: [AuthGuard],
  declarations: []
})
export class AppRoutingModule { }
