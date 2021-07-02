import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit-current',
  templateUrl: './edit-current.component.html',
  styleUrls: ['./edit-current.component.scss'],
})
export class EditCurrentComponent implements OnInit {

  @Input() currDurationMin: number;
  @Input() timePassedMin: number;
  @Input() isBreak: boolean;
  @Input() pomodoros: number;


  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  public dismissModal(save : boolean = false){
    if(save){
      this.modalController.dismiss({
        currDurationMin: this.currDurationMin,
        timePassedMin: this.timePassedMin,
        isBreak: this.isBreak,
        pomodoros: this.pomodoros,
      });
    }else{
      this.modalController.dismiss();
    }
  
  }
}
