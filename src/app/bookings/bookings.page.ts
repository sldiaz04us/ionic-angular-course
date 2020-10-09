import { Component, OnDestroy, OnInit } from '@angular/core';

import { IonItemSliding, LoadingController } from '@ionic/angular';

import { Subscription } from 'rxjs';

import { Booking } from './booking.model';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  private bookingsSub: Subscription;
  private deletingBookingsSub: Subscription;

  constructor(
    private bookingService: BookingService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.bookingsSub = this.bookingService.bookings
      .subscribe(bookings => {
        this.loadedBookings = bookings;
      });
  }

  async onDeleteBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    const loader = await this.loadingCtrl.create({
      message: 'Deleting booking...'
    });
    await loader.present();
    this.deletingBookingsSub = this.bookingService.cancelBooking(bookingId).subscribe(() => {
      this.loadingCtrl.dismiss();
    });
  }

  ngOnDestroy() {
    if (this.bookingsSub) {
      this.bookingsSub.unsubscribe();
    }
    if (this.deletingBookingsSub) {
      this.deletingBookingsSub.unsubscribe();
    }
  }

}
