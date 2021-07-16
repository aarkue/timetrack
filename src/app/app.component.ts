import { Component } from '@angular/core';
import { UpdateService } from './update.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private updateService: UpdateService) {

  }
}
