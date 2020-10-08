import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ActionSheetController, ModalController, NavController } from '@ionic/angular';

import { Subscription } from 'rxjs';

import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  private placeSub: Subscription;

  constructor(
    private router: Router,
    private navController: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navController.navigateBack('/places/tabs/discover');
        return;
      }
      this.placeSub = this.placesService.getPlaceById(paramMap.get('placeId'))
        .subscribe(place => this.place = place);
    });
  }

  onBookPlace() {
    // this.router.navigate(['/places/tabs/discover']);
    // this.router.navigateByUrl('/places/tabs/discover');
    // this.navController.navigateBack('/places/tabs/discover');

    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        // {
        //   text: 'Delete',
        //   role: 'destructive',
        //   icon: 'trash-outline'
        // },
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    }).then(actionSheetEl => actionSheetEl.present());
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl.create(
      {
        component: CreateBookingComponent,
        componentProps: {
          selectedPlace: this.place,
          selectedMode: mode
        }
      }).then(modalEl => {
        modalEl.present();
        modalEl.onDidDismiss().then(data => console.log(data));
      });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
