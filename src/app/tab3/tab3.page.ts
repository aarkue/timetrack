import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FilesystemDirectory, FilesystemEncoding, FileWriteOptions, FileWriteResult, Plugins } from '@capacitor/core';
import { AlertController, IonInput, Platform, ToastController } from '@ionic/angular';
import { Appwrite } from 'appwrite';
import { environment } from 'src/environments/environment';
import { DataService } from '../data/data.service';
import { UserNotifierService } from '../notifier/user-notifier.service';
import { AccountService } from '../services/account.service';
import { TimeTrack } from '../time-tracker/time-track';
import { TimeTrackerService } from '../time-tracker/time-tracker.service';
const { Storage, Directory, Encoding, Filesystem, Share } = Plugins;

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})

export class Tab3Page implements OnInit{
  loginForm: UntypedFormGroup;

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
              public formBuilder: UntypedFormBuilder,
              platform : Platform,
              private route: ActivatedRoute,
              private router: Router,
              private alertController: AlertController,
              public dataService: DataService,
              private userNotifierService : UserNotifierService,
              private timeTrackerService : TimeTrackerService) {

    this.platform = platform;
    this.loginForm = formBuilder.group({
      email : ['', [Validators.required,Validators.email]],
      password : ['', [Validators.required, Validators.minLength(environment.MIN_PW_LENGTH),Validators.maxLength(environment.MAX_PW_LENGTH)]],
    })

    
  }
  async ngOnInit() {
    let queryParamMap = this.route.snapshot.queryParamMap;
    if(queryParamMap.has('oauth')){
      if(queryParamMap.get('oauth') == '-1'){
        const toastNot = await  this.toastController.create({
          header: "OAUTH Login failed",
          message: "Could not login. Please try again later.",
          position: "middle",
          color: "danger",
          duration: 4000,
          buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
        });
      toastNot.present();
      }else   if(queryParamMap.get('oauth') == '1'){
        const toastNot = await  this.toastController.create({
          header: "OAUTH Login successful",
          position: "middle",
          color: "success",
          duration: 2500,
          buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
        });
        toastNot.present();
      }

      this.router.navigate([],{queryParams: {'oauth': null}, queryParamsHandling: 'merge'});
    }
    await this.accountService.updateAcc();
    console.log(this.accountService.getAcc())
  }

  public async logIn(){
    this.loginForm.disable();
    const successfull = await this.accountService.login(this.loginForm.value["email"],this.loginForm.value["password"]);
    if(successfull){
      this.dataService.fetchPrefsFromServer();
      this.dataService.prefs['firstStart'] = false;
    }
    this.loginForm.enable();
  }

  public async googleLogin(){
    await this.accountService.loginWithGoogle(); 
  }



  public async logOut(){
    this.accountService.logout();
  }

  public async resetPassword(){
    const alert = await this.alertController.create({
      header: 'Reset your password',
      message: 'Enter your email and we will send you a link to reset your password.',
      inputs: [{type: 'email', name: 'email', label: 'Your account email address', placeholder: 'your@email.address'}],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: 'Confirm',
          handler: (data) => {
            console.log(data.email);
            this.accountService.startPasswordRecovery(data.email);
          },
        },
      ],
    });
    await alert.present();
  }


  async importFile(){
    // if (true || !this.platform.is('hybrid')) {
    let file = this.fileInput.nativeElement.files[0];
    if(file){
      let reader = new FileReader();
      reader.onload = async (evt) => {
        let res = JSON.parse(evt.target.result+"");
        if(res['dataVersion']){
          this.dataService.importJSON(res);
        }else{
          // Legacy import
        for(const key in res){
          if(this.localKeys.indexOf(key) > -1){
            if(key === "activities"){
              const activities = JSON.parse(res[key]) as any[];
              console.log(activities);
              for (let i = 0; i < activities.length; i++) {
                const act = activities[i];
                if(act['id']){
                  act['localID'] = act['id'];
                  act['id'] = undefined;
                }
                await this.dataService.createDocumentOffline('activities',act);
              }
            } else if(key === "timeTracked"){
                  // let timeTracked = (await this.getFromStorage('timeTracked')).value;
                const parsedTimeTracked = new Map<number,TimeTrack[]>(JSON.parse(res[key]));
                if(parsedTimeTracked){
                  console.log(parsedTimeTracked);
                  for (let k of parsedTimeTracked.keys()) {
                    const array = parsedTimeTracked.get(k)
                    for (let i = 0; i < array.length; i++) {
                      const e = array[i];
                      if(e['id']){
                        e['localID'] = e['id'];
                        e['id'] = undefined;
                      }
                      await this.dataService.createDocumentOffline('timetracked',e);
                    }
                  }
                }
            }else{
              await Storage.set({key: key, value: res[key]})
            }
          }
          }
                    
        }
        this.timeTrackerService.refresh();
        this.userNotifierService.notify("Import successful!","If you want to sync to the server, you need to click the 'Send to server' botton in 'Sync settings'","success");
        this.fileInput.nativeElement.value = ""

      }
      reader.onerror = async (evt) => {
        this.userNotifierService.notify("Import failed!"," Could not read file.","danger");
      }

      reader.readAsText(file);
    }else{
      this.userNotifierService.notify("Import failed!"," Please select a file.","danger");
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
    // let dict = {};
    // for (const key of this.localKeys){
    //   dict[key] = (await Storage.get({key: key})).value;
    // }
    // console.log(dict)

    let json = await this.dataService.exportToJSON();
    console.log(json);
    let toExport = new Blob([json],{type: 'text/plain'});

    let url = URL.createObjectURL(toExport);
    if (!this.platform.is('hybrid')) {
      this.exportDownload.nativeElement.href = url;
      this.exportDownload.nativeElement.download = "timetrack-"+new Date().toISOString()+".json"
      this.exportDownload.nativeElement.click();
    }else{
      let blobText = await toExport.text();
      console.log("blobtext:",blobText);

      let perRes = await Filesystem.requestPermissions();
      console.log("Permission", perRes);
      const res : FileWriteResult = await Filesystem.writeFile({
        data: blobText,
        path: "timetrack-"+new Date().toISOString()+".json",
        encoding: FilesystemEncoding.UTF8,
        directory: FilesystemDirectory.External
    });
    
    let shareRes = await Share.share({
    url: res.uri});

    console.log(shareRes);
    }
    this.userNotifierService.notify("Export successfull!","","success",true);
  }

  async deleteLocal(){
    await this.dataService.deleteAllFromLocal();
    this.timeTrackerService.refresh();
  }

  offlineModeChange(){
    this.dataService.saveOfflineModeSetting();
    this.timeTrackerService.refresh();
  }

  async doRefresh(event: any){
    await this.accountService.updateAcc();
    event.target.complete();
  }
}
