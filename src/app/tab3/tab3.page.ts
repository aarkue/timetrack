import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FilesystemDirectory, Plugins } from '@capacitor/core';
import { IonInput, Platform, ToastController } from '@ionic/angular';
import { AccountService } from '../services/account.service';
import { GamificationService } from '../services/gamification.service';

const { Storage, Filesystem  } = Plugins;
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  loginForm: FormGroup;

  private readonly localKeys : string[] = 
  // Time Tracker
  ["activities","timeTracked",
  // Pomodoro Options
      "shortBreakSeconds","longBreakSeconds","workSessionReward","showSeconds","showProgressBar","autoStart","autoFinish",
  // Pomodoro
      "timePassedBefore", "status", "paused", "pomodoros", "currDuration", "timerHistory"]

  @ViewChild('fileInputRef')
  public fileInput : ElementRef<HTMLInputElement>;

  @ViewChild('exportDownload')
  private exportDownload : ElementRef<HTMLAnchorElement>;

  private platform: Platform;
  
  constructor(public accountService : AccountService,
              public toastController: ToastController, 
              public formBuilder: FormBuilder,
              public gamificationService: GamificationService,
              platform : Platform) {

    this.platform = platform;
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
        position: "middle",
        color: "success",
        duration: 1500,
        buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
      });
    toastNot.present();
    }else{
    const toastNot = await  this.toastController.create({
        header: "Login failed",
        message: "Could not login. Please check username and password or try again later.",
        position: "middle",
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
        position: "middle",
        color: "success",
        duration: 1500,
        buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
      });
    toastNot.present();
    }else{
    const toastNot = await  this.toastController.create({
        header: "Logout failed",
        position: "middle",
        color: "danger",
        duration: 3000,
        buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
      });
    toastNot.present();
    }
  }


  importFile(){
    let file = this.fileInput.nativeElement.files[0];
    if(file){
      let reader = new FileReader();
      reader.onload = async (evt) => {
        let res = JSON.parse(evt.target.result+"");
        for(const key in res){
          if(this.localKeys.indexOf(key) > -1){
            await Storage.set({key: key, value: res[key]})
          }
        }
        const toastNot = await  this.toastController.create({
          header: "Import successful! Restart app to see changes.",
          position: "middle",
          color: "success",
          duration: 1500,
          buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
        });
      toastNot.present();
      }
      reader.onerror = async (evt) => {
        const toastNot = await  this.toastController.create({
          header: "Import failed",
          position: "middle",
          color: "danger",
          duration: 3000,
          buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
        });
      }

      reader.readAsText(file);

    }
  }

  async exportFile(){
    let dict = {};
    for (const key of this.localKeys){
      dict[key] = (await Storage.get({key: key})).value;
    }
    console.log(dict)
    let json = JSON.stringify(dict);
    console.log(json);
    let toExport = new Blob([json],{type: 'text/plain'});
    if (!this.platform.is('hybrid')) {
      this.exportDownload.nativeElement.href = URL.createObjectURL(toExport);
      this.exportDownload.nativeElement.download = "smartime.json"
      this.exportDownload.nativeElement.click();
    }else{
      let blobText = await toExport.text();
      console.log("blobtext:",blobText);
      Filesystem.appendFile({
        data: blobText,
        path:"smartime.json",
        directory: FilesystemDirectory.Documents
    }).then(c=> {
      console.log("Downloaded!")
    })}
    }

}
