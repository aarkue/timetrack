import { Injectable } from '@angular/core';
import { IonicSafeString, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UserNotifierService {

  private readonly POSITION :  "top" | "bottom" | "middle" = "middle";


  constructor(public toastController: ToastController) { }

  async notify(title: string, message: string, color: string, autoHide: boolean = false){
    const toastNot = await this.toastController.create({
      header: title,
      message: message,
      position: this.POSITION,
      color: color,
      duration: autoHide ? 2000 : undefined,
      buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
      mode: 'ios'
    });
    toastNot.present();
  }


  async notifyForPromise(promise : Promise<unknown>, name: string, additionalSuccessText = '') : Promise<{success: boolean, result : any}>{
    return new Promise((resolve) => {
      promise.then((res) => {
        this.notify(name + " was successfull.",additionalSuccessText,"success", true);
        resolve({success: true,result:res});
      },
      (err) => {
        console.log(name + " failed ",err)
        this.notify(name + " failed.",err.message ,"danger");
        resolve({success: false, result:err});
      })
    })
  }

  async notifyOnPromiseReject(promise : Promise<unknown>, name: string) : Promise<{success: boolean, result : any}>{
    return new Promise((resolve) => {
      promise.then((res) => {
        console.log("Silent Success:", name + " was successfull.", res);
        resolve({success: true,result:res});
      },
      (err) => {
        console.log(name + " failed ",err)
        this.notify(name + " failed.",err.message ,"danger");
        resolve({success: false, result:err});
      })
    })
  }

  notifyForPromiseFlag(promise : Promise<unknown>, name: string, notifyForSuccess : boolean) : Promise<{success: boolean, result : any}>{
    if(notifyForSuccess){
      return this.notifyForPromise(promise,name,"");
    }else{
      return this.notifyOnPromiseReject(promise,name);
    }

  }
}
