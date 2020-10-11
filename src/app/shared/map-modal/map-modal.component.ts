import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';

import { ModalController } from '@ionic/angular';

import { } from 'googlemaps';

import { environment } from 'src/environments/environment';
import { OnDestroy } from '@angular/core';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map') mapElementRef: ElementRef;
  idleListener: google.maps.MapsEventListener;
  clickListener: google.maps.MapsEventListener;

  constructor(private modalCtrl: ModalController, private renderer: Renderer2) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.getGoogleMaps().then(() => {
      const mapEl = this.mapElementRef.nativeElement;
      const myLatlng: google.maps.LatLngLiteral = { lat: 30, lng: -110 };
      const map = new google.maps.Map(mapEl, {
        center: myLatlng,
        zoom: 8
      });

      this.idleListener = map.addListener('idle', () => {
        this.renderer.addClass(mapEl, 'visible');
      });

      this.clickListener = map.addListener('click', (event) => {
        const selectedCoords: google.maps.LatLngLiteral = {
          lat: event.latLng.lat(), lng: event.latLng.lng()
        };
        this.modalCtrl.dismiss(selectedCoords);
      });

    }).catch(err => {
      console.log(err);
    });
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.clickListener.remove();
    }
    if (this.idleListener) {
      this.idleListener.remove();
    }
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  private getGoogleMaps() {
    const googleModule = window.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApi}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = window.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve();
        } else {
          reject('Google maps SDK not available');
        }
      };
    });
  }


}
