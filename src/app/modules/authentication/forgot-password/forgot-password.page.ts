import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  NgForm,
  ValidatorFn
} from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoginModel } from 'src/app/models/login.model';
import { Constants } from 'src/app/shared/utils/data.constants';
import { ChangePasswordModel } from 'src/app/models/change-password.model';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss']
})
export class ForgotPasswordPage implements OnInit {
  form: FormGroup;
  @ViewChild('loginForm', { static: true }) loginForm: HTMLFormElement;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.formBuilder.group(
      {
        email: [
          '',
          [
            Validators.required,
            Validators.pattern(
              Constants.EMAIL_PATTERN
            )
          ]
        ],
      }
    );
  }

  ngOnInit() {}

  onGeneratePasswordResetLink(form: NgForm) {
    console.log(form);
    // const data: ChangePasswordModel = {
    //   oldPassword: form.value.oldPassword,
    //   newPassword: form.value.newPassword,
    //   confirmPassword: form.value.confirmPassword
    // };
    const email: string = form.value.email;

    this.authService.generatePasswordResetLink(email).subscribe(
      result => {
        console.log(result);
      }
    );
  }
}
