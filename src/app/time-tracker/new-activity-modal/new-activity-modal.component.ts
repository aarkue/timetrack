import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IconSelectorComponent } from 'src/app/icon-selector/icon-selector.component';
import { Activity } from '../activity';
import {v4 as uuidv4} from 'uuid';
@Component({
  selector: 'app-new-activity-modal',
  templateUrl: './new-activity-modal.component.html',
  styleUrls: ['./new-activity-modal.component.scss'],
})
export class NewActivityModalComponent implements OnInit {

  @Input('activity')
  public activity : Activity;

  public newActivity = false;

  private previousColor;
  private previousLabel;
  private previousIcon;
  constructor(private modalController : ModalController) { }

  ngOnInit() {
    if(!this.activity){
      this.newActivity = true;
      this.activity = { icon : "leaf",label : "", color :"#1f9e4b", localID: uuidv4(), tags: []}
    }else{
      this.previousColor = this.activity.color;
      this.previousLabel = this.activity.label;
      this.previousIcon = this.activity.icon;
    }
  }

  dismissModal(saveData: boolean = false){
    if(saveData){
    this.modalController.dismiss({activity: this.activity});
    }else{
      if(!this.newActivity){
        this.activity.color = this.previousColor;
        this.activity.label = this.previousLabel;
        this.activity.icon = this.previousIcon;
      }
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

  addTag(tag: string){
    if(!this.activity.tags){
      this.activity.tags = [];
    }
    if(tag && tag.length > 0){
      this.activity.tags.push(tag);
    }
  }
  
}
