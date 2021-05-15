import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { List } from 'src/app/models/list';
import { Todo } from 'src/app/models/todo';
import { TodoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {

  @Input('list')
  public list : List;
  
  public todos : Todo[];
  
  public newTodoInput: string = "";

  constructor(private todoService : TodoService, public actionSheetController: ActionSheetController, public alertController : AlertController) { }

  async ngOnInit() {
    await this.refreshData();
    this.todoService.change.subscribe(() => {
      this.refreshData();
    })
  }

  getTodoId(index: number, todo : Todo){
    return todo._id;
  }

  async refreshData(){
    this.todos = this.todoService.getTodosData(this.list._id);
  }

  async addTodo(){
    const newTodo = {name: this.newTodoInput,
      description: "",
      deadline: null,
      priority: 1,
      estimatedDuration: 15}
    const res = await this.todoService.createTodo(this.list._id, newTodo);
    if(res.success){
      this.todos.push(res.result);
      this.newTodoInput = "";
      await this.todoService.onChange();
    }
    console.log(res);
    
  }

  async showActionSheet(event : any) {
    event.preventDefault();
    const actionSheetRef = await this.actionSheetController.create({
      header: 'Edit list: ' + this.list.name,
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'danger',
          handler: async () => {
            await this.todoService.deleteList(this.list._id);
            const i = this.todoService.getListsData().findIndex((list) => list._id === this.list._id);
            this.todoService.getListsData().splice(i,1);
            this.todoService.fetchData().then(() => {
            this.todoService.onChange();
            })
            
          },
        },
        {
          text: 'Edit',
          icon: 'create',
          handler: () => {
            this.renameList();
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

  async renameList(){
    const alertRef = await this.alertController.create({
      header: "Rename list",
      subHeader: "Choose a new name",
      inputs: [{name: 'name', type: 'text', value: this.list.name}],
      buttons: [{
        text: "Cancel",
          role: "cancel",
          handler: () => {
          }
        },{
          text: "Save",
          handler: async (value) => {
            if(value && value.name && value.name !== ""){
              this.list.name = value.name;
              const newList = await this.todoService.updateList(this.list);
              this.todoService.fetchData().then(() => {
                this.todoService.onChange();
              })
            }
          }
        }
      ]
    });
    alertRef.present();
  }


  

}
