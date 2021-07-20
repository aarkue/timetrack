import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { NewActivityModalComponent } from './new-activity-modal/new-activity-modal.component';

import { TimeTrack } from './time-track'


import { StatisticsComponent } from './statistics/statistics.component';
import { TimeTrackerService } from './time-tracker.service';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss'],
})
export class TimeTrackerComponent implements OnInit {

  constructor(private modalController : ModalController, private alertController : AlertController, public timeTrackerService : TimeTrackerService, public dataService : DataService) { }

  ngOnInit() {
  }

  async refresh(){
    this.timeTrackerService.refresh();
  }


  async editTimeTrack(id: string){
    // 2021-07-02T19:53:13.026Z vs. 2021-07-02T19:52
    const timeTrack = this.timeTrackerService.getTimeTrackByID(id);
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
            // this.timeTrackerService.saveChanges();
          }
        }
      ]
    });
    await alert.present();
  }


  trackTimeTracked(index: number, g : {date: number, items: TimeTrack[]}){
    // console.log(g.date);
    return g.date;
  }



  public async showStatistics(){
    const modal = await this.modalController.create({
      component: StatisticsComponent,
      componentProps : {'activities': this.timeTrackerService.activities, 'timeTracked': this.timeTrackerService.timeTracked},
      cssClass: "fullscreenModal"
    });
    await modal.present()
  }
}
