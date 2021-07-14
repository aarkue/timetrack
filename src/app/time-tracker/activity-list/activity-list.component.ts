import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Activity } from '../activity';
import { TimeTrackerService } from '../time-tracker.service';
import { ActivityPopoverComponent } from '../activity-popover/activity-popover.component';
import { NewActivityModalComponent } from '../new-activity-modal/new-activity-modal.component';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss'],
})
export class ActivityListComponent implements OnInit {

  constructor(private modalController : ModalController, public timeTrackerService: TimeTrackerService, private popoverComponent : PopoverController) { }

  ngOnInit() {}

  onActivityButtonClick(activity: Activity){
    if(activity.startDate){
      this.timeTrackerService.addTimeTracked({id: uuidv4(),activityID: activity.id, startDate: activity.startDate, endDate: Date.now()})
      activity.startDate = undefined;
      this.timeTrackerService.saveChanges();
    }else{
      activity.startDate = Date.now();
      this.timeTrackerService.saveChanges();
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
          let index = this.timeTrackerService.activities.indexOf(comb.activity);
          this.timeTrackerService.activities.splice(index,1);
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
    modal.onWillDismiss().then((res) => {
      if(res.data){
      this.timeTrackerService.activities.push(res.data.activity);
      this.timeTrackerService.saveChanges();
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
        this.timeTrackerService.saveChanges();
    }
    })
    await modal.present()
  }

}
