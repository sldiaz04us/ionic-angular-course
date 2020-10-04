import { Injectable } from '@angular/core';

import { Booking } from './booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
    // tslint:disable-next-line: variable-name
    private _bookings: Booking[] = [
        new Booking('xyz', 'p1', 'abc', 'Manhattan Mansion', 2)
    ];

    get bookings() {
        return [... this._bookings];
    }

}
