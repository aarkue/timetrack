/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import type { AfterViewInit, OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LegendPosition } from '@swimlane/ngx-charts';

import { Activity } from '../activity';
import { TimeTrack } from '../time-track';
import { StatisticsService } from './statistics.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  public data = [];

  public heatMapData = [];

  public readonly BELOW = LegendPosition.Below;

  public timeOptions: string = 'today';
  @Input('activities')
  private activities: Activity[];

  @Input('timeTracked')
  private timeTracked: Map<number, TimeTrack[]> = new Map<number, TimeTrack[]>();

  public customColors: any = [];

  public customDateStart: string;
  public customDateEnd: string;

  public tagsActivated: Set<string> = new Set<string>();
  public tagsDeactived: Set<string> = new Set<string>();

  public filterTags: boolean = false;

  constructor(private modalController: ModalController, public statisticsService: StatisticsService) {}

  ngOnInit(): void {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0);
    startDate.setMinutes(0);

    const endDate = new Date();
    endDate.setDate(startDate.getDate());
    endDate.setHours(23);
    endDate.setMinutes(59);

    this.customDateStart = startDate.toISOString();
    this.customDateEnd = endDate.toISOString();

    let oneIncluded = false;
    this.activities.forEach((act) => {
      if (act.tags) {
        act.tags.forEach((tag) => {
          if (oneIncluded) {
            this.tagsDeactived.add(tag);
          } else {
            this.tagsActivated.add(tag);
            oneIncluded = true;
          }
        });
      }
    });
  }

  toggleActivated(tag: string): void {
    if (this.tagsActivated.has(tag)) {
      this.tagsActivated.delete(tag);
      this.tagsDeactived.add(tag);
    } else {
      this.tagsDeactived.delete(tag);
      this.tagsActivated.add(tag);
    }
    this.updateDataset();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateDataset();
    }, 300);
  }

  dismissModal(): void {
    this.modalController.dismiss();
  }

  async updateDataset(): Promise<void> {
    this.data = [];
    this.customColors = [];
    if (this.timeOptions === 'all') {
      this.activities.forEach((act) => {
        if (this.statisticsService.checkActivityTags(act, this.tagsActivated, this.filterTags)) {
          const dur = this.statisticsService.getDurationForActivityFiltered(
            [this.statisticsService.rightActivity(act)],
            [this.statisticsService.rightActivityRunning(act)],
            this.timeTracked,
            this.activities
          );
          const min = dur / 60;
          const h = min / 60;
          if (h > 0) {
            this.data.push({ name: act.label, value: h });
            this.customColors.push({ name: act.label, value: act.color });
          }
        }
      });
    } else if (this.timeOptions === 'today') {
      const today = new Date(new Date().toDateString()).getTime();
      this.data = [];
      this.activities.forEach((act) => {
        if (this.statisticsService.checkActivityTags(act, this.tagsActivated, this.filterTags)) {
          const dur = this.statisticsService.getDurationForActivityFiltered(
            [this.statisticsService.rightActivity(act), (a: TimeTrack, key: number) => key === today],
            [this.statisticsService.rightActivityRunning(act)],
            this.timeTracked,
            this.activities
          );
          const min = dur / 60;
          const h = min / 60;
          if (h > 0) {
            this.data.push({ name: act.label, value: h });
            this.customColors.push({ name: act.label, value: act.color });
          }
        }
      });
    } else {
      const parsedStart = Date.parse(this.customDateStart);
      const parsedEnd = Date.parse(this.customDateEnd);
      const mini = Math.min(parsedStart, parsedEnd);
      const maxi = Math.max(parsedStart, parsedEnd);
      const now = Date.now();
      this.activities.forEach((act) => {
        if (this.statisticsService.checkActivityTags(act, this.tagsActivated, this.filterTags)) {
          const dur = this.statisticsService.getDurationForActivityFiltered(
            [
              this.statisticsService.rightActivity(act),
              (a: TimeTrack) => {
                return a.startDate >= mini && a.endDate <= maxi;
              },
            ],
            [
              this.statisticsService.rightActivityRunning(act),
              (a: Activity) => {
                return a.startDate >= mini && now <= maxi;
              },
            ],
            this.timeTracked,
            this.activities
          );
          const min = dur / 60;
          const h = min / 60;
          if (h > 0) {
            this.data.push({ name: act.label, value: h });
            this.customColors.push({ name: act.label, value: act.color });
          }
        }
      });
    }
    this.updateHeatMapDataset();
  }

  async updateHeatMapDataset(): Promise<void> {
    this.heatMapData = [];
    let weekData = [];
    const today = new Date(new Date().toDateString()).getTime();
    let day: Date = new Date(new Date().toDateString());

    const n = this.getNumDaysToShow();

    if (this.timeOptions === 'custom') {
      const woTimeDate = new Date(new Date(this.customDateEnd).toDateString());
      day = woTimeDate;
    }

    day.setDate(day.getDate() - n);
    let startOfWeekDate = day.getTime();
    for (let i = 0; i < n; i++) {
      const thisDay = day.setDate(day.getDate() + 1);
      const dayString = this.statisticsService.days[new Date(thisDay).getDay()];
      const dateString = new Date(thisDay).toDateString();
      if (thisDay <= today) {
        let totalDayDur = 0;
        this.activities.forEach((act) => {
          if (this.statisticsService.checkActivityTags(act, this.tagsActivated, this.filterTags)) {
            const dur = this.statisticsService.getDurationForActivityFiltered(
              [this.statisticsService.rightActivity(act), (a: TimeTrack, key: number) => key === thisDay],
              [
                this.statisticsService.rightActivityRunning(act),
                () => new Date(new Date(act.startDate).toDateString()).getDate() === thisDay,
              ],
              this.timeTracked,
              this.activities
            );
            const min = dur / 60;
            const h = min / 60;
            if (h > 0) {
              totalDayDur += h;
            }
          }
        });
        if (dayString === this.statisticsService.days[0]) {
          weekData.unshift({ name: dayString, value: totalDayDur, date: dateString });
          this.heatMapData.push({ name: startOfWeekDate, series: weekData });
          weekData = [];
        } else if (dayString === this.statisticsService.days[1]) {
          startOfWeekDate = thisDay;
          weekData.unshift({ name: dayString, value: totalDayDur, date: dateString });
        } else {
          weekData.unshift({ name: dayString, value: totalDayDur, date: dateString });
        }
      }
    }
    this.heatMapData.push({ name: startOfWeekDate, series: weekData });
  }

  formatHeatmapXAxis(data: any): string {
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = new Date(data);
    if (date.getDate() <= 7) {
      return monthsShort[date.getMonth()];
    } else {
      return monthsShort[date.getMonth()];
    }
  }

  calendarTooltipText(v: any): string {
    return `
      <span class="tooltip-label">${v.label} • ${v.cell.date}</span>
      <span class="tooltip-val">${Math.round(v.data * 10) / 10}</span>
    `;
  }

  getNumDaysToShow(): number {
    if (this.timeOptions === 'custom') {
      const day: Date = new Date(new Date(this.customDateStart).toDateString());
      const end: Date = new Date(new Date(this.customDateEnd).toDateString());
      const diffInMS = end.getTime() - day.getTime();
      const diffInDaysEst = diffInMS / (1000 * 60 * 60 * 24);
      return Math.max(diffInDaysEst, 1);
    } else if (this.timeOptions === 'all') {
      return 100;
    } else {
      return 30;
    }
  }
}
