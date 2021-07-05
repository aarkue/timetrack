import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Activity } from '../activity';

@Component({
  selector: 'app-activity-button',
  templateUrl: './activity-button.component.html',
  styleUrls: ['./activity-button.component.scss'],
})
export class ActivityButtonComponent implements OnInit {

  @Input('active')
  public active : boolean;

  @Input('activity')
  public activity : Activity;

  @Input('badgeText')
  public badgeText? : string;


  @Output('activityClick')
  private clickEmitter : EventEmitter<Activity> = new EventEmitter();

  @Output('activityHold')
  private holdEmitter : EventEmitter<{activity: Activity,event: MouseEvent}> = new EventEmitter();

  constructor() { }

  ngOnInit() {}

  onClicked(){
    this.clickEmitter.emit(this.activity);
  }

  onHold(event: MouseEvent){
    event.preventDefault();
    this.holdEmitter.emit({activity: this.activity,event: event});
  }

}
