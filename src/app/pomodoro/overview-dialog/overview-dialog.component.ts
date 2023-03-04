import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TimeTrackerService } from 'src/app/time-tracker/time-tracker.service';

@Component({
  selector: 'app-overview-dialog',
  templateUrl: './overview-dialog.component.html',
  styleUrls: ['./overview-dialog.component.scss'],
})
export class OverviewDialogComponent implements OnInit {


  public activitiesWithDuration : {label: string, durationSec: number}[] = [];
  constructor(private modalController: ModalController, public timeTrackerService: TimeTrackerService) { }

  ngOnInit() {
    this.activitiesWithDuration = []
    for(const k of this.timeTrackerService.activities.keys()){
      const duration = this.timeTrackerService.getDurationTodayForActivity(k)
      if(duration > 0){
        this.activitiesWithDuration.push({durationSec: duration, label: this.timeTrackerService.activities.get(k).label})
      }
    }
    console.log("DONE!",this.timeTrackerService.activities);

  }

  public dismissModal(save : boolean = false){
    if(save){
      this.modalController.dismiss({
      });
    }else{
      this.modalController.dismiss();
    }
  
  }

}