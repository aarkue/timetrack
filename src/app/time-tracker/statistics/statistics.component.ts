import { Time } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LegendPosition } from '@swimlane/ngx-charts';
import { Activity } from '../activity';
import { TimeTrack } from '../time-track';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {

  public data = []

  public heatMapData = []

  public readonly BELOW = LegendPosition.Below;
  public timeOptions : string = "today";
  @Input('activities')
  private activities: Activity[];

  @Input('timeTracked')
  private timeTracked: Map<number,TimeTrack[]> = new Map<number,TimeTrack[]>();

  public  customColors : any = [];
  
  public customDateStart : string;
  public customDateEnd : string;

  public tagsActivated : Set<string> = new Set<string>();
  public tagsDeactived : Set<string> = new Set<string>();

  public filterTags : boolean = false;  

  private readonly rightActivity : (act: Activity) => ((a: TimeTrack, key: number) => boolean)
  = (act: Activity) => (a: TimeTrack, key: number) => a.activityID === act.id;
  private readonly rightActivityRunning : (act: Activity) => ((a: Activity) => boolean)
= (act: Activity) => (a: Activity) => a.id === act.id;

 private readonly days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(private modalController : ModalController) { }

  ngOnInit() {
    let startDate = new Date();
    startDate.setDate(startDate.getDate()-1);
    startDate.setHours(0);
    startDate.setMinutes(0);

    let endDate = new Date();
    endDate.setDate(startDate.getDate());
    endDate.setHours(23);
    endDate.setMinutes(59);

    this.customDateStart = startDate.toISOString();
    this.customDateEnd = endDate.toISOString();

    let oneIncluded = false;
    this.activities.forEach((act,) => {
      act.tags.forEach((tag,tagIndex)=> {
        if(oneIncluded){
          this.tagsDeactived.add(tag);
        }else{
          this.tagsActivated.add(tag);
          oneIncluded = true;
        }
      })
    })

    this.updateDataset();

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

  getDurationForActivityFiltered(filters : ((a: TimeTrack, b: number) => boolean)[], activityFilters : ((a: Activity) => boolean)[]){
    let duration = 0;
    this.timeTracked.forEach((val,key) => {
      val.forEach(tt => {
        let shouldInclude = true;
        filters.forEach((filter) => {
          shouldInclude = shouldInclude && filter(tt,key);
        });
        
        if(shouldInclude){
          duration += (tt.endDate - tt.startDate)/1000;
        }
      })
    });

    this.activities.forEach((act) => {
      let shouldInclude = true;
      activityFilters.forEach((filter) => {
        shouldInclude = shouldInclude && filter(act);
      });
      if(shouldInclude && act.startDate){
        duration += (Date.now()  - act.startDate)/1000;
      }
    });
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

  toggleActivated(tag : string){
    if(this.tagsActivated.has(tag)){
      this.tagsActivated.delete(tag);
      this.tagsDeactived.add(tag);
    }else{
      this.tagsDeactived.delete(tag);
      this.tagsActivated.add(tag);
    }
    this.updateDataset();
  }

  updateDataset(){
    this.data = [];
    this.customColors = [];
    if(this.timeOptions === "all"){
      this.activities.forEach((act) => {
        if(this.checkActivityTags(act)){
        const dur = this.getDurationForActivityFiltered([this.rightActivity(act)],[this.rightActivityRunning(act)])
        const min = (dur/60);
        if(min > 0){
          this.data.push({"name": act.label, "value": min});
          this.customColors.push({"name": act.label, "value": act.color});
        }
      }
      })
    }else if(this.timeOptions === "today"){
      const today = new Date(new Date().toDateString()).getTime();
      this.data = [];
      console.log(this.data);
      this.activities.forEach((act) => {
        if(this.checkActivityTags(act)){
        const dur = this.getDurationForActivityFiltered([this.rightActivity(act),(a: TimeTrack, key: number) =>  key === today],[this.rightActivityRunning(act)]);
        const min = (dur/60);
        console.log(act.label,dur,min,this.data);
        if(min > 0){
          this.data.push({"name": act.label, "value": min});
          this.customColors.push({"name": act.label, "value": act.color});
        }
      }
      })
    }else{
      const parsedStart = Date.parse(this.customDateStart);
      const parsedEnd = Date.parse(this.customDateEnd);
      const mini = Math.min(parsedStart,parsedEnd);
      const maxi = Math.max(parsedStart,parsedEnd);
      const now = Date.now();
      this.activities.forEach((act) => {
        if(this.checkActivityTags(act)){
        const dur = this.getDurationForActivityFiltered([this.rightActivity(act),(a: TimeTrack, key: number) => {return (a.startDate >= mini && a.endDate <= maxi)}],[this.rightActivityRunning(act),(a: Activity) => {return (a.startDate >= mini && now <= maxi)}]);
        const min = (dur/60);
        if(min > 0){
          this.data.push({"name": act.label, "value": min});
          this.customColors.push({"name": act.label, "value": act.color});
        }
      }
      });
    
    }
    this.updateHeatMapDataset();
  }

  checkActivityTags(act: Activity) : boolean{
    if(this.filterTags){
    const res = act.tags.filter((tag) => {
      console.log(this.tagsActivated.has(tag));
      return this.tagsActivated.has(tag);
    });
    console.log(act.tags);

    return res.length > 0;
  }else{
    return true;
  }
  }


  updateHeatMapDataset(){
    this.heatMapData = [];
    let weekData = [];
    let day: Date = new Date(new Date().toDateString());
    for(let i = 0; i < 7 * 4; i++){
      let thisDay = day.setDate(day.getDate()-1);
      let totalDayDur = 0;
      console.log(this.data);
      this.activities.forEach((act) => {
        if(this.checkActivityTags(act)){
        const dur = this.getDurationForActivityFiltered([this.rightActivity(act),(a: TimeTrack, key: number) =>  key === thisDay],[this.rightActivityRunning(act)]);
        const min = (dur/60);
        console.log(act.label,dur,min,this.data);
        if(min > 0){
          totalDayDur += min;
        }
      }
      })
      let dateString = this.days[new Date(thisDay).getDay()];
      weekData.push({name: dateString, value:totalDayDur})
      if((i+1)%7 === 0){
        this.heatMapData.push({name: "week" + Math.floor((i+1)/7),series: weekData});
        weekData = [];
      }
    }
    this.heatMapData.reverse();
    console.log(this.heatMapData)

  }

}
