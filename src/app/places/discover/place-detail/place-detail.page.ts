import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  NavController
} from '@ionic/angular';

import { Subscription } from 'rxjs';

import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { BookingService } from '../../../bookings/booking.service';
import { AuthService } from '../../../auth/auth.service';
import { MapModalComponent } from '../../../shared/map-modal/map-modal.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading = false;
  private placeSub: Subscription;
  private bookingsSub: Subscription;

  constructor(
    private router: Router,
    private navController: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alterCtrl: AlertController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navController.navigateBack('/places/tabs/discover');
        return;
      }
      this.isLoading = true;
      this.placeSub = this.placesService.getPlaceById(paramMap.get('placeId'))
        .subscribe(place => {
          this.place = place;
          this.isBookable = this.place.userId !== this.authService.userId;
          this.isLoading = false;
        }, error => {
          this.alterCtrl.create({
            header: 'An error ocurred!',
            message: 'Could not load place.',
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  this.navController.navigateBack('/places/tabs/discover');
                }
              }
            ]
          }).then(alertEl => alertEl.present());
        });
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

  async openBookingModal(mode: 'select' | 'random') {
    const bookingModal = await this.modalCtrl.create(
      {
        component: CreateBookingComponent,
        componentProps: {
          selectedPlace: this.place,
          selectedMode: mode
        }
      });
    await bookingModal.present();

    const resultData = await bookingModal.onDidDismiss();
    console.log(resultData.data, resultData.role);

    if (resultData.role === 'confirm') {
      const loader = await this.loadingCtrl.create({
        message: 'Creating booking...'
      });
      await loader.present();

      const data = resultData.data.bookingData;
      this.bookingsSub = this.bookingService.addBooking(
        this.place.id,
        this.place.title,
        this.place.imageUrl,
        data.firstName,
        data.lastName,
        data.guestNumber,
        data.startDate,
        data.endDate
      ).subscribe(async () => {
        await this.loadingCtrl.dismiss();
        this.navController.navigateBack('/places/tabs/discover');
      });
    }
  }

  async onShowFullMap() {
    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        center: { lat: this.place.location.lat, lng: this.place.location.lng },
        selectable: false,
        closeButtonText: 'Close',
        title: this.place.location.address
      }
    });
    await modal.present();
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
    if (this.bookingsSub) {
      this.bookingsSub.unsubscribe();
    }
  }
}
