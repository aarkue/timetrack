import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'

import { Plugins } from '@capacitor/core';
import { Appwrite } from 'appwrite';
import { UserNotifierService } from '../notifier/user-notifier.service';

const { Storage } = Plugins;


@Injectable({
  providedIn: 'root',
})


export class AccountService {


  private account : any | undefined;

  private prefs : any;

  private appwrite : Appwrite;

  constructor(private userNotifier : UserNotifierService) {
    this.setUpApi();
  }

  setUpApi(){
    this.appwrite = new Appwrite();
    this.appwrite.setEndpoint(environment.API_ENDPOINT);
    this.appwrite.setProject(environment.API_PROJECT);
  }

  async login(email: string, password: string) : Promise<boolean> {
    const prom =  this.appwrite.account.createSession(email,password);
    const res = await this.userNotifier.notifyForPromise(prom,"Login");
    if(res.success){
      this.updateAcc();
    }
    return res.success;
  }
  

  async loginWithGoogle() {
    const oathSession =  this.appwrite.account.createOAuth2Session("google",environment.BASE_URL+"/settings?oauth=1",environment.BASE_URL+"/settings?oauth=-1")
    console.log("Created new oathSession", oathSession);
  }



  async logout(): Promise<boolean> {
    const delSessionProm = this.appwrite.account.deleteSession('current');
    const delSessionRes = await this.userNotifier.notifyForPromise(delSessionProm,"Logout");
    this.account = undefined;
    return delSessionRes.success;
  }

  async register( email: string, password: string): Promise<boolean> {
    const createProm = this.appwrite.account.create(email,password,email.split('@')[0]);
    const createRes = await this.userNotifier.notifyForPromise(createProm,"Registration");
    if(createRes.success){
      await this.login(email,password);
      this.updateAcc();
    }
    return createRes.success;
  }

  async startEmailVerification() : Promise<boolean>{
    const prom =  this.appwrite.account.createVerification(environment.BASE_URL+"/register?verification=1")
    const res = await this.userNotifier.notifyForPromise(prom,"Starting email verification");
    return res.success;
  }

  async verifyEmail(userid: string, secret: string) : Promise<boolean>{
    const veriProm = this.appwrite.account.updateVerification(userid,secret);
    const veriRes = await this.userNotifier.notifyForPromise(veriProm,"Email confirmation");
    return veriRes.success;
  }

  async startPasswordRecovery(email : string) : Promise<boolean>{
    const prom = this.appwrite.account.createRecovery(email,environment.BASE_URL+"/password-recovery");
    const res = await this.userNotifier.notifyForPromise(prom,"Starting password recovery","Please check your emails.");
    return res.success;
  }

  async completePasswordRecovery(userid : string, secret: string, password: string, passwordRepeat: string) : Promise<boolean>{
    const prom = this.appwrite.account.updateRecovery(userid, secret, password, passwordRepeat);
    const res = await this.userNotifier.notifyForPromise(prom,"Password recovery");
    this.updateAcc();
    return res.success;
  }

  isLoggedIn(): boolean {
    return this.account!= undefined;
  }

  async updateAcc() {
    this.appwrite.account.get()
    .then((acc) => {
      this.account = acc;
    })
    .catch((error) => this.account = undefined)

  }

  getAcc(): any | undefined {
    return this.account;
  }

  getUsername(): string {
    if(this.account){
      return this.account.username;
    } else {
      return 'Not logged in.';
    }
  }

  getEmail(): string {
    if(this.account){
      return this.account.email;
    } else {
      return 'Not logged in.';
    }
  }

}