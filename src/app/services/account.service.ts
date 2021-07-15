import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'

import { Plugins } from '@capacitor/core';
import { Appwrite } from 'appwrite';

const { Storage } = Plugins;


@Injectable({
  providedIn: 'root',
})


export class AccountService {
  private acc: any | undefined;

  private appwrite : Appwrite;

  constructor() {
    this.setUpApi();
  }

  setUpApi(){
    this.appwrite = new Appwrite();
    this.appwrite.setEndpoint(environment.API_ENDPOINT);
    this.appwrite.setProject(environment.API_PROJECT);
  }

  async login(email: string, password: string) {
    const createSessionProm =  this.appwrite.account.createSession(email,password);
    createSessionProm.then((res) => {
      console.log("createSessionProm",res);
      this.updateAcc();
    },
    (err) => {
      console.log("Error during createSessionProm", err);
    })
  }
  async loginWithGoogle() {
    const oathSession =  this.appwrite.account.createOAuth2Session("google",environment.BASE_URL+"/settings?oauth=1",environment.BASE_URL+"/settings?oauth=-1")
    console.log("Created new oathSession", oathSession);
  }



  async logout() {
    const session : {sessions: {'$id': string}[]} = await this.appwrite.account.getSession('current');

    console.log("Logging out: ", session);

    session.sessions.forEach( async (s) => {
      const delRes = await this.appwrite.account.deleteSession(s.$id);
      console.log("Session delete result:", delRes,s.$id);
    } )

    this.acc = null;
    return true;
  }

  async register( email: string, password: string) {
    const createPromise = this.appwrite.account.create(email,password,email.split('@')[0]);
    createPromise.then( async (val) => {
      console.log("Account register: ",val);
      await this.login(email,password)
    },
    (err) => {
      console.log("Error creating account",err)}
      )
    
  }

  startEmailVerification(){
    this.appwrite.account.createVerification(environment.BASE_URL+"/register?verification=1").then((res) => {
      console.log("Email confirmation created",res);
    },
    (err) => {
      console.log("Error during email confirmation creation",err);
    })
  }

  verifyEmail(userid: string, secret: string){
    this.appwrite.account.updateVerification(userid, secret).then((res) => {
      console.log("Email confirmation finished",res);
    },
    (err) => {
      console.log("Error during email confirmation",err);
    })
  }

  isLoggedIn(): boolean {
    return this.acc != null;
  }

  async updateAcc() {
    try {
      this.acc = await this.appwrite.account.get();
    } catch (error) {
      this.acc = null;
    }
  }

  getAcc(): any | undefined {
    return this.acc;
  }

  getUsername(): string {
    if(this.acc){
      return this.acc.username;
    } else {
      return 'Please login';
    }
  }

  getEmail(): string {
    if(this.acc){
      return this.acc.email;
    } else {
      return 'Please login';
    }
  }

}