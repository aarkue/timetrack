import { Injectable } from '@angular/core';
import { Activity } from './activity';
import { TimeTrack } from './time-track';
import { DataService } from '../data/data.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeTrackerService {

  study_activity : Activity = {  localID: 'deafult_STUDY',
  label: 'Study',
  icon: 'book',
  color: '#FFF',
  startDate: undefined,
  tags: []}
  public activities : Map<string,Activity> = new Map<string, Activity>([['default_STUDY',this.study_activity]]); 
  
  public timeTracked : Map<number,TimeTrack[]> = new Map<number,TimeTrack[]>();

  public groupedTimeTracked : {date: number, items: TimeTrack[]}[] = [];

  public activitiesUpdated: Subject<void> = new Subject<void>();

  public timeTrackUpdated: Subject<void> = new Subject<void>();
  
  constructor(private dataService : DataService) {
    dataService.refreshNeeded.subscribe((reason : string) => this.refresh());
   }


  async refresh(){
    let parsedActivities = await this.dataService.fetchCollection('activities');
    if(parsedActivities){
      this.activities = parsedActivities;
      this.activitiesUpdated.next();
    }
    let rawTimeTracks = await this.dataService.fetchCollection('timetracked');
    this.timeTracked.clear();
    for(const timeTrack of rawTimeTracks.values()){
      this.addTimeTrackedLocally(timeTrack);
    }
    this.updateGrouped();
    this.timeTrackUpdated.next();
  }

  saveChanges(){
    this.saveDataToStorage();
    this.updateGrouped();
  }




  async updateGrouped() {
    const items: {date: number, items: TimeTrack[]}[] = [];

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


  saveDataToStorage(){
    // this.saveToStorage('activities',JSON.stringify(this.activities));
    // this.saveToStorage('timeTracked',JSON.stringify(Array.from(this.timeTracked)));
  }


  deleteTimeTrackLocally(id: string){
    const keyAndID = this.getKeyAndIndexForID(id);
    this.timeTracked.get(keyAndID.key).splice(keyAndID.index,1)
    if(this.timeTracked.get(keyAndID.key).length < 1){
      this.timeTracked.delete(keyAndID.key);
    }
  }

  deleteTimeTrack(id: string){
    this.dataService.deleteDocument('timetracked',this.getTimeTrackByID(id));
    this.deleteTimeTrackLocally(id);
  }

  getTimeTrackByID(id: string){
    const keyAndID = this.getKeyAndIndexForID(id);
    return this.timeTracked.get(keyAndID.key)[keyAndID.index];
  }

  getKeyAndIndexForID(id: string) : {key: number, index: number} {
    for (let key of this.timeTracked.keys()){
      let items = this.timeTracked.get(key);
      for(let i = 0; i < items.length; i++){
        if(items[i].localID === id){
          return {key: key, index: i};
        }
      }
    }
    return {key: null, index: -1};
  }

  getActivityByID(id: string) : Activity{
    if(this.activities.has(id)){
      return this.activities.get(id);
    }else{
      return {localID: "0",label: "Deleted Activity", color:"#000", icon: "help-outline", tags: []}
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

  async setStartDateByID(id : string,date: number){
    const timeTrack = this.getTimeTrackByID(id);
    timeTrack.startDate = date;

    await this.dataService.updateDocument("timetracked",this.getTimeTrackByID(id));
    
    this.deleteTimeTrackLocally(id);
    this.addTimeTrackedLocally(timeTrack);
    // this.saveChanges();
  }

  async setEndDateByID(id : string,date: number){
    const timeTrack = this.getTimeTrackByID(id);

    timeTrack.endDate = date;

    await this.dataService.updateDocument("timetracked",this.getTimeTrackByID(id));
    
    this.deleteTimeTrackLocally(id);
    this.addTimeTrackedLocally(timeTrack);
  }


  async addTimeTracked(item: TimeTrack){
      this.addTimeTrackedLocally(item);
      const res = await this.dataService.createDocument("timetracked",item);
      // if(res.success){
      //   this.refresh();
      // }
  }

  addTimeTrackedLocally(item: TimeTrack){
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

  getTimeTracksOfToday() : TimeTrack[]{
    const today = new Date(new Date().toDateString()).getTime();
    if(this.timeTracked.has(today)){
      return this.timeTracked.get(today);
    }else{
      return [];
    }
  }

  getTimeTracksOfDate(date: Date) : TimeTrack[]{
    const day = new Date(date.toDateString()).getTime();
    if(this.timeTracked.has(day)){
      return this.timeTracked.get(day);
    }else{
      return [];
    }
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
    return Array.from(this.activities.values()).filter((val) => val && val.startDate);
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

  editTimeTrack(id: string){
    
  }
}
