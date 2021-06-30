import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { ModalController } from '@ionic/angular';
import { NewActivityModalComponent } from './new-activity-modal/new-activity-modal.component';
import { Activity } from './activity'
import { TimeTrack } from './time-track'

const { Storage } = Plugins;

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss'],
})
export class TimeTrackerComponent implements OnInit {

  public activities : Activity[] = [{label: "Study", icon:"library",color: "#454333"},{label: "Shopping",icon:'pricetag', color: "#214333"},{label: "Watch Lecture",icon:'play-circle', color: "#666333"},{label: "Read",icon:'book', color: "#932233"},{label: "House Duties", icon:'home', color: "#484373"}];

  public activeIndex : number = 2;

  public timeTracked : TimeTrack[] = []
  constructor(private modalController : ModalController) { }

  ngOnInit() {
    this.getFromStorage('timeTracked').then((res) => {
      this.timeTracked = JSON.parse(res.value);
      if(!this.timeTracked){
        this.timeTracked = [];
      }
    })
  }

  async addNewActivity(){
    const modal = await this.modalController.create({
      component: NewActivityModalComponent,
      componentProps : {},
    });
    modal.onWillDismiss().then((res) => {
      if(res.data){
      this.activities.push(res.data.activity)
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
    this.saveToStorage('timeTracked',JSON.stringify(this.timeTracked))
  }

  onActivityButtonClick(activity: Activity){
    if(activity.startDate){
      this.timeTracked.push({activity: activity, startDate: activity.startDate, endDate: Date.now()})
      this.saveDataToStorage();
      activity.startDate = undefined;
    }else{
      activity.startDate = Date.now();
    }
  }


}
