import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { combineLatest, Observable, zip } from 'rxjs';
import { DataService } from '../data/data.service';
import { Activity } from '../time-tracker/activity';
import { StatisticsService } from '../time-tracker/statistics/statistics.service';
import { TimeTrack } from '../time-tracker/time-track';
import { TimeTrackerService } from '../time-tracker/time-tracker.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss'],
})
export class GoalsComponent implements OnInit, OnDestroy {
  public currDurationsForGoals: number[] = [];
  public goals: { tag: string; goalDuration: number }[] = [];

  public updateInterval: any;

  public allTags: string[] = [];
  constructor(
    public statisticsService: StatisticsService,
    private timeTrackerService: TimeTrackerService,
    private dataService: DataService,
    private alertController: AlertController
  ) {
    this.updateInterval = setInterval(() => this.refresh(), 1000);
  }

  async ngOnInit() {
    this.allTags = [];
    combineLatest([this.timeTrackerService.activitiesUpdated,this.dataService.refreshNeeded]).subscribe(() => {
      this.reload();
    });
  }

  reload(){
    this.loadGoals();
    for (const act of this.timeTrackerService.activities.values()) {
      if (act.tags) {
        act.tags.forEach((tag) => {
          if (this.allTags.indexOf(tag) < 0) {
            this.allTags.push(tag);
          }
        });
      }
    }
  }
  

  ngOnDestroy(): void {
    clearInterval(this.updateInterval);
    this.saveGoals();
  }

  async refresh() {
    this.goals.forEach((goal, index) => {
      this.currDurationsForGoals[index] = 0;
      for (let act of this.timeTrackerService.activities.values()) {
        if (this.statisticsService.checkActivityTags(act, new Set<string>([goal.tag]), true)) {
          this.currDurationsForGoals[index] += this.statisticsService.getDurationTodayForActivity(
            act.localID,
            this.timeTrackerService.timeTracked,
            Array.from(this.timeTrackerService.activities.values())
          );
        }
      }
    });
  }

  addNewGoal() {
    this.goals.push({ tag: '', goalDuration: 60 });
    this.currDurationsForGoals.push(0);
    this.saveGoals();
    this.refresh();
  }

  async saveGoals() {
    this.dataService.prefs['goals'] = this.goals;
    await this.dataService.savePrefs(this.dataService.prefs);
  }

  loadGoals() {
    if (this.dataService.prefs['goals']) {
      this.goals = this.dataService.prefs['goals'];
    }
  }

  removeGoal(index: number) {
    this.goals.splice(index, 1);
    this.currDurationsForGoals.splice(index, 1);
  }

  /**
   * Get duration in minutes
   * @param date in ISO 8601 format (base: 2000-01-01 00:00)
   * @returns number of minutes
   */
  convertToDuration(dateString: string): number {
    console.log(dateString);
    const date = new Date(dateString);
    return date.getMinutes() + date.getHours() * 60;
  }

  convertToDate(durationMin: number): string {
    if (isNaN(durationMin)) {
      return '2000-01-01T00:00';
    }
    const date = new Date('2000-01-01T00:00');
    const mins = durationMin % 60;
    const hours = Math.floor(durationMin / 60);
    date.setMinutes(mins);
    date.setHours(hours);
    return date.toISOString();
  }

  updateGoalDurationManually(index: number) {
    const mins = this.goals[index].goalDuration % 60;
    const hours = Math.floor(this.goals[index].goalDuration / 60);
    this.getManualTimeInput(hours, mins)
      .then((mins) => {
        this.goals[index].goalDuration = mins;
        this.saveGoals();
      })
      .catch((err) => {});
  }

  async getManualTimeInput(hourValue?: number, minuteValue?: number) {
    return new Promise<number>(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: 'Manually enter duration',
        message: 'Enter duration as hours and minutes',
        inputs: [
          { type: 'number', name: 'hours', placeholder: '1', max: 23, min: 0, value: hourValue },
          { type: 'text', name: 'hoursText', value: 'hour(s)', disabled: true },
          { type: 'number', name: 'minutes', placeholder: '30', max: 59, min: 0, value: minuteValue },
          { type: 'text', name: 'minutesText', value: 'minute(s)', disabled: true },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              reject();
            },
          },
          {
            text: 'Confirm',
            handler: (data) => {
              let minutes = 0;
              if (data.hours !== '') {
                minutes += 60 * parseFloat(data.hours);
              }
              if (data.minutes !== '') {
                minutes += parseFloat(data.minutes);
              }
              resolve(minutes);
            },
          },
        ],
      });
      await alert.present();
    });
  }
}
