import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FilesystemDirectory, FilesystemEncoding, FileWriteOptions, FileWriteResult, Plugins } from '@capacitor/core';
import { IonInput, Platform, ToastController } from '@ionic/angular';
import { AccountService } from '../services/account.service';
const { Storage, Directory, Encoding, Filesystem, Share } = Plugins;
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


  async importFile(){
    // if (true || !this.platform.is('hybrid')) {
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
          header: "Import successful! Refresh app to see changes.",
          position: "middle",
          color: "success",
          duration: 1500,
          buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
        });
        toastNot.present();
        this.fileInput.nativeElement.value = ""

      }
      reader.onerror = async (evt) => {
        const toastNot = await  this.toastController.create({
          header: "Import failed",
          position: "middle",
          color: "danger",
          duration: 3000,
          buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
        });

        const toastFail = await  this.toastController.create({
          header: "Import failed! Could not read file.",
          position: "middle",
          color: "danger",
          buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
        });
        toastFail.present();
      }

      reader.readAsText(file);
    }else{
      
      const toastFail = await  this.toastController.create({
        header: "Import failed! Please select a file.",
        position: "middle",
        color: "warning",
        buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
      });
      toastFail.present();
    }
  // }else{
  //   let perRes = await Filesystem.requestPermissions();
  //   console.log("Permission", perRes);
  //   const res = await Filesystem.readFile({
  //     path:"smartime.json",
  //     encoding: FilesystemEncoding.UTF8,
  //     directory: FilesystemDirectory.External
  //   });
  // let res_json = JSON.parse(res.data);
  // for(const key in res_json){
  //   if(this.localKeys.indexOf(key) > -1){
  //     await Storage.set({key: key, value: res_json[key]})
  //   }
  // }
  // }

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

    let url = URL.createObjectURL(toExport);
    if (!this.platform.is('hybrid')) {
      this.exportDownload.nativeElement.href = url;
      this.exportDownload.nativeElement.download = "smartime.json"
      this.exportDownload.nativeElement.click();
    }else{
      let blobText = await toExport.text();
      console.log("blobtext:",blobText);

      // this.socialSharing.shareWithOptions({files: blobText, subject: "Save data"}).then((res) => {
      //   console.log("SHARE",res);
      // })

      let perRes = await Filesystem.requestPermissions();
      console.log("Permission", perRes);
      const res : FileWriteResult = await Filesystem.writeFile({
        data: blobText,
        path:"smartime.json",
        encoding: FilesystemEncoding.UTF8,
        directory: FilesystemDirectory.External
    });
    console.log("URI",res.uri);
    let shareRes = await Share.share({  title: 'See cool stuff',
    url: res.uri,
    dialogTitle: 'Share with buddies',});
    console.log(shareRes);
    }
    const toastNot = await  this.toastController.create({
      header: "Export successfull!",
      position: "middle",
      color: "success",
      duration: 1500,
      buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
    });
    await toastNot.present();
  }
}
