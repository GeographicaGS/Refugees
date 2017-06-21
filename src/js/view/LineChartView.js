"use strict";

var Backbone = require('backbone'),
  d3 = require('d3'),
  ChartView = require('./ChartView'),
  Utils = require('../utils.js')
;

module.exports = class DataPanelView extends ChartView {

  _draw(data){
    this.data = data;
    let parent = this.$el.parent();
    this.$el.html(`<svg width="${parent.width()}" height="${Math.floor(parent.height())}"></svg>`);


    let svg = d3.select(this.$('svg')[0]),
      maxLabel = d3.max(data, function(d) { return Utils.formatNumber(d.total,2); }),
      maxWidth
    ;

    svg.append("text").text(maxLabel).each(function() {maxWidth = Math.ceil(this.getBBox().width) + 10; }).remove()

    // let margin = {top: 20, right: (maxWidth+15), bottom: 30, left: maxWidth},
    let margin = {top: 20, right: (maxWidth+15), bottom: 30, left: 0},
      minDate,
      maxDate,
      width = Math.floor(parent.width()) - margin.left - margin.right,
      height = Math.floor(parent.height()) - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
      x = d3.scaleTime().rangeRound([0, width]),
      y = d3.scaleLinear().rangeRound([height, 0]),
      line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.total); })
    ;

    for(var d of data){
      d.date = new Date(d.date);
    }

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent(data, function(d) { return d.total; }));

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(7).tickFormat(function(d){return Utils.formatDateShort(d);}))
      .append("text")
      .attr("fill", "#000")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      ;

    // g.append("g")
    //   .call(d3.axisLeft(y).ticks(5).tickSize(0))
    //   .select(".domain")
    //   .remove();

    // g.append("g")
    //   .attr("class", "grid")
    //   .call(d3.axisLeft(y).ticks(5).tickSize(-width+20).tickFormat(''))
    //   .select(".domain")
    //   .remove();

    let linePath = g.append("path")
      .datum(data)
      .attr("class", "linePath")
      .attr("fill", "none")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2)
      .attr("d", line);

    let avg = 0;
    for(var d of data){
      avg += d.total;
    }
    avg /= data.length;
    let avgLine = d3.line().curve(d3.curveMonotoneX).x(function(d) { return x(d.date); }).y(function(){ return y(avg); })
    g.append("path")
      .datum(data)
      .attr("class", "linePath blue")
      .attr("fill", "none")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-dasharray","20")
      .attr("stroke-width", 1)
      .attr("d", avgLine)
    ;

    g.append("text")
      .attr('class', 'blue bold')
      .attr("x", x(data[data.length-1].date) + 10)
      .attr("y", y(avg) + 3)
      .text(Utils.formatNumber(avg,2))
    ;

    let totalLength = linePath.node().getTotalLength();
    linePath
     .attr("stroke-dasharray", totalLength + " " + totalLength )
     .attr("stroke-dashoffset", totalLength)
     .transition()
       .duration(1000)
       .ease(d3.easeLinear)
       .attr("stroke-dashoffset", 0);

   let guideline = g.append('line')
      .attr('stroke-width', 1)
      .attr('class', 'guide')
      .attr('x1', 1)
      .attr('y1', 1)
      .attr('x2', 1)
      .attr('y2', height)
      .attr('transform', 'translate(' + width + ')')
    ;

   let circles = g.selectAll("circle")
     .data(data)
     .enter()
     .append("svg:circle")
     .attr('class', 'circle')
     .attr("r","0")
     .attr("cx", function(d) { return x(d.date); })
     .attr("cy", function(d) { return y(d.total); })
     .attr("value",function(d) { return d.total; })
     .attr("date",function(d) {return d.date;})
   ;

    g.append('rect')
     .attr('x',0)
     .attr('y',0)
     .attr('height', height)
     .attr('width', width)
     .attr('fill','transparent')
     .attr("class","interactiveZone")
    ;

    let popup = g.append('rect')
      .attr('x',0)
      .attr('y',0)
      .attr('rx',2)
      .attr('ry',2)
      .attr('height', 20)
      .attr("class","popup")
    ;

    let popupText = g.append("text")
      .attr('class', 'popupText')
      .attr("x", 0)
      .attr("y", 0)
    ;

    popupText.append('tspan').attr("class", "first");
    popupText.append('tspan').attr("class", "second");

    svg.selectAll(".interactiveZone").on('mousemove',function() {

      svg.attr("class", "active");

      let circle,
        minDist = Infinity,
        dist,
        x = d3.mouse(this)[0],
        y = d3.mouse(this)[1],
        textLength;

      guideline.attr('transform', 'translate(' + (x-2) + ')');

      circles._groups[0].forEach(function(d) {
        d = d3.select(d);
        dist = Math.abs(d.attr("cx") - x);
        if(dist < minDist){
          minDist = dist;
          circle = d;
        }
      });

      svg.selectAll("circle.active").classed("active",false).attr("r","0");
      circle.classed("active",true);
      circle.transition().duration(300).attr("r","5");

      // // popupText.html('<tspan class="first">' + Utils.formatNumber(parseInt(circle.attr("value"))) + '</tspan> <tspan> ' + Utils.formatDate(new Date(circle.attr("date"))) + "</tspan>");
      popupText.select('.first').text(Utils.formatNumber(parseInt(circle.attr("value"))));
      popupText.select('.second').text(' ' + Utils.formatDate(new Date(circle.attr("date"))));
      popupText.attr("y", parseFloat(circle.attr("cy")) + 2);
      textLength = popupText.node().getComputedTextLength() + 20;
      popup.attr("y", parseFloat(circle.attr("cy")) - 12);
      popup.attr("width", textLength);

      if(parseFloat(circle.attr("cx")) + textLength > width){
        popupText.attr("x", x - textLength);
        popup.attr("x", x - textLength - 10);
      }else{
        popupText.attr("x", x+15);
        popup.attr("x", x+5);
      }

    });

    svg.selectAll(".interactiveZone").on('mouseout',function() {
      svg.attr("class", null);
      svg.selectAll("circle.active").classed("active",false).attr("r","0");
    });

  }

}
