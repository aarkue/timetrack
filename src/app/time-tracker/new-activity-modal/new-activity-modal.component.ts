import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IconSelectorComponent } from 'src/app/icon-selector/icon-selector.component';
@Component({
  selector: 'app-new-activity-modal',
  templateUrl: './new-activity-modal.component.html',
  styleUrls: ['./new-activity-modal.component.scss'],
})
export class NewActivityModalComponent implements OnInit {

  public icon : string = "leaf"
  public label : string = ""
  public color : string = "#1f9e4b"
  constructor(private modalController : ModalController) { }

  ngOnInit() {}

  dismissModal(saveData: boolean = false){
    if(saveData){
    this.modalController.dismiss({label: this.label, icon: this.icon, color: this.color});
    }else{
      this.modalController.dismiss();
    }
  }

  async showIconPicker(){
    const modal = await this.modalController.create({
      component: IconSelectorComponent,
      componentProps : {label: this.label, icon: this.icon, color: this.color},
    });
    await modal.present()
  }

  setIcon(event : any){
    this.icon = event;
  }
  
}
