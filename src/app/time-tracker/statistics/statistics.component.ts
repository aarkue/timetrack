import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Activity } from '../activity';
import { TimeTrack } from '../time-track';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {

  public data = []

  @Input('activities')
  private activities: Activity[];

  @Input('timeTracked')
  private timeTracked: Map<number,TimeTrack[]> = new Map<number,TimeTrack[]>();

  public  customColors : any = [];
  constructor(private modalController : ModalController) { }

  ngOnInit() {
    console.log(this.timeTracked);
    this.activities.forEach((act) => {
      this.data.push({"name": act.label, "value": (this.getDurationTodayForActivity(act.id)/60)})
      this.customColors.push({"name": act.label, "value": act.color})
      console.log((this.getTotalDurationForActivity(act.id)/60));
    })
  }


  dismissModal(){
    this.modalController.dismiss();
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


}
