import { Time } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LegendPosition } from '@swimlane/ngx-charts';
import { Activity } from '../activity';
import { TimeTrack } from '../time-track';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit, AfterViewInit {

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
  = (act: Activity) => (a: TimeTrack, key: number) => a.activityID === act.localID;
  private readonly rightActivityRunning : (act: Activity) => ((a: Activity) => boolean)
= (act: Activity) => (a: Activity) => a.localID === act.localID;

  private readonly days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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


  }


  ngAfterViewInit(){
    setTimeout(() => {
      this.updateDataset();
    },300)
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
      if(this.activities[i].localID === id){
        return i;
      }
    }
    return -1;
  }

  getActivityByID(id: string) : Activity{
    const index = this.getActivityIndexByID(id);
    if(index < 0){
      return {localID: "0",label: "Deleted Activity", color:"#000", icon: "question-mark", tags: []}
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

  async updateDataset(){
    this.data = [];
    this.customColors = [];
    if(this.timeOptions === "all"){
      this.activities.forEach((act) => {
        if(this.checkActivityTags(act)){
        const dur = this.getDurationForActivityFiltered([this.rightActivity(act)],[this.rightActivityRunning(act)])
        const min = (dur/60);
        const h = (min/60);
        if(h > 0){
          this.data.push({"name": act.label, "value": h});
          this.customColors.push({"name": act.label, "value": act.color});
        }
      }
      })
    }else if(this.timeOptions === "today"){
      const today = new Date(new Date().toDateString()).getTime();
      this.data = [];
      this.activities.forEach((act) => {
        if(this.checkActivityTags(act)){
        const dur = this.getDurationForActivityFiltered([this.rightActivity(act),(a: TimeTrack, key: number) =>  key === today],[this.rightActivityRunning(act)]);
        const min = (dur/60);
        const h = (min/60);
        if(h > 0){
          this.data.push({"name": act.label, "value": h});
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
        const h = (min/60);
        if(h > 0){
          this.data.push({"name": act.label, "value": h});
          this.customColors.push({"name": act.label, "value": act.color});
        }
      }
      });
    
    }
    setTimeout(() => {
      this.updateHeatMapDataset();
    },200)
  }

  checkActivityTags(act: Activity) : boolean{
    if(this.filterTags){
    const res = act.tags.filter((tag) => {
      return this.tagsActivated.has(tag);
    });
    return res.length > 0;
  }else{
    return true;
  }
  }

  getDaysInMonth(month: number, year: number){
    // Day 0: Last day of last month
    return new Date(year,month-1,0).getDate();
  }

  async updateHeatMapDataset(){
    this.heatMapData = [];
    let weekData = [];
    const today = new Date(new Date().toDateString()).getTime();
    let day: Date = new Date(new Date().toDateString());

    const n = this.getNumDaysToShow();

    if(this.timeOptions === "custom"){
      const woTimeDate = new Date(new Date(this.customDateEnd).toDateString());
      day = woTimeDate;
    }



    day.setDate(day.getDate()-n);
    let startOfWeekDate = day.getTime();
    for(let i = 0; i < n; i++){
      let thisDay = day.setDate(day.getDate()+1);
      let dayString = this.days[new Date(thisDay).getDay()];
      let dateString = new Date(thisDay).toDateString();
      if(thisDay <= today){
      let totalDayDur = 0;
      this.activities.forEach((act) => {
        if(this.checkActivityTags(act)){
        const dur = this.getDurationForActivityFiltered(
          [this.rightActivity(act),(a: TimeTrack, key: number) =>  key === thisDay],
          [this.rightActivityRunning(act), (a => new Date(new Date(act.startDate).toDateString()).getDate() === thisDay )
          ]);
        const min = (dur/60);
        const h = (min/60);
        if(h > 0){
          totalDayDur += h;
        }
      }
      })
      if(dayString=== this.days[0]){
        weekData.unshift({name: dayString, value:totalDayDur, date: dateString})
        this.heatMapData.push({name: startOfWeekDate,series: weekData});
        weekData = [];
      }else if(dayString === this.days[1]){
        startOfWeekDate = thisDay;
        weekData.unshift({name: dayString, value:totalDayDur, date: dateString})
      }else{
        weekData.unshift({name: dayString, value:totalDayDur, date: dateString})
      }
    }
    }
    this.heatMapData.push({name: startOfWeekDate, series: weekData});

  }

  formatHeatmapXAxis(data: any){
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = new Date(data);
    if(date.getDate() <= 7 ){
      return monthsShort[date.getMonth()];
    }else{
      return monthsShort[date.getMonth()];
    }
  }

  calendarTooltipText(v: any): string {
    return `
      <span class="tooltip-label">${v.label} • ${v.cell.date}</span>
      <span class="tooltip-val">${Math.round(v.data*10)/10}</span>
    `;
  }

  getNumDaysToShow() : number{
    if(this.timeOptions === "custom"){
      let day: Date = new Date(new Date(this.customDateStart).toDateString());
      let end: Date = new Date(new Date(this.customDateEnd).toDateString());
      let diffInMS = end.getTime()-day.getTime();
      let diffInDaysEst = diffInMS / (1000 * 60 * 60 * 24);
      return Math.max(diffInDaysEst,1);
    }else if(this.timeOptions === "all"){
      return 100;
    }else{
      return 30;
    }
  }

}
