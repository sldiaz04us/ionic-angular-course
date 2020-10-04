import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoadingController } from '@ionic/angular';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
  }

  async onLogin() {
    this.authService.login();
    const loading = await this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging in...',
      duration: 1500,
    });

    await loading.present();

    // Time to log in
    setTimeout(() => {
      loading.dismiss();
      this.router.navigateByUrl('/places/tabs/discover');
    }, 500);
  }

}
