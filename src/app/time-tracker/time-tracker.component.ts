import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NewActivityModalComponent } from './new-activity-modal/new-activity-modal.component';

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss'],
})
export class TimeTrackerComponent implements OnInit {

  public activities : {label: string, icon: string, color: string}[] = [{label: "Study", icon:"library",color: "#454333"},{label: "Shopping",icon:'pricetag', color: "#214333"},{label: "Watch Lecture",icon:'play-circle', color: "#666333"},{label: "Read",icon:'book', color: "#932233"},{label: "House Duties", icon:'home', color: "#484373"}];

  public activeIndex : number = 2;

  constructor(private modalController : ModalController) { }

  ngOnInit() {}

  async addNewActivity(){
    const modal = await this.modalController.create({
      component: NewActivityModalComponent,
      componentProps : {},
    });
    modal.onWillDismiss().then((res) => {
      if(res.data){
      this.activities.push({label: res.data.label, icon: res.data.icon, color:res.data.color})
    }
    })
    await modal.present()
  }
}
