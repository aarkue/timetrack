import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  public registerForm : FormGroup;

  public isVerifying : boolean = false;

  public verifySecret: string = '';
  public verifyUserid: string = '';

  public startEmailVerificationDisabled = false;
  constructor(private formBuilder : FormBuilder, public accountService : AccountService, private route: ActivatedRoute, private router: Router) { 
    this.registerForm = formBuilder.group({
      email : ['', [Validators.email]],
      password : ['', [Validators.required,Validators.minLength(environment.MIN_PW_LENGTH),Validators.maxLength(environment.MAX_PW_LENGTH)]],
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

      this.router.navigate([],{queryParams: {'secret': null, userId: null, verification: null}, queryParamsHandling: 'merge'});
    }
    await this.accountService.updateAcc();
    console.log(this.accountService.getAcc())
  }

  async register(){
    if(this.registerForm.valid && this.registerForm.get('password').value === this.registerForm.get('repeatPassword').value){
      const success =  this.accountService.register(this.registerForm.get('email').value, this.registerForm.get('password').value);
      if(success){
        this.registerForm.get('password').setValue("");
        this.registerForm.get('repeatPassword').setValue("");
      }
    }
  }

  canStartValidation(){
    return (this.accountService.isLoggedIn() && !this.accountService.getAcc().emailVerification) && !this.isVerifying;
  }

  canValidateEmail(){
    return (!this.accountService.getAcc()?.emailVerification);
  }


  async startVerification(){
  const success = await  this.accountService.startEmailVerification();
  if(success){
    this.startEmailVerificationDisabled = true;
    setTimeout(() => this.startEmailVerificationDisabled = true,30000);
  }
  }

  async verifyEmail(){
    const success = await this.accountService.verifyEmail(this.verifyUserid,this.verifySecret);
    if(success){
      this.router.navigate(['settings']);
    }
  }





}
