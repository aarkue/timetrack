import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PasswordRecoveryComponent } from '../account/password-recovery/password-recovery.component';
import { DayTimelineComponent } from '../day-timeline/day-timeline.component';
import { PomodoroPageComponent } from '../pomodoro/pomodoro-page/pomodoro-page.component';
import { RegisterComponent } from '../register/register.component';
import { TimeTrackPageComponent } from '../time-tracker/time-track-page/time-track-page.component';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'pomodoro',
        loadChildren: () => import('../pomodoro/pomodoro.module').then(m => m.PomodoroModule),
        component: PomodoroPageComponent
      },
      {
        path: 'timetrack',
        loadChildren: () => import('../time-tracker/time-tracker.module').then(m => m.TimeTrackerModule),
        component: TimeTrackPageComponent
      },
      {
        path: 'timetrack',
        loadChildren: () => import('../time-tracker/time-tracker.module').then(m => m.TimeTrackerModule),
        component: TimeTrackPageComponent
      },
      {
        path: 'timeplan',
        loadChildren: () => import('../time-plan/time-plan.module').then(m => m.TimeplanModule),
        component: DayTimelineComponent
      },
      {
        path: 'settings',
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
      },
      { 
        path: 'register',
        component: RegisterComponent
      },
      { 
        path: 'password-recovery',
        component: PasswordRecoveryComponent
      },
      {
        path: '',
        redirectTo: '/pomodoro',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/pomodoro',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
