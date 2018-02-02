import React, { Component } from 'react'
import { getGroupValues } from '../utils/convertData'
import * as d3 from 'd3'
import SVGPanZoom from './SVGPanZoom'
import{ drawLegend } from '../utils/draw'

// bar chart d3 references
// http://bl.ocks.org/mbostock/3943967
const updateD3Node = (props, transition) => {
  var svg = d3.select('#chart')

  svg = svg.select('g')
  svg.selectAll('*').remove()
  svg = svg.append('g')
    .attr('width', props.width)
    .attr('height', props.height)

  // The xz array has m elements, representing the x-values shared by all series.
  // The yz array has n elements, representing the y-values of each of the n series.
  // Each yz[i] is an array of m non-negative numbers representing a y-value for xz[i].
  // The y01z array has the same structure as yz, but with stacked [y₀, y₁] instead of y.
  var [xz, yz, colors, colorScale] = getGroupValues(props) 
  var  n = yz.length,
    y01z = d3.stack().keys(d3.range(n))(d3.transpose(yz)),
    yMax = d3.max(yz, function(y) { return d3.max(y) }),
    y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1] }) })

  var  margin = {top: 40, right: 10, bottom: 40, left: 10},
    width = props.width - margin.left - margin.right,
    height = props.height - margin.top - margin.bottom

  svg = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  var x = d3.scaleBand()
    .domain(xz)
    .rangeRound([0, width])
    .padding(0.08)

  var y = d3.scaleLinear()
    .domain([0, y1Max])
    .range([height, 0])

  var series = svg.selectAll('.series')
    .data(y01z)
    .enter().append('g')
    .attr('fill', function(d, i) { return colors[i] })

  var rect = series.selectAll('rect')
    .data(function(d) { return d })
    .enter().append('rect')
    .attr('x', function(d, i) { return x(xz[i]) })
    .attr('y', height)
    .attr('width', x.bandwidth())
    .attr('height', 0)

  const value = d3.select('#bartype-select').property('value')
  if (transition) {
    if (value === 'grouped') transitionGrouped()
    else transitionStacked()
  } else {
    if (value === 'grouped') noTransitionGrouped()
    else noTransitionStacked()
  }

  svg.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x)
      .tickSize(0)
      .tickPadding(6))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '-.3em')
    .attr('transform', 'rotate(-90)')

  drawLegend(svg, colorScale, props)

  function transitionGrouped() {
    y.domain([0, yMax])

    rect.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10 })
      .attr('x', function(d, i) { return x(xz[i]) + x.bandwidth() / n * this.parentNode.__data__.key })
      .attr('width', x.bandwidth() / n)
      .transition()
      .attr('y', function(d) { return y(d[1] - d[0]) })
      .attr('height', function(d) { return y(0) - y(d[1] - d[0]) })
  }

  function noTransitionGrouped() {
    y.domain([0, yMax])

    rect.attr('x', function(d, i) { return x(xz[i]) + x.bandwidth() / n * this.parentNode.__data__.key })
      .attr('width', x.bandwidth() / n)
      .attr('y', function(d) { return y(d[1] - d[0]) })
      .attr('height', function(d) { return y(0) - y(d[1] - d[0]) })

  }

  function transitionStacked() {
    y.domain([0, y1Max])

    rect.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10 })
      .attr('y', function(d) { return y(d[1]) })
      .attr('height', function(d) { return y(d[0]) - y(d[1]) })
      .transition()
      .attr('x', function(d, i) { return x(xz[i]) })
      .attr('width', x.bandwidth())
  }

  function noTransitionStacked() {
    y.domain([0, y1Max])

    rect.attr('y', function(d) { return y(d[1]) })
      .attr('height', function(d) { return y(d[0]) - y(d[1]) })
      .attr('x', function(d, i) { return x(xz[i]) })
      .attr('width', x.bandwidth())
  }

} 

class BarChart extends Component {

  state = {
    mounted: false
  }

  componentDidMount() {
    updateD3Node(this.props, true)
    this.setState({mounted: true})
  }

  componentWillReceiveProps(nextProps) {
    const transition = nextProps.moreSettings.barType !== this.props.moreSettings.barType
    if (this.state.mounted)  updateD3Node(nextProps, transition)
  }

  render() {
    let d3node = (<svg width={this.props.width} height={this.props.height}></svg>)

    return (
      <div id='chart'>
        <SVGPanZoom d3node={d3node} {...this.props}/> 
      </div>
    )
  }
}

export default BarChart
