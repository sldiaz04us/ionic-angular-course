import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { LoadingController, NavController } from '@ionic/angular';

import { Subscription } from 'rxjs';

import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  editForm: FormGroup;
  private placeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private navController: NavController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navController.navigateBack('/places/tabs/offers');
        return;
      }
      this.placeSub = this.placesService.getPlaceById(paramMap.get('placeId'))
        .subscribe(place => {
          this.place = place;
          this.editForm = new FormGroup({
            title: new FormControl(this.place.title, {
              updateOn: 'blur',
              validators: [Validators.required]
            }),
            description: new FormControl(this.place.description, {
              updateOn: 'blur',
              validators: [Validators.required, Validators.maxLength(180)]
            })
          });
        });

    });
  }

  async onEditOffer() {
    if (this.editForm.invalid) {
      return;
    }
    const loader = await this.loadingCtrl.create({
      message: 'Updating place...'
    });

    await loader.present();
    const updatedPlace = this.place;
    updatedPlace.title = this.editForm.value.title;
    updatedPlace.description = this.editForm.value.description;

    this.placesService.updatePlace(updatedPlace).subscribe(() => {
      this.loadingCtrl.dismiss();
      this.editForm.reset();
      this.navController.navigateBack('/places/tabs/offers');
    });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

}
