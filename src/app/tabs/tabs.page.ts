import { Component } from '@angular/core';
import { AccountService } from '../services/account.service';
import { GamificationService } from '../services/gamification.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(public accountService : AccountService, public gamificationService: GamificationService) {}

}
