import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Activity } from '../activity';
import { TimeTrackerService } from '../time-tracker.service';
import { ActivityPopoverComponent } from '../activity-popover/activity-popover.component';
import { NewActivityModalComponent } from '../new-activity-modal/new-activity-modal.component';
import {v4 as uuidv4} from 'uuid';
import { DataService } from 'src/app/data/data.service';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss'],
})
export class ActivityListComponent implements OnInit {

  constructor(private modalController : ModalController, public timeTrackerService: TimeTrackerService, private popoverComponent : PopoverController, public dataService : DataService) { }

  ngOnInit() {}

  async onActivityButtonClick(activity: Activity){
    if(activity.startDate){
      this.timeTrackerService.addTimeTracked({localID: uuidv4(),activityID: activity.localID, startDate: activity.startDate, endDate: Date.now()})
      activity.startDate = null;
      await this.dataService.updateDocument("activities",activity)
      this.timeTrackerService.saveChanges();
    }else{
      activity.startDate = Date.now();
      await this.dataService.updateDocument("activities",activity)
      this.timeTrackerService.saveChanges();
    }
  }

  async onActivityButtonHold(comb : {activity: Activity, event : MouseEvent}){
    let popover =  await this.popoverComponent.create({
      component: ActivityPopoverComponent,
      translucent: true,
      event: comb.event
    });

    popover.onWillDismiss().then(async (res) => {
      if(res.data){
        if(res.data.delete){
          // let index = this.timeTrackerService.activities.indexOf(comb.activity);
          await this.dataService.deleteDocument('activities',comb.activity);
          this.timeTrackerService.refresh();
          // this.timeTrackerService.activities.splice(index,1);
        }else if(res.data.edit){
          this.editActivity(comb.activity);
        }
      }
      this.timeTrackerService.saveChanges();
    });

    await popover.present();
  }


  async addNewActivity(){
    const modal = await this.modalController.create({
      component: NewActivityModalComponent,
      componentProps : {},
    });
    modal.onWillDismiss().then(async (res) => {
      if(res.data){
      this.timeTrackerService.activities.set(res.data.activity.localID ,res.data.activity);
      // this.timeTrackerService.saveChanges();
      const id = await this.dataService.createDocument('activities',res.data.activity);
      console.log("Created activity with id:",id);
    }
    })
    await modal.present()
  }

  async editActivity(activity: Activity){
    const modal = await this.modalController.create({
      component: NewActivityModalComponent,
      componentProps : {activity: activity},
    });
    modal.onWillDismiss().then(async (res) => {
      if(res.data){
        activity = res.data.activity;
        const id = await this.dataService.updateDocument('activities',res.data.activity);
        // this.timeTrackerService.saveChanges();
    }
    })
    await modal.present()
  }


  trackByKeyValue(index :number, keyval : KeyValue<string,Activity>){
    return keyval.value.localID;
  }

}
