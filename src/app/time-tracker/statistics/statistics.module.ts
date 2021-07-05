import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsComponent } from './statistics.component';
import { NgxChartsModule } from '@swimlane/ngx-charts'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [StatisticsComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    NgxChartsModule
  ],
  exports: [StatisticsComponent]
})
export class StatisticsModule { }
