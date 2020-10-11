import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

import { ModalController } from '@ionic/angular';

import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { PlaceLocation } from '../../../places/location.model';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  selectedLocationImage: string;
  staticMapImageIsLoading = false;
  ionicPrimaryColor: string;

  constructor(private modalCtrl: ModalController, private http: HttpClient) { }

  ngOnInit() {
    this.ionicPrimaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--ion-color-primary');
  }

  async onPickLocation() {
    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
    });
    await modal.present();
    await modal.onDidDismiss().then(modalData => {
      console.log(modalData);
      if (!modalData.data) {
        return;
      }
      this.staticMapImageIsLoading = true;
      const pickedkLocation: PlaceLocation = {
        lat: modalData.data.lat,
        lng: modalData.data.lng,
        address: null,
        staticMapImageUrl: null
      };
      this.getAddress(modalData.data.lat, modalData.data.lng)
        .pipe(
          switchMap(address => {
            pickedkLocation.address = address;
            return of(this.getMapStaticImage(pickedkLocation.lat, pickedkLocation.lng, 8));
          })
        ).subscribe(staticMapImageUrl => {
          pickedkLocation.staticMapImageUrl = staticMapImageUrl;
          this.selectedLocationImage = staticMapImageUrl;
          this.staticMapImageIsLoading = false;
          this.locationPick.emit(pickedkLocation);
        });
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment
        .googleMapsApi}`)
      .pipe(
        map((geoData: any) => {
          console.log(geoData);
          if (!geoData || !geoData.results || geoData.results.length === 0) {
            return null;
          } else {
            return geoData.results[0].formatted_address;
          }
        })
      );
  }

  private getMapStaticImage(lat: number, lng: number, zoom: number) {
    const primaryColor = this.ionicPrimaryColor.replace('#', '0x').trim();
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=300x400&markers=color:${primaryColor}%7Clabel:Place%7C${lat},${lng}&key=${environment.googleMapsApi}`;
  }

}
