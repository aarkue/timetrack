import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { AccountService } from '../services/account.service';
import { GamificationService } from '../services/gamification.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  loginForm: FormGroup;

  constructor(public accountService : AccountService,
              public toastController: ToastController, 
              public formBuilder: FormBuilder,
              public gamificationService: GamificationService) {
    this.loginForm = formBuilder.group({
      username : ['', [Validators.required]],
      password : ['', [Validators.required]],
    })

    
  }

  public async logIn(){
    this.loginForm.disable();
    const logInRes = await this.accountService.loginJWT(this.loginForm.value["username"],this.loginForm.value["password"]);
    if(logInRes){
      this.loginForm.reset();
      const toastNot = await  this.toastController.create({
        header: "Login successful",
        position: "bottom",
        color: "success",
        duration: 1500,
        buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
      });
    toastNot.present();
    }else{
    const toastNot = await  this.toastController.create({
        header: "Login failed",
        message: "Could not login. Please check username and password or try again later.",
        position: "bottom",
        color: "danger",
        duration: 3000,
        buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
      });
    toastNot.present();
    }
    this.loginForm.enable();
  }


  public async logOut(){
    const logOutRes = await this.accountService.logout();
    if(logOutRes){
      const toastNot = await  this.toastController.create({
        header: "Logout successful",
        position: "bottom",
        color: "success",
        duration: 1500,
        buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
      });
    toastNot.present();
    }else{
    const toastNot = await  this.toastController.create({
        header: "Logout failed",
        position: "bottom",
        color: "danger",
        duration: 3000,
        buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
      });
    toastNot.present();
    }
  }

}
