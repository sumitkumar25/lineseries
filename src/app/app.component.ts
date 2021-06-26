import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  data = [
    {
      "extra": 0,
      "max": 280.11,
      "min": 140.15,
      "name": "Wed, 16 Jun 2021 12:01:30 GMT",
      "value": 130.5
    },
    {
      "extra": 0,
      "max": 290.85,
      "min": 15.9,
      "name": "Wed, 16 Jun 2021 12:02:00 GMT",
      "value": 130.5
    },
    {
      "extra": 0,
      "max": 309.25,
      "min": 34.29,
      "name": "Wed, 16 Jun 2021 12:02:30 GMT",
      "value": 130.5
    },
    {
      "extra": 1,
      "max": 295.27,
      "min": 20.31,
      "name": "Wed, 16 Jun 2021 12:03:00 GMT",
      "value": 312
    },
    {
      "extra": 0,
      "max": 300.25,
      "min": 25.29,
      "name": "Wed, 16 Jun 2021 12:03:30 GMT",
      "value": 243
    },
    {
      "extra": 0,
      "max": 287.93,
      "min": 12.97,
      "name": "Wed, 16 Jun 2021 12:04:00 GMT",
      "value": 135
    },
    {
      "extra": 0,
      "max": 313.13,
      "min": 38.17,
      "name": "Wed, 16 Jun 2021 12:04:30 GMT",
      "value": 126
    },
    {
      "extra": 0,
      "max": 300.69,
      "min": 25.73,
      "name": "Wed, 16 Jun 2021 12:05:00 GMT",
      "value": 126
    },
    {
      "extra": 0,
      "max": 308.99,
      "min": 34.03,
      "name": "Wed, 16 Jun 2021 12:05:30 GMT",
      "value": 111
    }
  ]
  chartConfig = {
    height: 300,
    width: 500
  }
}
