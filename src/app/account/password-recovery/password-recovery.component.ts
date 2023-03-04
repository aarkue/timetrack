import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
})
export class PasswordRecoveryComponent implements OnInit {

  public recoveryUserId : string = "";
  public recoverySecret : string = "";

  public recoveryForm : UntypedFormGroup;
  constructor(private route: ActivatedRoute, private router: Router, private formBuilder : UntypedFormBuilder, private accountService : AccountService) { 
    this.recoveryForm = formBuilder.group({
      recoveryUserId : ['', [Validators.required]],
      recoverySecret : ['', [Validators.required]],
      password : ['', [Validators.required,Validators.minLength(environment.MIN_PW_LENGTH),Validators.maxLength(environment.MAX_PW_LENGTH)]],
      repeatPassword : ['', [Validators.required]],
    })
  }

  async ngOnInit() {
    let queryParamMap = this.route.snapshot.queryParamMap;
    if(queryParamMap.has('secret') && queryParamMap.has('userId')){

      this.recoveryForm.get('recoveryUserId').setValue(queryParamMap.get('userId'));
      this.recoveryForm.get('recoverySecret').setValue(queryParamMap.get('secret'));

      // this.router.navigate([],{queryParams: {'secret': null, userId: null, verification: null}, queryParamsHandling: 'merge'});
    }
  }


  async resetPassword(){
    if(this.recoveryForm.valid && this.recoveryForm.get('password').value === this.recoveryForm.get('repeatPassword').value){
          const success =  await this.accountService.completePasswordRecovery(
            this.recoveryForm.get('recoveryUserId').value, this.recoveryForm.get('recoverySecret').value,
            this.recoveryForm.get('password').value, this.recoveryForm.get('repeatPassword').value);
        if(success){
            this.recoveryForm.get('password').setValue("");
            this.recoveryForm.get('repeatPassword').setValue("");
            this.router.navigate(['settings'],{queryParams: {'secret': null, userId: null, verification: null}, queryParamsHandling: 'merge'});
          }
        }
  }

  getPWMinLength(){
    return environment.MIN_PW_LENGTH;
  }

  getPWMaxLength(){
    return environment.MAX_PW_LENGTH;
  }

}
