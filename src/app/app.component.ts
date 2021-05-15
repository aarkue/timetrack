import { Component } from '@angular/core';
import { Capacitor, SplashScreen } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    if (Capacitor.isNative){
      SplashScreen.hide();
    }
  }
}
