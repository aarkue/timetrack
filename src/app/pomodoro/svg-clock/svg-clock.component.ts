import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-svg-clock',
  templateUrl: './svg-clock.component.svg',
  styleUrls: ['./svg-clock.component.css'],
})
export class SvgClockComponent implements OnInit {
  @Input('isDown')
  public isDown!: boolean;
  constructor() {}

  ngOnInit(): void {}
}
