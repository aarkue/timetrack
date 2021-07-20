import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { AlertController, IonContent, ModalController, PopoverController } from '@ionic/angular';
import { NewActivityModalComponent } from './new-activity-modal/new-activity-modal.component';

import { TimeTrack } from './time-track'


import { StatisticsComponent } from './statistics/statistics.component';
import { TimeTrackerService } from './time-tracker.service';
import { DataService } from '../data/data.service';
import { Activity } from './activity';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss'],
})
export class TimeTrackerComponent implements OnInit, OnDestroy {


  private readonly INITIAL_LIMIT = 20;
  public limit : number = this.INITIAL_LIMIT;

  constructor(private modalController : ModalController, private alertController : AlertController, public timeTrackerService : TimeTrackerService, public dataService : DataService) { }
  
  ngOnDestroy(): void {
  }
  
  

  ngOnInit() {

  }

  async refresh(){
    this.timeTrackerService.refresh();
  }

  public async showStatistics(){
    const modal = await this.modalController.create({
      component: StatisticsComponent,
      componentProps : {'activities': this.timeTrackerService.activities, 'timeTracked': this.timeTrackerService.timeTracked},
      cssClass: "fullscreenModal"
    });
    await modal.present()
  }

  trackByActivitiy(act : Activity){
    return act.localID;
  }

  loadMore(event: any){
    event.target.complete()
    this.limit += 20;
    if(this.limit >= Number.MAX_SAFE_INTEGER){
        event.target.disabled = true;
      }
  }

  resetLoaded(){
    this.limit = this.INITIAL_LIMIT;
  }

  
}
