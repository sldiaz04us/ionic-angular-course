import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { ActionSheetController, ModalController, AlertController } from '@ionic/angular';

import { Plugins, Capacitor } from '@capacitor/core';

import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { IPlaceLocation } from '../../../places/location.model';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<IPlaceLocation>();
  selectedLocationImage: string;
  staticMapImageIsLoading = false;
  ionicPrimaryColor: string;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.ionicPrimaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--ion-color-primary');
  }

  async onPickLocation() {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Please Choose',
      buttons: [
        {
          text: 'Auto-Locate',
          handler: () => this.locateUser()
        },
        {
          text: 'Pick on Map',
          handler: () => this.openMapModal()
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await sheet.present();
  }

  private async locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert('Could not fetch location', 'Please use the map to pick a location');
      return;
    }
    const { Geolocation } = Plugins;
    try {
      const geolocationPosition = await Geolocation.getCurrentPosition();
      this.createPlace(geolocationPosition.coords.latitude, geolocationPosition.coords.longitude);
      console.log('Current', geolocationPosition);
    } catch (error) {
      this.showErrorAlert('Could not fetch location', error.message);
      console.log('Error >', error);
      return;
    }
  }

  private async showErrorAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    alert.present();
  }

  private async openMapModal() {
    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
    });
    await modal.present();
    await modal.onDidDismiss().then(modalData => {
      console.log('Modal Data', modalData);
      if (!modalData.data) {
        return;
      }
      this.createPlace(modalData.data.lat, modalData.data.lng);
    });
  }

  private createPlace(lat: number, lng: number) {
    this.staticMapImageIsLoading = true;
    const pickedkLocation: IPlaceLocation = {
      lat,
      lng,
      address: null,
      staticMapImageUrl: null
    };
    this.getAddress(lat, lng)
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
