import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { List } from '../models/list';
import { Todo } from '../models/todo';
import { AccountService } from '../services/account.service';
import { PictureService } from '../services/picture.service';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{

  public message : String = "";
  public lists : List[] = [];

  constructor(public accountService : AccountService, public todoService : TodoService, public alertController: AlertController, public toastController : ToastController) {
    
  }

  async ngOnInit() {
    await this.todoService.fetchData().catch(async (reason) => {
      this.showUpdateFailedToast();
    });
    await this.refreshData();
    this.todoService.change.subscribe(() => {
      this.refreshData();
    })
  }

  async showUpdateFailedToast(){
    const toastNot = await  this.toastController.create({
      header: "Failed to load data. Are you offline?",
      position: "bottom",
      color: "danger",
      duration: 3000,
      buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
    });
  toastNot.present();
  }


  async refreshData(){
    this.lists = this.todoService.getListsData();
    this.accountService.updateAcc();
  }

  async doRefresh(event) {
    await this.todoService.onChange();
    event.target.complete();
    }

  getListID(index: number, list : List){
    return list._id;
  }

  async addList(){
    const alertRef = await this.alertController.create({
      header: "Create new list",
      subHeader: "Choose a name",
      inputs: [{name: 'name', type: 'text', placeholder: 'My list'}],
      buttons: [{
        text: "Cancel",
          role: "cancel",
          handler: () => {
          }
        },{
          text: "Create list",
          handler: async (value) => {
            if(value && value.name && value.name !== ""){
              const newList = await this.todoService.createList(value.name);
              if(newList.success){
              this.lists.unshift(newList.result);
              }
              this.todoService.fetchData().then(() => {
                this.todoService.onChange();
              }).catch(async (reason) => {
                this.showUpdateFailedToast();
              });
            }
          }
        }
      ]
    });
    alertRef.present();
  }

}
