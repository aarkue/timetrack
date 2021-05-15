import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Todo } from 'src/app/models/todo';
import { TodoService } from 'src/app/services/todo.service';
import { EditTodoModalComponent } from './edit-todo-modal/edit-todo-modal.component';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
})
export class TodoComponent implements OnInit {
  @Input('todo')
  public todo: Todo;
  @Input('listid')
  public listid: string;

  constructor(
    private todoService: TodoService,
    public actionSheetController: ActionSheetController,
    public modalController: ModalController
  ) {}

  ngOnInit() {}

  isDoneChange(newVal: any) {
    this.todo.isDone = newVal;
    this.todoService.updateTodo(this.listid, this.todo._id, this.todo);
  }

  async showActionSheet(event : any) {
    event.preventDefault();
    const actionSheetRef = await this.actionSheetController.create({
      header: 'Edit todo: ' + this.todo.name,
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'danger',
          handler: () => {
            this.todoService.deleteTodo(this.listid,this.todo._id);
            this.todoService.fetchData();
          },
        },
        {
          text: 'Edit',
          icon: 'create',
          handler: () => {
            this.editTodo();
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
          },
        },
      ],
    });
    actionSheetRef.present();
    // this.todo.isDone = !this.todo.isDone;
  }


  async editTodo(){
    const modal = await this.modalController.create({
      component: EditTodoModalComponent,
      componentProps : {todo: this.todo},
    });
    modal.onDidDismiss().then(async (value) => {
      if(value.data && value.data.success){
        await this.todoService.updateTodo(this.listid, value.data.todo._id, value.data.todo);
        await this.todoService.onChange();
      }
    });
    await modal.present();
  }
}
