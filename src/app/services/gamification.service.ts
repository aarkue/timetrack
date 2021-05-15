import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from './account.service';
import { APIResult } from '../models/api-result';
import { LeaderboardEntry } from '../models/leaderboard-entry';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private leaderBoard: LeaderboardEntry[] = [];

  constructor(private webReqServ: WebRequestService, private accountService: AccountService) {
    this.getLeaderboardReq();
   }

  private getLeaderboardReq() {
    this.webReqServ.get('leaderboard').subscribe((res : any) => {
      if(res.success){
        this.leaderBoard = res.result;
      }
    })
  }

  public getLeaderboard():LeaderboardEntry[] {
    return this.leaderBoard;
  }

   //Source https://devforum.roblox.com/t/how-do-you-design-your-levelling-system/98750
   //math.floor((math.sqrt(((Exp+13)2)/100))+0.5)
  getCurrentLevel(): number {
    return Math.floor((Math.sqrt(((this.accountService.getExperience()+13)*2)/100))+0.5);
  }

  getXPForLevel(level: number) {
    return ((level*(level+1))/2) * 100;
  }

  getXPToNextLevel(): number {
    return this.getXPForLevel(this.getCurrentLevel()) - this.accountService.getExperience();
  }

  getLevelProgressPercent(): number {
    let xpToNext = this.getXPForLevel(this.getCurrentLevel()) - this.getXPForLevel(this.getCurrentLevel()-1);
    let xpSinceLevel = this.accountService.getExperience() - this.getXPForLevel(this.getCurrentLevel()-1);
    return (xpSinceLevel/xpToNext)*100;
  }


}
