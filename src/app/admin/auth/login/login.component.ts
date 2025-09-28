import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FireBaseAuthService } from 'src/app/services/firebaseAuthServices';
import { LoginDto } from 'src/app/models/dtos/loginDto';
import { ToastrService } from 'ngx-toastr';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent implements OnInit {
loginForm ! : FormGroup<any>;
isConnecting = false;

constructor(private fAuth : FireBaseAuthService ,private toastr: ToastrService){}





ngOnInit(): void {
  this.initForm();
}

private initForm() {
  this.loginForm = new FormGroup({
    email:new FormControl('',[Validators.required,Validators.email]),
    password:new FormControl('',[Validators.required])
  });
}


login() {
  this.loginForm.markAllAsTouched();
  if(this.loginForm.valid && !this.isConnecting){
    this.isConnecting = true;
    this.toastr.info('Connexion en cours...', 'Info');
    const loginData = this.loginForm.value as LoginDto;
    const response = this.fAuth.login(loginData)
    response.then( resp=>{
      if(!resp.status){
        this.toastr.error(resp.message!, 'Erreur');
        this.isConnecting = false;

      }else{
        this.toastr.success('Bienvenue mon pote :)', 'success');

      }

    })
  }
}

}
