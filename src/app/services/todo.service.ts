import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIResult } from '../models/api-result';
import { List } from '../models/list';
import { Todo } from '../models/todo';
import { Acc } from '../models/acc';
import { NewTodoData } from '../models/new-todo-data';

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

import { WebRequestService } from './web-request.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private lists : List[] = [];
  private todos : Map<string,Todo[]> = new Map<string,Todo[]>();

  public change : EventEmitter<void> = new EventEmitter<void>();

  constructor(private webReqServ: WebRequestService, public toastController : ToastController) {
  }

  async fetchData() : Promise<void>{
    return new Promise( async (resolve,reject) => {
      await this.webReqServ.updateJWT();
      const listRes = await this.getLists().catch((reason) => this.showUpdateFailedToast());
        if(listRes && listRes.success){
          this.lists = listRes.result;
          this.todos = new Map<string,Todo[]>();
          for await (const list of this.lists) {
            const todoRes = await this.getTodos(list._id).catch((reason) => this.showUpdateFailedToast());
            if(todoRes && todoRes.success){
              this.todos.set(list._id,todoRes.result);
            }
          }
          resolve();
        }else{
          reject();
        }
    });
  }

  public getListsData(){
    return this.lists;
  }

  public getTodosData(listid: string){
    return this.todos.get(listid);
  }

  private createListReq(name: string): Observable<Object> {
    return this.webReqServ.post('lists', {
      name,
    });
  }


  private createTodoReq(
    listid: string,
    todoData: NewTodoData
  ): Observable<Object> {
    return this.webReqServ.post(`lists/${listid}/todos/`, todoData);
  }

  public createTodo(
    listid: string,
    todoData: NewTodoData
  ): Promise<APIResult<Todo>> {
    return new Promise<APIResult<Todo>>((resolve) => {
      this.createTodoReq(listid, todoData).subscribe((res: any) => {
        resolve(res);
      });
    });
  }

  private getListReq(listid: string): Observable<Object> {
    return this.webReqServ.get(`lists/${listid}`);
  }

  private getListsReq(): Observable<Object> {
    return this.webReqServ.get('lists');
  }

  private deleteListReq(listid: string): Observable<Object> {
    return this.webReqServ.delete(`lists/${listid}`);
  }
  private updateListReq(list: List): Observable<Object> {
    let list_cp = {
      _id: undefined,
    };
    Object.assign(list_cp, list);
    delete list_cp._id;
    return this.webReqServ.patch(`lists/${list._id}`, list_cp);
  }

  private updateTodoReq(
    listid: string,
    todoid: string,
    todo: Todo | NewTodoData
  ): Observable<Object> {
    let todo_cp = {
      _id: undefined,
      _listid: undefined,
    };
    Object.assign(todo_cp, todo);
    delete todo_cp._id;
    delete todo_cp._listid;
    return this.webReqServ.patch(`lists/${listid}/todos/${todoid}`, todo_cp);
  }


  private getTodosReq(listid: string): Observable<Object> {
    return this.webReqServ.get(`lists/${listid}/todos/`);
  }

  private deleteTodoReq(listid: string, todoid: string): Observable<Object> {
    return this.webReqServ.delete(`lists/${listid}/todos/${todoid}`);
  }


  private getTodoReq(listid: string, todoid: string) {
    return this.webReqServ.get(`lists/${listid}/todos/${todoid}`);
  }

  private deleteShareListReq( listid: string){
    return this.webReqServ.delete(`share/${listid}`);
  }

  private getShareListReq(username: string, listid: string){
    return this.webReqServ.get(`share/${username}/${listid}`);
  }


  public updateTodo(
    listid: string,
    todoid: string,
    todo: Todo | NewTodoData
  ): Promise<APIResult<Todo>> {
    return new Promise<APIResult<Todo>>((resolve) => {
      this.updateTodoReq(listid, todoid, todo).subscribe((res: any) => {
        resolve(res);
      });
    });
  }


  public shareList(username: string, listid: string): Promise<APIResult<Object>>{
    return new Promise<APIResult<Object>>((resolve) => {
      this.getShareListReq(username, listid).subscribe((res: any) => {
        resolve(res);
      })
    })
  }
  
  
  public createList(name: string): Promise<APIResult<List>> {
    return new Promise<APIResult<List>>((resolve) => {
      this.createListReq(name).subscribe((res: any) => {
        resolve(res);
      });
    });
  }

  public getList(listid: string): Promise<APIResult<List>> {
    return new Promise<APIResult<List>>((resolve) => {
      this.getListReq(listid).subscribe((res: any) => {
        resolve(res);
      });
    });
  }

  public getLists(): Promise<APIResult<List[]>> {
    return new Promise<APIResult<List[]>>((resolve) => {
      this.getListsReq().toPromise().catch((reason) => this.showUpdateFailedToast()).then((val: any) => resolve(val));
    });
  }

  public deleteList(listid: string): Promise<APIResult<List>> {
    return new Promise<APIResult<List>>((resolve) => {
      this.deleteListReq(listid).subscribe((res: any) => {
        resolve(res);
      });
    });
  }

  public updateList(list: List): Promise<APIResult<List>> {
    return new Promise<APIResult<List>>((resolve) => {
      this.updateListReq(list).subscribe((res: any) => {
        resolve(res);
      });
    });
  }


  public getTodos(listid: string): Promise<APIResult<Todo[]>> {
    return new Promise<APIResult<Todo[]>>((resolve) => {
      this.getTodosReq(listid).subscribe((res: any) => {
        resolve(res);
      });
    });
  }

  public deleteTodo(listid: string, todoid: string): Promise<APIResult<Todo>> {
    return new Promise<APIResult<Todo>>((resolve) => {
      this.deleteTodoReq(listid, todoid).subscribe(async (res: any) => {
        await this.onChange();
        resolve(res);
      });
    });
  }

  public getTodo(listid: string, todoid: string): Promise<APIResult<Todo>> {
    return new Promise<APIResult<Todo>>((resolve) => {
      this.getTodoReq(listid, todoid).subscribe((res: any) => {
        resolve(res);
      });
    });
  }

  public deleteShareList(listid: string): Promise<APIResult<Acc>> {
    return new Promise<APIResult<Acc>>((resolve) => {
      this.deleteShareListReq(listid).subscribe((res: any) => {
        resolve(res);
      });
    });
  }

  async onChange(){
    await this.fetchData().catch(async (reason) => {
      this.showUpdateFailedToast();
    });;
    this.change.emit();
  }

  async showUpdateFailedToast(){
    const toastNot = await  this.toastController.create({
      header: "Failed to load data. Are you offline?",
      position: "middle",
      color: "danger",
      duration: 3000,
      buttons: [{text: " Ok", icon: "checkmark-outline", role: "cancel", handler: () => {}}],
    });
  toastNot.present();
  }

}
