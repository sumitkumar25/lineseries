import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-brush',
  templateUrl: './brush.component.html',
  styleUrls: ['./brush.component.scss']
})
export class BrushComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    d3.select('svg')
    .call(d3.brush()
    .on("start",(e)=> console.log('start',e))
    .on("brush",(e)=> console.log('brush',e))
    .on("end",(e)=> console.log('end',e))
    )
  }

}
