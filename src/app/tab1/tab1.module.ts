import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { AccountService } from '../services/account.service';
import { ListComponent } from './list/list.component';
import { TodoComponent } from './list/todo/todo.component';
import { EditTodoModalComponent } from './list/todo/edit-todo-modal/edit-todo-modal.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [Tab1Page,ListComponent,TodoComponent,EditTodoModalComponent]
})
export class Tab1PageModule {}
