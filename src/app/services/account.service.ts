import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Acc } from '../models/acc';
import { APIResult } from '../models/api-result';
import { TodoService } from './todo.service';
import { WebRequestService } from './web-request.service';


import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private acc: Acc | undefined;

  constructor(private webReqServ: WebRequestService, private todoService : TodoService) {
    Storage.get({key: "acc"}).then((res) => {
      this.acc = JSON.parse(res.value);
      console.log(res);
      this.updateAcc();
    }).catch((reason) => {
      this.updateAcc();
    });
  }

  private postRegister(
    username: string,
    email: string,
    password: string
  ): Observable<Object> {
    return this.webReqServ.post('register', { username, email, password });
  }

  private getAccount() {
    return this.webReqServ.get('account');
  }

  private postLogin(username: String, password: String) {
    return this.webReqServ.post('login', { username, password });
  }
  private postLoginJWT(username: String, password: String) {
    return this.webReqServ.post('jwt/login', { username, password });
  }

  private getLogout() {
    return this.webReqServ.get('logout');
  }

  private getCurrtask() {
    return this.webReqServ.get('account/currtask');
  }

  private patchCurrtask(currTask: String) {
    return this.webReqServ.patch('account/currtask', { currTask });
  }

  private postChange(username: String, email: String){
    return this.webReqServ.patch('change-profile', { username, email });
  }

  //nach schema der todo-service methoden
  public setCurrTask(todoid: String) {
    return new Promise<APIResult<Acc>>((resolve) => {
      this.patchCurrtask(todoid).subscribe((res: any) => {
        resolve(res);
      });
    });
  }

  async login(username: string, pw: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.postLogin(username, pw)
        .toPromise()
        .then((res: any) => {
          if (res && 'success' in res && res.success === true) {
            this.acc = res.result;
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((e) => {
          resolve(false);
        });
    });
  }


  async loginJWT(username: string, pw: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.postLoginJWT(username, pw)
        .toPromise()
        .then(async (res: any) => {
          if (res && 'success' in res && res.success === true) {
            await Storage.set({key: "jwt", value: res.result.token});
            await this.updateAcc();
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((e) => {
          resolve(false);
        });
    });
  }
  

  async logout(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.getLogout().subscribe(async (res: any) => {
        if (res && 'success' in res && res.success === true) {
          await Storage.set({key: "jwt", value: ""});
          await Storage.set({key: "acc", value: JSON.stringify(null)});
          this.acc = null;
          resolve(true);
        } else {
          await Storage.set({key: "jwt", value: ""});
          await Storage.set({key: "acc", value: JSON.stringify(null)});
          this.acc = null;
          resolve(false);
        }
      });
    });
  }

  async register(
    username: string,
    email: string,
    pw: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.postRegister(username, email, pw).subscribe((res: any) => {
        resolve(res && 'success' in res && res.success === true);
      });
    });
  }

  isLoggedIn(): boolean {
    return this.acc != null;
  }

  async updateAcc(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      await this.webReqServ.updateJWT();
      this.getAccount().subscribe( async (res: any) => {
        if (res && 'success' in res && res.success === true) {
          this.acc = res.result;
          await Storage.set({key: "acc", value: JSON.stringify(res.result)});
          this.todoService.fetchData()
          resolve();
        }else{//not authenticated
          resolve();
        }
      });
    });
  }

  getAcc(): Acc | undefined {
    return this.acc;
  }

  getMoney(): number {
    if(this.acc){
      return this.acc.sweat
    }else{
      return 0;
    }
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

  async changeProfile(
    username: string,
    email: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.postChange(username, email).subscribe((res: any) => {
        resolve(res && 'success' in res && res.success === true);
      });
    });
  }

  getExperience(): number {
    if(this.acc){
      return this.acc.experience;
    }else{
      return 0;
    }
  }
}
