import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PasswordRecoveryComponent } from '../account/password-recovery/password-recovery.component';
import { RegisterComponent } from '../register/register.component';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'pomodoro',
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
      },
      {
        path: 'timetrack',
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
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
