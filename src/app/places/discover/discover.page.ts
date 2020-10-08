import { Component, OnDestroy, OnInit } from '@angular/core';

import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';

import { Subscription } from 'rxjs';

import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  private loadedPlacesSub: Subscription;

  constructor(
    private placesService: PlacesService,
    private menuCtrl: MenuController
  ) { }

  ngOnInit() {
    this.loadedPlacesSub = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.listedLoadedPlaces = this.loadedPlaces.slice(1);
    });
  }

  ionViewWillEnter() {
    // this.loadedPlaces = this.placesService.places;
    // this.listedLoadedPlaces = this.loadedPlaces.slice(1);
  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log('SegmentEvent', event);
  }

  ngOnDestroy() {
    if (this.loadedPlacesSub) {
      this.loadedPlacesSub.unsubscribe();
    }
  }

}
