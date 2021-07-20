import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonContent } from '@ionic/angular';
import { TimeTrackerComponent } from '../time-tracker.component';

@Component({
  selector: 'app-time-track-page',
  templateUrl: './time-track-page.component.html',
  styleUrls: ['./time-track-page.component.scss'],
})
export class TimeTrackPageComponent implements OnInit {

  @ViewChild('timeTracker')
  private timeTracker : TimeTrackerComponent;

  @ViewChild('content')
  private content : IonContent;

  public topScroll : number = 0;
  constructor(public actionSheetController: ActionSheetController) {}

  async ngOnInit(){
  }



  async doRefresh(event : any){
    await this.timeTracker.refresh();
    event.target.complete();
  }

  showTrackerStatistics(){
    this.timeTracker.showStatistics();
  }

  onScroll(event: any){
    this.topScroll = event.detail.scrollTop;
    if(this.topScroll < 100){
      this.timeTracker.resetLoaded();
    }
}

resetScroll(){
  this.content.scrollToTop(200);
  this.timeTracker.resetLoaded();
}
}
