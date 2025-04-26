import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  rememberMe: boolean = false;
  username: string = 'swayam';
  password: string = 'password';
  loginForm: FormGroup;
  constructor(private router: Router, private toastr: ToastrService){
    this.loginForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }
  showPassword: boolean = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login(){
    if(this.loginForm.valid){
      if(this.loginForm.value.userName === this.username && this.loginForm.value.password === this.password){
        this.toastr.success('Login Successful');
        localStorage.setItem('loggedIn', 'true');
        this.router.navigate(['/admin']);

        //Store the user name in local storage

        const user = {
          user: this.loginForm.value.userName,
          password: this.loginForm.value.password
        };
        localStorage.setItem('user', JSON.stringify(user));

      } else {
        this.toastr.error('Invalid Username or Password');
      }
    } else {
      this.toastr.error('Please enter Username and Password');
    }
  }

}
