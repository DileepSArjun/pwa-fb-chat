import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {

  email: string;
  password: string;
  errorMsg: string;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.authUser().subscribe(
      (userDetails) => {
        if(userDetails && userDetails.email) {
          //user is already logged in
          this.router.navigate(['chat']);
        }
      },
      (error) => { console.log(error);}
    );
  }

  login() {
    this.authService.login(this.email, this.password)
    .catch(error => this.errorMsg = error.message);
  }

}
