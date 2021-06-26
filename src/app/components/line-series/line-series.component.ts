import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { axisBottom, axisLeft, curveCardinal, extent, line, max, min, symbol, symbolStar, pointer, curveCardinalOpen, curveBasis } from 'd3';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import { format } from 'date-fns';
@Component({
  selector: 'app-line-series',
  templateUrl: './line-series.component.html',
  styleUrls: ['./line-series.component.scss']
})
export class LineSeriesComponent implements AfterViewInit, OnChanges {
  // .map(e => ({ ...e, name: new Date(e.name).getTime() }))

  @ViewChild('chart') chart: ElementRef;

  @Input() data: Array<{
    "extra": number,
    "max": number,
    "min": number,
    "name": string,
    "value": number
  }>
  @Input() config: {
    height: number,
    width: number,
    boundSeriesColor?: string,
    valueSeriesColor?: string,
    anomlyFill?: string,
    xAxisKey: string,
    yAxisKey: string,
  }
  dateFormattedData: Array<{
    "extra": number,
    "max": number,
    "min": number,
    "name": number,
    "value": number
  }>;

  svg: any;
  margin = 25;
  lineSeriesData: any[];
  defaultBoundsColor = '#00be6f';
  defaultValueColor = '#707070';
  defaultAnomlyFill = '#ff0063';

  // tooltip
  tooltipCoordinates: { x: any; y: any; };
  tooltipItem: { name: number; extra: number; max: number; min: number; value: number; };
  enableTooltip = false;
  eventOverylay: any;
  constructor() { }
  ngOnChanges(change: SimpleChanges) {
    if (change.data) {
      requestAnimationFrame(() => {
        this.initChart()
      })
    }
  }
  ngAfterViewInit() {
    // this.initChart();
    if (!this.chart.nativeElement) return;
    this.createSvg();
  }

  createSvg() {
    this.svg = select(this.chart.nativeElement).append('svg')
      .attr('height', (this.config.height) + 2 * this.margin)
      .attr('width', (this.config.width) + 2 * this.margin)
      .style('border', 'solid 1px')
      .append('g').attr('class', 'chart-g')
      .attr('transform', `translate(${this.margin},${this.margin})`);
  }

  initChart() {
    if (!this.svg) return;
    // scale
    this.createSeriesData()
    const { lineCurve, yScale, xScale } = this.createAxis();
    // append series
    this.createDataElements(lineCurve, yScale, xScale);
    // mouseEvents and tooltip
    this.createEventOverlay(xScale);
  }

  createSeriesData() {
    this.dateFormattedData = this.data.map(item => {
      return {
        ...item,
        name: new Date(item.name).getTime()
      }
    }).sort((a, b) => {
      return a.name - b.name
    })
    console.log(this.dateFormattedData)
    this.lineSeriesData = [
      this.dateFormattedData.map(item => ({
        y: item.min,
        x: item.name,
        type: 'dot'
      })),
      this.dateFormattedData.map(item => ({
        y: item.max,
        x: item.name,
        type: 'dot'
      })),
      this.dateFormattedData.map(item => ({
        y: item.value,
        x: item.name,
        type: 'solid'
      })),
    ]
  }



  private createDataElements(lineCurve, yScale, xScale) {
    let seriesg = this.svg.select('.series-g');
    if (seriesg.empty()) {
      seriesg = this.svg.append('g').attr('class', 'series-g').append('g');
    }
    const series = seriesg.selectAll('.series').data(this.lineSeriesData);
    series.exit().remove();
    series.enter()
      .append('path')
      .merge(series)
      .transition().duration(300)
      .style("stroke-width", '3px')
      .style("stroke", d => d[0].type === 'dot' ? this.config.boundSeriesColor || this.defaultBoundsColor :
        this.config.valueSeriesColor || this.defaultValueColor)
      .style("stroke-dasharray", d => d[0].type === 'dot' ? 15 : 0)
      .attr("d", d => lineCurve(d))
      .attr('fill', 'none');

    const anomlyIcon =
      symbol().type(symbolStar).size(100)

    const anomly = this.svg.selectAll('anomly-icon-g').data(this.dateFormattedData.filter(d => d.value > d.max || d.value < d.min));
    anomly.exit().remove();
    anomly.enter().append('path')
      .attr('d', anomlyIcon)
      .merge(anomly)
      .attr('transform', d => `translate(${xScale(d.name)},${yScale(d.value)})`)
      .attr('opacity', 0)
      .transition().duration(300)
      .attr('opacity', 1)
      .attr('fill', this.config.anomlyFill || this.defaultAnomlyFill);
  }

  private createAxis() {
    const xScale = scaleTime()
      .domain(extent(this.dateFormattedData, d => d.name))
      .range([0, this.config.width]);

    const yScale = scaleLinear()
      .domain([min(this.data, d => d.min), max(this.data, d => d.max) + 10])
      .range([this.config.height, 0]);


    const lineCurve = line()
      .curve(curveBasis)
      .x(d => xScale(d['x']))
      .y(d => yScale(d['y']));

    const xAxis = axisBottom(xScale).tickFormat(d => format(d as number, 'h:mm:ss'));
    const yAxis = axisLeft(yScale);
    let xgroup, ygroup;
    // append axis
    if (this.svg.select('.x-axis').empty()) {
      xgroup = this.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${this.config.height})`)
    }
    if (this.svg.select('.y-axis').empty()) {
      ygroup = this.svg.append("g")
        .attr("class", "y-axis")
    }
    xgroup.call(xAxis);
    ygroup.call(yAxis);
    return { lineCurve, yScale, xScale };
  }


  createEventOverlay(xScale) {
    this.svg.selectAll('circle').data(this.dateFormattedData, (d) => d.name).enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', 'red')
      .attr('cx', d => xScale(d.name))
      .attr('cy', 10)
    this.eventOverylay = this.svg.append("rect")
      .attr("class", "overlay")
      .attr("width", this.config.width)
      .attr("height", this.config.height)
      .attr("opacity", .4)
      .on("mouseout", () => this.enableTooltip = false)
      .on("mousemove", (event) => this.mousemove(pointer(event, this.eventOverylay.node()), xScale, event));
  }

  mousemove(rect, xScale, event) {
    const xValue = new Date(xScale.invert(rect[0])).getTime();
    this.tooltipCoordinates = { x: event.x, y: event.y }
    const dataValue = this.dateFormattedData.find(elem => elem.name === xValue);
    console.log(dataValue)
    if (dataValue) {
      this.enableTooltip = true
      this.tooltipItem = dataValue
    }
  }
}