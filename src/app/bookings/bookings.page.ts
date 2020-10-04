import { Component, OnInit } from '@angular/core';

import { IonItemSliding } from '@ionic/angular';

import { Booking } from './booking.model';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {
  loadedBookings: Booking[];

  constructor(private bookingService: BookingService) { }

  ngOnInit() {
    this.loadedBookings = this.bookingService.bookings;
  }

  onDeleteBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    // Cancel booking with offerId
  }

}
