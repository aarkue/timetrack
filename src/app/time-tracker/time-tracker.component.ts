import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { NewActivityModalComponent } from './new-activity-modal/new-activity-modal.component';
import { Activity } from './activity'
import { TimeTrack } from './time-track'
import { ActivityPopoverComponent } from './activity-popover/activity-popover.component';
import {v4 as uuidv4} from 'uuid';
import { StatisticsComponent } from './statistics/statistics.component';
const { Storage } = Plugins;

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss'],
})
export class TimeTrackerComponent implements OnInit {

  public activities : Activity[] = [{label: "Study", icon:"library",color: "#454333",id: uuidv4(), tags: []},{label: "House Duties", icon:'home', color: "#484373", id: uuidv4(), tags: []}];

  public activeIndex : number = 2;

  public timeTracked : Map<number,TimeTrack[]> = new Map<number,TimeTrack[]>();

  public groupedTimeTracked : {date: number, items: TimeTrack[]}[] = [];

  constructor(private modalController : ModalController, private popoverComponent : PopoverController, private alertController : AlertController, private changeDetectorRef : ChangeDetectorRef) { }

  ngOnInit() {
    this.refresh();
  }

  async refresh(){
    let activities = (await this.getFromStorage('activities')).value;
    let parsedActivities = JSON.parse(activities);
    if(parsedActivities){
      this.activities = parsedActivities;
    }
    let timeTracked = (await this.getFromStorage('timeTracked')).value;
    let parsedTimeTracked = new Map<number,TimeTrack[]>(JSON.parse(timeTracked));
    if(parsedTimeTracked){
      console.log(parsedTimeTracked);
      this.timeTracked = parsedTimeTracked;
    }
    this.updateGrouped();
  }

  async addNewActivity(){
    const modal = await this.modalController.create({
      component: NewActivityModalComponent,
      componentProps : {},
    });
    modal.onWillDismiss().then((res) => {
      if(res.data){
      this.activities.push(res.data.activity);
      this.saveChanges();
    }
    })
    await modal.present()
  }

  async editActivity(activity: Activity){
    const modal = await this.modalController.create({
      component: NewActivityModalComponent,
      componentProps : {activity: activity},
    });
    modal.onWillDismiss().then((res) => {
      if(res.data){
        activity =res.data.activity;
        this.saveChanges();
    }
    })
    await modal.present()
  }

  async saveToStorage(key: string, value: string){
    await Storage.set({key: key, value: value});
  }

  getFromStorage(key: string){
    return Storage.get({key: key})
  }
  saveDataToStorage(){
    this.saveToStorage('activities',JSON.stringify(this.activities));
    this.saveToStorage('timeTracked',JSON.stringify(Array.from(this.timeTracked)));
  }

  onActivityButtonClick(activity: Activity){
    if(activity.startDate){
      this.addTimeTracked({id: uuidv4(),activityID: activity.id, startDate: activity.startDate, endDate: Date.now()})
      activity.startDate = undefined;
      this.saveChanges();
    }else{
      activity.startDate = Date.now();
      this.saveChanges();
    }
  }

  async onActivityButtonHold(comb : {activity: Activity, event : MouseEvent}){
    let popover =  await this.popoverComponent.create({
      component: ActivityPopoverComponent,
      translucent: true,
      event: comb.event
    });

    popover.onWillDismiss().then((res) => {
      if(res.data){
        if(res.data.delete){
          let index = this.activities.indexOf(comb.activity);
          this.activities.splice(index,1);
        }else if(res.data.edit){
          this.editActivity(comb.activity);
        }
      }
      this.saveChanges();
    });

    await popover.present();
  }
  
  deleteTimeTrack(id: string){
    const keyAndID = this.getKeyAndIndexForID(id);
    this.timeTracked.get(keyAndID.key).splice(keyAndID.index,1)
    if(this.timeTracked.get(keyAndID.key).length < 1){
      this.timeTracked.delete(keyAndID.key);
    }
    this.saveChanges();
  }

  getTimeTrackByID(id: string){
    const keyAndID = this.getKeyAndIndexForID(id);
    return this.timeTracked.get(keyAndID.key)[keyAndID.index];
  }

  getKeyAndIndexForID(id: string) : {key: number, index: number} {
    for (let key of this.timeTracked.keys()){
      let items = this.timeTracked.get(key);
      for(let i = 0; i < items.length; i++){
        if(items[i].id === id){
          return {key: key, index: i};
        }
      }
    }
    return {key: null, index: -1};
  }

  getActivityIndexByID(id: string) : number{
    for(let i = 0; i < this.activities.length; i++){
      if(this.activities[i].id === id){
        return i;
      }
    }
    return -1;
  }

  getActivityByID(id: string) : Activity{
    const index = this.getActivityIndexByID(id);
    if(index < 0){
      return {id: "0",label: "Deleted Activity", color:"#000", icon: "question-mark", tags: []}
    }else{
      return this.activities[index];
    }
  }
  

  async editTimeTrack(id: string){
    // 2021-07-02T19:53:13.026Z vs. 2021-07-02T19:52
    const timeTrack = this.getTimeTrackByID(id);
    let alert = await this.alertController.create({
      header: "Label",
      inputs: [
        { 
          name: "label",
          type: "text",
          value: timeTrack.activityID
        },
        { 
          name: "icon",
          type: "text",
          value:  timeTrack.activityID
        }
      ],
      buttons: [
        {
          text: "Save",
          handler: (data) => {
            // console.log(Date.parse(data.startDate+":00.026Z"));
            // console.log(data);
            // this.timeTracked[index].activity.label = data.label;
            // this.timeTracked[index].activity.icon = data.icon;
            this.saveChanges();
          }
        }
      ]
    });
    await alert.present();
  }

  getFormattedDuration(start: number, end: number = Date.now()){
    let difSec = (end-start)/1000;
    let m = (difSec-(difSec%60))/60;
    let h = (m-(m%60))/60;
    if(h > 0){
      return `${h}h ${m%60}m`;
    }else{
      return `${m%60}m`;
    }

  }


  getLocalIsoDatetime(time: number){
    // console.log(Date.parse( new Date(time).toISOString()));
    return new Date(time).toISOString();
  }

  getNumberFromIsoDatetime(iso: string){
    // console.log(Date.parse(iso));
    return Date.parse(iso);
  }

  setStartDateByID(id : string,date: number){
    const timeTrack = this.getTimeTrackByID(id);

    this.deleteTimeTrack(id);
    
    timeTrack.startDate = date;
    this.addTimeTracked(timeTrack);
    this.saveChanges();
  }

  setEndDateByID(id : string,date: number){
    const timeTrack = this.getTimeTrackByID(id);

    this.deleteTimeTrack(id);

    timeTrack.endDate = date;
    this.addTimeTracked(timeTrack);
    this.saveChanges();
  }

  trackTimeTracked(index: number, g : {date: number, items: TimeTrack[]}){
    // console.log(g.date);
    return g.date;
  }

  saveChanges(){
    this.saveDataToStorage();
    this.updateGrouped();
  }

  addTimeTracked(item: TimeTrack){
    let startDateTime = new Date(item.startDate)
    let startDate = new Date(startDateTime.toDateString()).getTime();
    if(!this.timeTracked.has(startDate)){
      this.timeTracked.set(startDate,[])
      }
      this.timeTracked.get(startDate).push(item);
      this.timeTracked.get(startDate).sort(function(a,b,){
        if(a.startDate < b.startDate){
          return 1;
        }else if (a.startDate > b.startDate){
          return -1;
        }else{
          return 0;
        }
      })
      // this.updateGrouped();
  }

  async updateGrouped() {
    const items: {date: number, items: TimeTrack[]}[] = [];
    // const byDates: Map<string,TimeTrack[]> = new Map<string,TimeTrack[]>();
    // this.timeTracked.forEach(item => {
    //   let dateString = new Date(item.startDate).toISOString().split('T')[0];
    // if(!byDates.has(dateString)){
    //   byDates.set(dateString,[])
    //   }
    //   byDates.get(dateString).push(item)
    // });

    for(let date of this.timeTracked.keys()){
      if(this.timeTracked.has(date)){
        items.push({
          date: date,
          items: this.timeTracked.get(date)
        });
      }
    }
    items.sort(function(a,b){
      if(a.date < b.date){
        return 1;
      }else if(a.date > b.date){
        return -1;
      }else{
        return 0;
      }
    });

    this.groupedTimeTracked = items;
  }



  getTotalDurationForActivity(id: string){
    let duration = 0;
    this.timeTracked.forEach((val,key) => {
      val.forEach(item => {
        if(item.activityID === id){
          duration += (item.endDate - item.startDate)/1000;
        }
      })
    });

    const startDate = this.getActivityByID(id).startDate;
    if(startDate){
      duration += (Date.now() - startDate)/1000;
    }

    return duration;
  }


  getDurationTodayForActivity(id: string){
    const today = new Date(new Date().toDateString()).getTime();
    let duration = 0;
    if(this.timeTracked.has(today)){
      this.timeTracked.get(today).forEach(item => {
        if(item.activityID === id){
          duration += (item.endDate - item.startDate)/1000;
        }
      })
    }

    const startDate = this.getActivityByID(id).startDate;
    if(startDate){
      duration += (Date.now() - startDate)/1000;
    }
    
    return duration;
  }


  formatDuration(durationSec: number){
    let m = (durationSec-(durationSec%60))/60;
    let h = (m-(m%60))/60;
  
    if(h >= 1){
      const hFrac = Math.floor(((m%60)/60)*10);
      return h.toString()+"."+ hFrac.toString()+'h';
    }else if(m >= 1){
      return m.toString()+'m'
    }else{
      return "";
    }
  }

  getRunningActivities(){
    return this.activities.filter((val) => val.startDate);
  }

  async showStatistics(){
    const modal = await this.modalController.create({
      component: StatisticsComponent,
      componentProps : {'activities': this.activities, 'timeTracked': this.timeTracked},
    });
    await modal.present()
  }
}
