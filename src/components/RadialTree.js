import React, { Component } from 'react'
import * as d3 from 'd3'
import { getTreeRoot } from '../utils/convertData'
import { getColorScale } from '../utils/scales'
import SVGPanZoom from './SVGPanZoom'
import chroma from 'chroma-js'
import { drawLegend } from '../utils/draw'

// radial tree d3 reference: https://bl.ocks.org/mbostock/4063550
const updateD3Node = (props) => {

  var colorScale = getColorScale(props)

  d3.selectAll('.d3ToolTip').remove()
  var tooltip = d3.select('body').append('div').attr('class', 'd3ToolTip')

  var svg = d3.select('#chart')

  svg = svg.select('g')
  svg.selectAll('*').remove()
  svg = svg.append('g')
    .attr('width', props.width)
    .attr('height', props.height)
    .append('g')
    .attr('transform', 'translate(' + (props.width/2) + ',' + (props.height/2) + ')')
    .attr('font-family', 'sans-serif')
    .attr('font-size', props.moreSettings.fontSize)

  var radius = Math.min(props.width, props.height) / 2 * 0.8 

  var radialCluster = d3.cluster()
    .size([2*Math.PI, radius])
    .separation(function(a, b) {
      return (a.parent === b.parent ? 1 : 2) / a.depth
    })

  var radialTree = d3.tree()
    .size([2*Math.PI, radius])
    .separation(function(a, b) {
      return (a.parent === b.parent ? 1 : 2) / a.depth
    })
  
  var diagonal = d3.linkRadial()
    .angle(function(d) { return d.x })
    .radius(function(d) { return d.y })

  const radialPoint = (x, y) => {
    return [(y = +y) * Math.cos(x -= Math.PI /2), y * Math.sin(x)]
  }

  // convert data to d3 hierarchy format
  var root = getTreeRoot(props)
  if (root) {
    root = (props.treeType === 'cluster') ? radialCluster(root) : radialTree(root)
  } else { // null returned, error encountered while generating tree
    return null
  }
  
  // define link between nodes
  svg.selectAll('.link')
    .data(root.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .style('fill', 'none')
    .style('stroke', '#555')
    .style('stroke-opacity', '0.5')
    .style('stroke-width', '1.5')
    .attr('d', diagonal)

  // define node
  var node = svg.selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', function(d) {
      return 'translate(' + radialPoint(d.x, d.y) + ')'
    })
    .on('mouseover', function(d,i) {
      d3.select('#circle'+i)
        .attr('fill', chroma(colorScale(d.data.color)).brighten(0.6))
      d3.select('#text'+i)
        .attr('font-weight', 'bold')
    })
    .on('mouseout', function(d,i) {
      d3.select('#circle'+i)
        .attr('fill', colorScale(d.data.color))
      d3.select('#text'+i)
        .attr('font-weight', 'normal')
    })

  // add circles
  node.append('circle')
    .attr('id', function(d,i) { return 'circle' + i })
    .attr('r', 4)
    .attr('fill', function(d) { return colorScale(d.data.color) })
    .on('mousemove', function(d) {
      tooltip
        .style('left', d3.event.pageX + 10 + 'px')
        .style('top', d3.event.pageY + 10 + 'px')
        .style('display', 'inline-block')
        .html(d.data.tooltipHTML)
    })
    .on('mouseout', function(d) {
      tooltip.style('display', 'none')
    })

  // add labels
  node.append('text')
    .attr('id', function(d,i) { return 'text' + i })
    .attr('dy', '0.3em')
    .attr('x', function(d) { return (d.x < Math.PI) === (!d.children) ? 6 : -6 })
    .attr('text-anchor', function(d) { return (d.x < Math.PI) === (!d.children) ? 'start' : 'end' })
    .attr('transform', function(d) {
      return 'rotate(' + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI/2) * 180 / Math.PI + ')'
    })
    .text(function (d) { return d.data.label })
    .on('mousemove', function(d) {
      tooltip
        .style('left', d3.event.pageX + 10 + 'px')
        .style('top', d3.event.pageY + 10 + 'px')
        .style('display', 'inline-block')
        .html(d.data.tooltipHTML)
    })
    .on('mouseout', function(d) {
      tooltip.style('display', 'none')
    })

  drawLegend(svg, colorScale, props)
} 

class RadialTree extends Component {

  state = {
    mounted: false
  }

  componentDidMount() {
    updateD3Node(this.props)
    this.setState({mounted: true})
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.mounted) updateD3Node(nextProps)
  }

  render() {
    return (
      <div id='chart'>
        <SVGPanZoom {...this.props}>
          <svg width={this.props.width} height={this.props.height}></svg>
        </SVGPanZoom>
      </div>
    )
  }
}

export default RadialTree
