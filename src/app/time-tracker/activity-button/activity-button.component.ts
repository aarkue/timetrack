import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-activity-button',
  templateUrl: './activity-button.component.html',
  styleUrls: ['./activity-button.component.scss'],
})
export class ActivityButtonComponent implements OnInit {

  @Input('active')
  public active : boolean;

  @Input('label')
  public label : string;

  @Input('icon')
  public icon : string;

  @Input('color')
  public color : string;


  constructor() { }

  ngOnInit() {}

}
