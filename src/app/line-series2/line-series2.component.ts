import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { axisBottom, axisLeft, easeLinear, extent, line, max, min, pointer, pointers, select, symbol, symbolStar, timeFormat } from 'd3';

@Component({
  selector: 'app-line-series2',
  templateUrl: './line-series2.component.html',
  styleUrls: ['./line-series2.component.scss']
})
export class LineSeries2Component implements OnInit, AfterViewInit, OnChanges {
  @Input() rawdata: Array<any>;
  @Input() displayDataPoints: boolean = true;
  // works only if  displayDataPoints is true
  @Input() dataPointsColor: string = '#3cc47f';
  @Input() lineDashColor: string = '#3cc47f';
  @Input() lineSolidColor: string = '#dcdcdc';

  margin = {
    top: 20,
    right: 80,
    bottom: 30,
    left: 50
  }
  width = 900 - this.margin.left - this.margin.right;
  height = 500 - this.margin.top - this.margin.bottom;

  xScale = d3.scaleTime()
    .range([0, this.width]);
  yScale = d3.scaleLinear()
    .range([this.height, 0]);

  xAxis = axisBottom(this.xScale);
  yAxis = axisLeft(this.yScale);

  lineFn = d3.line(d => this.xScale(d['date']), d => this.yScale(d['value']))
    .curve(d3.curveCatmullRom.alpha(0.5));
  svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  series;
  data: any;
  enableTooltip: boolean;
  tooltipData: any;
  tooltipPosition: { x: string; y: string; };


  chartClasses = {
    series_g: 'series-g',
    xaxis: 'x-axis',
    yaxis: 'y-axis'
  }
  defaultAnomlyFill = '#ff0063';
  mouseG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;



  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.svg = select("#chart").append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    if (this.rawdata) this.renderChart();
  }

  renderChart() {
    this.svg.select('*').remove();
    this.svg.append("g")
      .attr("class", this.chartClasses.xaxis)
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis);

    this.svg.append("g")
      .attr("class", this.chartClasses.yaxis)
      .call(this.yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")


    this.series = this.svg.selectAll(".series")
      .data(this.constructSeriesData());

    this.series.exit().remove();
    const seriesEnter = this.series.enter()
      .append('path')
      .attr('class', 'series-line')

    this.series.merge(seriesEnter)
      .attr("d", this.lineFn)
      .attr('fill', 'transparent')
      .attr("stroke", (d) => {
        return d[0]['type'] === 'dash' ? this.lineDashColor : this.lineSolidColor;
      }).attr("stroke-dasharray", d => d[0]['type'] === 'dash' ? "6 4" : "0")
      .attr('strok-width', '3px')


    if (this.displayDataPoints) {
      const circles = this.svg.selectAll('.value-points').data(this.data, d => d['value'])
      circles.exit().remove()

      const circleEnter = circles.enter().append('circle').attr('class', 'value-points')

      circles.merge(circleEnter)
        .attr('r', '3')
        .attr('cx', d => this.xScale(d['date']))
        .attr('cy', d => this.yScale(d['value']))
        .attr('fill', this.dataPointsColor)
    }

    const anomlyIcon =
      symbol().type(symbolStar).size(100)

    const anomly = this.svg.selectAll('anomly-icon').data(this.data.filter(d => d.value > d.max || d.value < d.min));

    anomly.exit().remove();
    const anomlyenter = anomly.enter().append('path')
      .attr('d', anomlyIcon)

    anomly.merge(anomlyenter)
      .merge(anomly)
      .attr('transform', d => `translate(${this.xScale(d['date'])},${this.yScale(d['value'])})`)
      .attr('opacity', 0)
      .transition().duration(300)
      .attr('opacity', 1)
      .attr('fill', this.defaultAnomlyFill);
    this.enableTooltips();
  }
  enableTooltips() {
    this.mouseG = this.svg.append("g")
      .attr("class", "mouse-over-effects");

    this.mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', this.width) // can't catch mouse events on a g element
      .attr('height', this.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', (e) => this.mouseoutHandler(e))
      .on('mouseover', e => this.mouseoverHandler(e))
      .on('mousemove', (e, d) => this.mousemoveHandler(e, d));
    this.mouseG.append('line')
      .attr('class', 'tooltip-data-indicator')
      .attr('x2', 0)
      .attr('y2', this.height)
      .attr('x1', 0)
      .attr('y1', this.height)
      .attr('stroke', this.lineSolidColor)
      .attr('stroke-opacity', '.5')

  }
  mouseoutHandler(e: any): void {
    this.enableTooltip = false;
    this.mouseG.select('.tooltip-data-indicator')
      .attr('stroke-opacity', '0')
      .attr('x2', 0)
      .attr('y2', this.height)
      .attr('x1', 0)
      .attr('y1', this.height)
  }
  mouseoverHandler(e: any): void {
    // console.log(e)
  }
  mousemoveHandler(e: any, d): void {
    const mouse = pointer(e);
    const xDate = this.xScale.invert(mouse[0]);
    const bisect = d3.bisector((d) => { return d['date']; }).left;
    const index = bisect(this.data, xDate);
    const d0 = this.data[index - 1] ;
    const d1 = this.data[index];
    const xDateTime = new Date(xDate).getTime()
    const datum = xDateTime - d0.date > d1.date - xDateTime ? d1 : d0;
    this.displayTooltip(datum);
  }
  displayTooltip(datum: any) {
    this.enableTooltip = true;
    this.tooltipData = datum;
    this.positionTooltip(datum);
  }

  private positionTooltip(datum: any) {
    const ttipContainer = select('.ttip')
    if (ttipContainer.empty()) return
    const ttipRect = (ttipContainer.node() as SVGGElement).getBoundingClientRect();
    const svgRect = this.svg.node().getBoundingClientRect();

    const xScaled = this.xScale(datum.date);
    const yScaled = this.yScale(datum.value)
    let x = svgRect.left + xScaled + 150;
    let y = svgRect.top + yScaled - 150;
    if (y < 0) y = 0;
    // if x goes out of bounds
    if (x + ttipRect.width > svgRect.right) {
      x = svgRect.right - ttipRect.width
    }
    this.tooltipPosition = {
      x: `${x}px`,
      y: `${y}px`,
    };

    let ttipLine = this.mouseG.select('.tooltip-data-indicator');
    if (ttipLine.empty()) {
      ttipLine = this.mouseG.append('line')
        .attr('class', 'tooltip-data-indicator')
    }
    ttipLine
      .attr('stroke-opacity', '.5')
      .transition().ease(easeLinear).duration(400)
      .attr('x1', xScaled)
      .attr('y1', yScaled)
      .attr('x2', x)
      .attr('y2', y)

  }

  constructSeriesData(): unknown[] | Iterable<unknown> {
    return [
      this.data.map(d => {
        return {
          ...d,
          value: d.min,
          type: 'dash'
        }
      }),
      this.data.map(d => {
        return {
          ...d,
          value: d.value,
          type: 'solid'
        }
      }),
      this.data.map(d => {
        return {
          ...d,
          value: d.max,
          type: 'dash'
        }
      })
    ]
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.rawdata) {
      this.data = this.rawdata.map((d) => {
        return {
          ...d,
          y: d.value,
          date: (new Date(d.name)).getTime()
        }
      });
      this.xScale.domain(extent(this.data, d => d['date'] as number));
      this.yScale.domain([min(this.data, d => d['min'] as number), max(this.data, d => d['max'] as number)]);

      if (this.svg) this.renderChart();
    }
  }

}
