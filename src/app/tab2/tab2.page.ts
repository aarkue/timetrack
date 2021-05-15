import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Picture } from '../models/picture';
import { PictureService } from '../services/picture.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  constructor(public pictureService: PictureService, public actionSheetController: ActionSheetController) {}

  async ngOnInit(){
    await this.pictureService.loadSaved();
  }

  async showActionSheet(pic: Picture, index : number){
    const actionSheet = await this.actionSheetController.create({
      header: "Pictures",
      buttons : [{
        text: "Delete",
        role: "destructive",
        icon: "trash",
        handler: () => {
          this.pictureService.deletePicture(pic,index);
        }
      },{
          text: "Close",
          role: "cancel",
          icon: "close",
          handler: () => {
          }
        }]
    });
    await actionSheet.present();
  }


}
