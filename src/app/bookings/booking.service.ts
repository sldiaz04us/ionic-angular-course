import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';
import { take, delay, tap, switchMap, map } from 'rxjs/operators';

import { Booking } from './booking.model';
import { AuthService } from '../auth/auth.service';

interface IBookingsData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: string;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private bookingsDataBaseUrl =
    'https://ionic-angular-udemy-84332.firebaseio.com/bookings.json';

  // tslint:disable-next-line: variable-name
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) {}

  get bookings() {
    return this._bookings.asObservable();
  }

  fetchBookings() {
    return this.http
      .get<{ [key: string]: IBookingsData }>(
        `${this.bookingsDataBaseUrl}?orderBy="userId"&equalTo="${this.authService.userId}"`
      )
      .pipe(
        delay(500),
        map((resData) => {
          const bookings = [];
          for (const key in resData) {
            if (Object.prototype.hasOwnProperty.call(resData, key)) {
              bookings.push(
                new Booking(
                  key,
                  resData[key].placeId,
                  resData[key].userId,
                  resData[key].placeTitle,
                  resData[key].placeImage,
                  resData[key].firstName,
                  resData[key].lastName,
                  +resData[key].guestNumber,
                  new Date(resData[key].bookedFrom),
                  new Date(resData[key].bookedTo)
                )
              );
            }
          }
          return bookings;
          // return [];
        }),
        tap((bookings) => {
          this._bookings.next(bookings);
        })
      );
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generateId: string;
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );
    return this.http
      .post<{ name: string }>(this.bookingsDataBaseUrl, {
        ...newBooking,
        id: null,
      })
      .pipe(
        switchMap((resData) => {
          generateId = resData.name;
          return this.bookings;
        }),
        take(1),
        tap((bookings) => {
          newBooking.id = generateId;
          this._bookings.next(bookings.concat(newBooking));
        })
      );

    // return this.bookings.pipe(
    //     take(1),
    //     delay(1000),
    //     tap(bookings => this._bookings.next(bookings.concat(newBooking)))
    // );
  }

  cancelBooking(bookingId: string) {
    return this.http
      .delete(
        `https://ionic-angular-udemy-84332.firebaseio.com/bookings/${bookingId}.json`
      )
      .pipe(
        switchMap(() => {
          return this.bookings;
        }),
        take(1),
        tap((bookings) =>
          this._bookings.next(
            bookings.filter((booking) => booking.id !== bookingId)
          )
        )
      );

    // return this.bookings.pipe(
    //   take(1),
    //   delay(1000),
    //   tap((bookings) =>
    //     this._bookings.next(
    //       bookings.filter((booking) => booking.id !== bookingId)
    //     )
    //   )
    // );
  }
}
