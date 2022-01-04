import { Injectable } from '@angular/core';
import { Activity } from '../activity';
import { TimeTrack } from '../time-track';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  public readonly rightActivity: (act: Activity) => (a: TimeTrack, key: number) => boolean =
  (act: Activity) => (a: TimeTrack) =>
    a.activityID === act.localID;
    public readonly rightActivityRunning: (act: Activity) => (a: Activity) => boolean =
  (act: Activity) => (a: Activity) =>
    a.localID === act.localID;

    public readonly days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
public data = [];


  constructor() { }



  getTotalDurationForActivity(id: string, timeTracked: Map<number, TimeTrack[]>, activities: Activity[]): number {
    let duration = 0;
    timeTracked.forEach((val) => {
      val.forEach((item) => {
        if (item.activityID === id) {
          duration += (item.endDate - item.startDate) / 1000;
        }
      });
    });

    const startDate = this.getActivityByID(id,activities).startDate;
    if (startDate) {
      duration += (Date.now() - startDate) / 1000;
    }
    return duration;
  }

  getDurationTodayForActivity(id: string, timeTracked: Map<number, TimeTrack[]>, activities: Activity[]): number {
    const today = new Date(new Date().toDateString()).getTime();
    let duration = 0;
    if (timeTracked.has(today)) {
      timeTracked.get(today).forEach((item) => {
        if (item.activityID === id) {
          duration += (item.endDate - item.startDate) / 1000;
        }
      });
    }

    const startDate = this.getActivityByID(id,activities).startDate;
    if (startDate) {
      duration += (Date.now() - startDate) / 1000;
    }

    return duration;
  }

  getDurationForActivityFiltered(
    filters: ((a: TimeTrack, b: number) => boolean)[],
    activityFilters: ((a: Activity) => boolean)[],
    timeTracked: Map<number, TimeTrack[]>,
    activities: Activity[]
  ): number {
    let duration = 0;
    timeTracked.forEach((val, key) => {
      val.forEach((tt) => {
        let shouldInclude = true;
        filters.forEach((filter) => {
          shouldInclude = shouldInclude && filter(tt, key);
        });

        if (shouldInclude) {
          duration += (tt.endDate - tt.startDate) / 1000;
        }
      });
    });

    activities.forEach((act) => {
      let shouldInclude = true;
      activityFilters.forEach((filter) => {
        shouldInclude = shouldInclude && filter(act);
      });
      if (shouldInclude && act.startDate) {
        duration += (Date.now() - act.startDate) / 1000;
      }
    });
    return duration;
  }

  getActivityIndexByID(id: string, activities: Activity[]): number {
    for (let i = 0; i < activities.length; i++) {
      if (activities[i].localID === id) {
        return i;
      }
    }
    return -1;
  }

  getActivityByID(id: string, activities: Activity[]): Activity {
    const index = this.getActivityIndexByID(id, activities);
    if (index < 0) {
      return { localID: '0', label: 'Deleted Activity', color: '#000', icon: 'question-mark', tags: [] };
    } else {
      return activities[index];
    }
  }


  checkActivityTags(act: Activity, tagsActivated: Set<string>, filterTags: boolean): boolean {
    if (filterTags) {
      if (act.tags === undefined) {
        return false;
      }
      const res = act.tags.filter((tag) => {
        return tagsActivated.has(tag);
      });
      return res.length > 0;
    } else {
      return true;
    }
  }

  getDaysInMonth(month: number, year: number): number {
    // Day 0: Last day of last month
    return new Date(year, month - 1, 0).getDate();
  }


}
