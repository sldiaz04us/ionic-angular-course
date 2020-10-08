import { Injectable } from '@angular/core';

import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  // tslint:disable-next-line: variable-name
  private _places: Place[] = [
    new Place('p1',
      'Manhattan Mansion',
      'In the heart of New York City',
      'https://3.bp.blogspot.com/_3k2ilY9vkCY/S73R1HhD_OI/AAAAAAAAASo/0gpAWoUgQzo/s1600/ResSinclairHFExt2.jpg',
      149.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    ),
    new Place('p2',
      'Eiffel Tower',
      'A romantic place in Paris',
      'https://i.etsystatic.com/5579272/r/il/08c50e/566199323/il_794xN.566199323_rw1x.jpg',
      189.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    ),
    new Place('p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://i.pinimg.com/originals/9c/88/44/9c8844b217bdb6c17db14f51ad2e51a5.jpg',
      99.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    ),
  ];

  constructor(private authService: AuthService) { }

  get places() {
    return [...this._places];
  }

  getPlaceById(placeId: string) {
    return { ...this._places.find(place => place.id === placeId) };
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const userId = this.authService.userId;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://lh3.googleusercontent.com/proxy/GKntlEaOS5Ejn4NyYrdLv1PwkrBHX92jwaW1KW16D4GzbotN2flb2R8VAVq8VlyrfTcmSzDPiwx14vqRDsuMP2_XQbcvWRTwRLpgvnNLXN8pu5F97v3X3FZatb8zgl5RCyOd0vQ_vhOkzjSw0Y__jc221yM5Br8=w325-h183-k-no',
      price,
      dateFrom,
      dateTo,
      userId
    );
    this._places.push(newPlace);
  }
}
