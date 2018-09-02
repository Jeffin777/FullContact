import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs'

import { environment } from '../../environments/environment';
import { User } from './auth.model';

const BACKEND_URL = environment.apiUserUrl;

@Injectable({ providedIn: "root" })

export class AuthService {

  private isAuthenticated = false;
  private token: string;
  private userID: string;
  private authStatusListener = new Subject<boolean>();

  constructor(public http: HttpClient, private router: Router) { }

  //Auth-Interceptor Functions
  getToken() {
    return this.token;
  }

  //Auth-Guard Functions
  getIsAuth() { 
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userID;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: User = {email: email, password: password};
    this.http.post(BACKEND_URL + "/signup", authData).subscribe(
      ()=>{
        this.router.navigate(["/login"]);
      },
      error => {
        this.authStatusListener.next(false);
      }
    );
  }

  onsite_login(email: string, password: string){
    const authData: User = {email: email, password: password};
    this.http.post<{token: string, userID: string}>(
      BACKEND_URL + "/login", authData).subscribe(
      response=> {
        if(response.token){
          this.isAuthenticated = true;
          this.token = response.token;
          this.userID = response.userID;
          this.authStatusListener.next(true);
          this.saveAuthData(this.token,this.userID);
          this.router.navigate(["/"]);
        }
      },
      error => {
          this.authStatusListener.next(false);
      }
    )
  }

  autoAuthUser(){
    const authInfo = this.getAuthData();
    if(!authInfo){
      return;
    }
    this.token = authInfo.token;
    this.userID = authInfo.userID;
    this.isAuthenticated = true;
    this.authStatusListener.next(true);
  }

  logout(){
    this.token = null;
    this.userID = null;
    this.isAuthenticated = null;
    this.authStatusListener.next(false);
    this.clearAuthData();
    this.router.navigate(["/login"])
  }

  // Private functions for Local Storage Management (Session Handling)

  private saveAuthData(token: string, userID: string){
    localStorage.setItem("token", token);
    localStorage.setItem("userID", userID);
  }

  private clearAuthData(){
    localStorage.removeItem("token");
    localStorage.removeItem("userID");
  }

  private getAuthData(){
    const token= localStorage.getItem("token");
    const userID= localStorage.getItem("userID");
    if(!token || !userID){
      return;
    }
    return {
      token: token, 
      userID: userID
    };
  }
}
