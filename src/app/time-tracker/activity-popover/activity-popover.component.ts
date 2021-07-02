import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-activity-popover',
  templateUrl: './activity-popover.component.html',
  styleUrls: ['./activity-popover.component.scss'],
})
export class ActivityPopoverComponent implements OnInit {

  constructor(private popoverController: PopoverController) { }

  ngOnInit() {}

  dismissPopover(){
    this.popoverController.dismiss();
  }

  dismissWithDelete(){
    this.popoverController.dismiss({delete: true});
  }

  dismissWithEdit(){
    this.popoverController.dismiss({edit: true});
  }

}
