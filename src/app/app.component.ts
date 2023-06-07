import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';

declare const google: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('map', { static: true }) mapElement!: ElementRef;
  @ViewChild('startInput') startInput!: ElementRef;
  @ViewChild('destinationInput') destinationInput!: ElementRef;
  map: any;
  directionsService: any;
  directionsRenderer: any;
  startingPoint: string = '';
  destination: string = '';
  distance: string = '';

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: -33.8688, lng: 151.2195 },
      zoom: 13,
      mapTypeId: 'roadmap',
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);

    const startAutocomplete = new google.maps.places.Autocomplete(this.startInput.nativeElement);
    const destinationAutocomplete = new google.maps.places.Autocomplete(this.destinationInput.nativeElement);

    startAutocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = startAutocomplete.getPlace();
        if (place && place.geometry && place.formatted_address) {
          this.startingPoint = place.formatted_address;
        }
      });
    });

    destinationAutocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = destinationAutocomplete.getPlace();
        if (place && place.geometry && place.formatted_address) {
          this.destination = place.formatted_address;
        }
      });
    });
  }

  calculateDistance() {
    const request = {
      origin: this.startingPoint,
      destination: this.destination,
      travelMode: 'DRIVING'
    };

    this.directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(result);
        const distance = result.routes[0].legs[0].distance.text;
        this.ngZone.run(() => {
          this.distance = distance;
        });
      } else {
        console.log('Error calculating distance:', status);
      }
    });
  }

  onInputChange(event: Event, field: string) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    if (field === 'start') {
      this.startingPoint = value;
    } else if (field === 'destination') {
      this.destination = value;
    }
  }
}
