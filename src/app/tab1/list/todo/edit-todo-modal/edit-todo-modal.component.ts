import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Todo } from 'src/app/models/todo';

@Component({
  selector: 'app-edit-todo-modal',
  templateUrl: './edit-todo-modal.component.html',
  styleUrls: ['./edit-todo-modal.component.scss'],
})
export class EditTodoModalComponent implements OnInit {

  @Input('todo')
  public todo : Todo;
  
  public editTodoForm: FormGroup;

  set enableDeadline(newVal : boolean){
    if(newVal){
      this.editTodoForm.get('deadline').enable();
    }else{
      this.editTodoForm.get('deadline').disable();
    }
  }

  get enableDeadline(){
    return !this.editTodoForm.get('deadline').disabled;
  }

  constructor(public modalController : ModalController, public formBuilder  : FormBuilder) { 
    this.editTodoForm = this.formBuilder.group({
      name : ["",Validators.required],
      description: "",
      priority: [1,[Validators.required,Validators.min(1),Validators.max(10)]],
      estimatedDuration: [15,[Validators.required,Validators.min(0)]],
      deadline: ""
      
    })
  }

  ngOnInit() {
    this.enableDeadline = (this.todo.deadline != null);
    this.editTodoForm = this.formBuilder.group({
      name : [this.todo.name,Validators.required],
      description: this.todo.description,
      priority: [this.todo.priority,[Validators.required,Validators.min(1),Validators.max(10)]],
      estimatedDuration: [this.todo.estimatedDuration,[Validators.required,Validators.min(0)]],
      deadline: {value: this.todo.deadline || new Date().toISOString(), disabled: !this.enableDeadline} 
      
    })
  }

  dismissModal(saveData: boolean = false){
    if(saveData){
      this.todo.name = this.editTodoForm.get('name').value;
      this.todo.description = this.editTodoForm.get('description').value;
      this.todo.priority = this.editTodoForm.get('priority').value;
      this.todo.estimatedDuration = this.editTodoForm.get('estimatedDuration').value;
      this.todo.deadline = this.enableDeadline ? this.editTodoForm.get('deadline').value : null;
      this.modalController.dismiss({success: true,todo: this.todo});
    }else{
      this.modalController.dismiss({success: false});
    }
  }

}
