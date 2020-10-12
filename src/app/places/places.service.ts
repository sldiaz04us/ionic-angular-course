import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';
import { delay, map, switchMap, take, tap } from 'rxjs/operators';

import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { IPlaceLocation } from './location.model';

interface IPlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: IPlaceLocation;
}
@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private placesDataBaseUrl = 'https://ionic-angular-udemy-84332.firebaseio.com/offers-places.json';

  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([
    // new Place(
    //   'p1',
    //   'Manhattan Mansion',
    //   'In the heart of New York City',
    //   'https://3.bp.blogspot.com/_3k2ilY9vkCY/S73R1HhD_OI/AAAAAAAAASo/0gpAWoUgQzo/s1600/ResSinclairHFExt2.jpg',
    //   149.99,
    //   new Date('2019-01-01'),
    //   new Date('2019-12-31'),
    //   'xyz'
    // ),
    // new Place(
    //   'p2',
    //   'Eiffel Tower',
    //   'A romantic place in Paris',
    //   'https://i.etsystatic.com/5579272/r/il/08c50e/566199323/il_794xN.566199323_rw1x.jpg',
    //   189.99,
    //   new Date('2019-01-01'),
    //   new Date('2019-12-31'),
    //   'abc'
    // ),
    // new Place(
    //   'p3',
    //   'The Foggy Palace',
    //   'Not your average city trip!',
    //   'https://i.pinimg.com/originals/9c/88/44/9c8844b217bdb6c17db14f51ad2e51a5.jpg',
    //   99.99,
    //   new Date('2019-01-01'),
    //   new Date('2019-12-31'),
    //   'abc'
    // ),
  ]);

  constructor(private authService: AuthService, private http: HttpClient) { }

  get places() {
    return this._places.asObservable();
  }

  fetchPlaces() {
    return this.http.get<{ [key: string]: IPlaceData }>(this.placesDataBaseUrl)
      .pipe(
        delay(500),
        map(resData => {
          const places = [];
          for (const key in resData) {
            if (Object.prototype.hasOwnProperty.call(resData, key)) {
              places.push(
                new Place(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                  resData[key].price,
                  new Date(resData[key].availableFrom),
                  new Date(resData[key].availableTo),
                  resData[key].userId,
                  resData[key].location,
                )
              );
            }
          }
          return places;
          // return [];
        }),
        tap(places => {
          this._places.next(places);
        })
      );
  }

  getPlaceById(placeId: string) {
    return this.http.get<IPlaceData>(`https://ionic-angular-udemy-84332.firebaseio.com/offers-places/${placeId}.json`)
      .pipe(
        map(resData => {
          return new Place(
            placeId,
            resData.title,
            resData.description,
            resData.imageUrl,
            resData.price,
            new Date(resData.availableFrom),
            new Date(resData.availableTo),
            resData.userId,
            resData.location
          );
        })
      );

    // return this.places.pipe(
    //   take(1),
    //   map(places => {
    //     return places.find(place => place.id === placeId);
    //   })
    // );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: IPlaceLocation
  ) {
    let generateId: string;
    const userId = this.authService.userId;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://lh3.googleusercontent.com/proxy/GKntlEaOS5Ejn4NyYrdLv1PwkrBHX92jwaW1KW16D4GzbotN2flb2R8VAVq8VlyrfTcmSzDPiwx14vqRDsuMP2_XQbcvWRTwRLpgvnNLXN8pu5F97v3X3FZatb8zgl5RCyOd0vQ_vhOkzjSw0Y__jc221yM5Br8=w325-h183-k-no',
      price,
      dateFrom,
      dateTo,
      userId,
      location
    );

    return this.http.post<{ name: string }>(
      this.placesDataBaseUrl,
      {
        ...newPlace, id: null
      }
    ).pipe(
      switchMap(resData => {
        generateId = resData.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = generateId;
        this._places.next(places.concat(newPlace));
      })

    );

    // return this.places.pipe(
    //   take(1),
    //   // delay(1000),
    //   tap(places => {
    //     this._places.next(places.concat(newPlace));
    //   })
    // );
  }

  updatePlace(place: Place) {
    this.places.pipe(
      take(1),
      // delay(1000),
      map(places => {
        return places.map(p => {
          if (p.id === place.id) {
            return place;
          } else {
            return p;
          }
        });
      }),
      tap(places => this._places.next(places))
    );
    return this.http.put(
      `https://ionic-angular-udemy-84332.firebaseio.com/offers-places/${place.id}.json`,
      { ...place, id: null }
    );

    // return this.places.pipe(
    //   take(1),
    //   // delay(1000),
    //   map(places => {
    //     return places.map(p => {
    //       if (p.id === place.id) {
    //         return place;
    //       } else {
    //         return p;
    //       }
    //     });
    //   }),
    //   tap(places => this._places.next(places))
    // );
  }

}
