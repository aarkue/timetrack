import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  constructor(private swUpdate : SwUpdate, public toastController: ToastController) {
    this.swUpdate.available.subscribe(async event => {
      const prom = await this.toastController.create({
        header: "New version available",
        duration: 10000,
        buttons: [{text: "Reload", icon: "refresh-outline", handler: () => {
          window.location.reload();
        }}],
      });
      prom.present();
    })
  }
}
