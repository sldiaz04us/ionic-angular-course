import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { IonItemSliding } from '@ionic/angular';

import { Subscription } from 'rxjs';

import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  offers: Place[];
  isLoading = false;
  private placesSub: Subscription;

  constructor(private placesService: PlacesService, private router: Router) { }

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => this.offers = places);
  }

  // Ionic Life Cycles
  ionViewWillEnter() {
    // this.offers = this.placesService.places;

    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => this.isLoading = false);
    console.log('ionViewWillEnter');
  }
  ionViewDidEnter() {
    console.log('ionViewDidEnter ');
  }
  ionViewWillLeave() {
    console.log('ionViewWillLeave ');
  }
  ionViewDidLeave() {
    console.log('ionViewDidLeave ');
  }

  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/places/tabs/offers/edit', offerId]);

  }

  onIonSwipeEvent() {
    console.log('ionSwipe event');
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

}
