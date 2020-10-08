import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LoadingController } from '@ionic/angular';

import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;

  constructor(
    private placeService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
    });
  }

  async onCreateOffer() {
    console.log(this.form);
    if (this.form.invalid) {
      return;
    }

    const loader = await this.loadingCtrl.create({
      message: 'Creating place...'
    });
    await loader.present();

    this.placeService.addPlace(
      this.form.value.title,
      this.form.value.description,
      +this.form.value.price,
      new Date(this.form.value.dateFrom),
      new Date(this.form.value.dateTo)
    ).subscribe(() => {
      this.loadingCtrl.dismiss();
      this.form.reset();
      this.router.navigateByUrl('/places/tabs/offers');
    });

  }

}
