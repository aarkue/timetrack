import { Component, Input, OnInit } from '@angular/core';
import { Activity } from '../time-tracker/activity';
import { StatisticsService } from '../time-tracker/statistics/statistics.service';
import { TimeTrack } from '../time-tracker/time-track';
import { TimeTrackerService } from '../time-tracker/time-tracker.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss'],
})
export class GoalsComponent implements OnInit {

  public currDurationsForGoals: number[] = [];
  public goals : {tag: string, goalDuration: number}[] = [{tag: 'uni', goalDuration: (60*3)}]
  
  constructor(public statisticsService: StatisticsService, private timeTrackerService: TimeTrackerService) { 
    setInterval(()=> this.refresh(),1000)
  }

  async ngOnInit() {

  }

  async refresh(){
    // await this.timeTrackerService.refresh();
    console.log(this.timeTrackerService.activities.values())
    this.goals.forEach((goal,index) => {
      this.currDurationsForGoals[index] = 0;
      for(let act of this.timeTrackerService.activities.values()){
        if(this.statisticsService.checkActivityTags(act,new Set<string>([goal.tag]),true)) {
          console.log(act.label + " is a match!")
          this.currDurationsForGoals[index] += this.statisticsService.getDurationTodayForActivity(act.localID,this.timeTrackerService.timeTracked,Array.from(this.timeTrackerService.activities.values()))
        }else{
          console.log(act.label + " is NOT a match!",act.tags)
        }
      }
    })
  }

  addNewGoal(){
    this.goals.push({tag: '', goalDuration: 60});
    this.currDurationsForGoals.push(0)
    this.refresh();
  }

  removeGoal(index: number){
    this.goals.splice(index,1);
    this.currDurationsForGoals.splice(index,1);
  }

}
