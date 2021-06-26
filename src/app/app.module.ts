import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LineSeriesComponent } from './components/line-series/line-series.component';
import { BrushComponent } from './brush/brush.component';
import { LineSeries2Component } from './line-series2/line-series2.component';

@NgModule({
  declarations: [
    AppComponent,
    LineSeriesComponent,
    BrushComponent,
    LineSeries2Component
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
