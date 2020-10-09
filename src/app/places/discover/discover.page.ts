import { Component, OnDestroy, OnInit } from '@angular/core';

import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';

import { Subscription } from 'rxjs';

import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantePlaces: Place[];
  isLoading = false;
  private loadedPlacesSub: Subscription;

  constructor(
    private placesService: PlacesService,
    private menuCtrl: MenuController,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadedPlacesSub = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.relevantePlaces = places;
      this.listedLoadedPlaces = this.relevantePlaces.slice(1);
    });
  }

  ionViewWillEnter() {
    // this.loadedPlaces = this.placesService.places;
    // this.listedLoadedPlaces = this.loadedPlaces.slice(1);

    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => this.isLoading = false);
  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    if (event.detail.value === 'all') {
      this.relevantePlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantePlaces.slice(1);
    } else { // value === bookable
      this.relevantePlaces = this.loadedPlaces
        .filter(place => place.userId !== this.authService.userId);
      this.listedLoadedPlaces = this.relevantePlaces.slice(1);
    }
  }

  ngOnDestroy() {
    if (this.loadedPlacesSub) {
      this.loadedPlacesSub.unsubscribe();
    }
  }

}
