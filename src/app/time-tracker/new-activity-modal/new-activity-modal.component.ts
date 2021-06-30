import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IconSelectorComponent } from 'src/app/icon-selector/icon-selector.component';
import { Activity } from '../activity';
@Component({
  selector: 'app-new-activity-modal',
  templateUrl: './new-activity-modal.component.html',
  styleUrls: ['./new-activity-modal.component.scss'],
})
export class NewActivityModalComponent implements OnInit {


  public activity : Activity = { icon : "leaf",label : "", color :"#1f9e4b"}

  constructor(private modalController : ModalController) { }

  ngOnInit() {}

  dismissModal(saveData: boolean = false){
    if(saveData){
    this.modalController.dismiss({activity: this.activity});
    }else{
      this.modalController.dismiss();
    }
  }

  async showIconPicker(){
    const modal = await this.modalController.create({
      component: IconSelectorComponent,
    });
    await modal.present()
  }

  setIcon(event : any){
    this.activity.icon = event;
  }
  
}
