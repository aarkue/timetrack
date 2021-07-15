import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  public registerForm : FormGroup;
  
  public readonly MIN_PW_LENGTH : number = 6;
  public readonly MAX_PW_LENGTH : number = 32;

  public isVerifying : boolean = false;

  public verifySecret: string = '';
  public verifyUserid: string = '';
  constructor(private formBuilder : FormBuilder, private accountService : AccountService, private route: ActivatedRoute, private router: Router) { 
    this.registerForm = formBuilder.group({
      email : ['', [Validators.email]],
      password : ['', [Validators.required,Validators.minLength(this.MIN_PW_LENGTH),Validators.maxLength(this.MAX_PW_LENGTH)]],
      repeatPassword : ['', [Validators.required]],
    })
  }


  async ngOnInit() {
    let queryParamMap = this.route.snapshot.queryParamMap;
    if(queryParamMap.has('verification')){
      if(queryParamMap.get('verification') == '1'){
        this.isVerifying = true;
        this.verifySecret = queryParamMap.get('secret');
        this.verifyUserid = queryParamMap.get('userId');
        console.log("verify email", this.verifyUserid ,  this.verifySecret )
      }

      this.router.navigate([],{queryParams: {'oauth': null}, queryParamsHandling: 'merge'});
    }
    await this.accountService.updateAcc();
    console.log(this.accountService.getAcc())
  }

  register(){
    if(this.registerForm.valid && this.registerForm.get('password').value === this.registerForm.get('repeatPassword').value){
      this.accountService.register(this.registerForm.get('email').value, this.registerForm.get('password').value);
    }
  }

  waitForEmailVerification(){
    return (this.accountService.getAcc() != null && !this.accountService.getAcc().emailVerification) && !this.isVerifying;
  }


  startVerification(){
    this.accountService.startEmailVerification();
  }

  verifyEmail(){
    this.accountService.verifyEmail(this.verifyUserid,this.verifySecret);
  }



}
