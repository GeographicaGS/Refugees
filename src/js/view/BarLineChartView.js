"use strict";

var Backbone = require('backbone'),
  d3 = require('d3'),
  ChartView = require('./ChartView'),
  Utils = require('../utils.js')
;

module.exports = class BarLineChartView extends ChartView {

  constructor(options){
    super(options);

    $(window).resize(()=>{
      if(this.data);
      this._draw(this.data);
    });

  }

  _draw(data){
    this.data = data;
    let parent = this.$el.parent();
    this.$el.html(`<svg width="${parent.width()}" height="${parent.height()}"></svg>`);


    let svg = d3.select(this.$('svg')[0]),
      maxLabel = d3.max(data, function(d) { return d.totalbar; }),
      maxWidth = 0
    ;

    svg.append("text").text(maxLabel).each(function() {maxWidth = Math.ceil(this.getBBox().width) + 10; }).remove()

    // let margin = {top: 20, right: (maxWidth + 15), bottom: 30, left: maxWidth},
    // let margin = {top: 20, right: (maxWidth + 15), bottom: 30, left: 0},
    let margin = {top: 30, right: 0, bottom: 30, left: 0},
      minDate,
      maxDate,
      width = Math.floor(parent.width()) - margin.left - margin.right,
      height = Math.floor(parent.height()) - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + (margin.left + 20) + "," + margin.top + ")"),
      // xline = d3.scaleTime().rangeRound([0, width]),
      yline = d3.scaleLinear().rangeRound([height, 0]),
      xbar = d3.scaleBand().rangeRound([0, width]).padding(0.5),
      ybar = d3.scaleLinear().rangeRound([height,0]),
      line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return xbar(d.date) + (xbar.bandwidth()/2); })
        .y(function(d) { return yline(d.totalline); })
    ;

    for(var d of data){
      d.date = new Date(d.date);
    }

    // xline.domain(d3.extent(data, function(d) { return d.date; }));
    yline.domain(d3.extent(data, function(d) { return d.totalline; }));
    xbar.domain(data.map(function(d) { return d.date; }));
    ybar.domain([0, d3.max(data, function(d) { return d.totalbar; })]);

    // g.append("g")
    //   .attr("transform", "translate(0," + height + ")")
    //   .call(d3.axisBottom(xline).ticks(5).tickFormat(function(d){return Utils.formatDateShort(d);}))
    //   .append("text")
    //   .attr("fill", "#000")
    //   .attr("y", 6)
    //   .attr("dy", "0.71em")
    //   .attr("text-anchor", "end")
    //   ;

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xbar).tickFormat(function(d){return d.getFullYear();}))
      .append("text")
      .attr("fill", "#000")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      ;

    // g.append("g")
    //   .call(d3.axisLeft(ybar).ticks(5).tickSize(0))
    //   .select(".domain")
    //   .remove();

    // g.append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 0 - margin.left - 20)
    //   .attr("x",0 - (height / 2))
    //   .attr("dy", "1em")
    //   .style("text-anchor", "middle")
    //   .text("Refugees (columns)");

    // g.append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", width + 25)
    //   .attr("x",0 - (height / 2))
    //   .attr("dy", "1em")
    //   .style("text-anchor", "middle")
    //   .text("Settlements (line)");

    // g.append("g")
    //   .attr("transform", "translate( " + width + ", 0 )")
    //   .call(d3.axisRight(yline).ticks(5).tickSize(0))
    //   .select(".domain")
    //   .remove();

    // g.append("g")
    //   .attr("class", "grid")
    //   .call(d3.axisLeft(yline).ticks(5).tickSize(-width+20).tickFormat(''))
    //   .select(".domain")
    //   .remove();

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "barPath")
        .attr("x", function(d) { return xbar(d.date); })
        .attr("y", height)
        .attr("width", xbar.bandwidth())
        .attr("height", 0)
        .attr("value", function(d) { return d.totalbar; })
        .attr("date", function(d) { return d.date; })
        // .style('fill','#FB8B60')
        .transition()
        .duration(250)
        .delay(function (d, i) {return i * 50;})
        .attr("y", function(d) { return ybar(d.totalbar); })
        .attr("height", function(d) { return height - ybar(d.totalbar); })
    ;

    let linePath = g.append("path")
      .datum(data)
      .attr("class", "linePath blue")
      .attr("fill", "none")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2)
      .attr("d", line);

    g.selectAll(".textbar")
      .data(data)
      .enter().append("text")
        .attr("x", function(d) { return xbar(d.date) + xbar.bandwidth()/2 })
        .attr("y", height)
        .attr("text-anchor", "middle")
        .attr("class", "textbar orange")
        .style('opacity',0)
        .text(function(d){return Utils.formatNumber(d.totalbar);})
        // .append('tspan').text(function(d){return ' - ' +  Utils.formatNumber(d.totalline);})
        // .attr("class", "blue")
    ;

    g.selectAll(".textbar").append('tspan').text(' - ');

    g.selectAll(".textbar")
      .append('tspan').text(function(d){return Utils.formatNumber(d.totalline);})
      .attr("class", "blue");

    g.selectAll(".textbar")
      .transition()
      .duration(250)
      .delay(function (d, i) {return i * 50;})
      .attr("y", function(d) { return ybar(d.totalbar) - 5; })
      .style('opacity',1)

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
     .attr('class', 'circle blue')
     .attr("r","0")
     .attr("cx", function(d) { return xbar(d.date) + (xbar.bandwidth()/2); })
     .attr("cy", function(d) { return yline(d.totalline); })
     .attr("value",function(d) { return d.totalline; })
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
    let _this = this;
    svg.selectAll(".interactiveZone").on('mousemove',function() {

      svg.attr("class", "active");

      let circle,
        bar,
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

      bar = d3.selectAll(`.barPath[date="${circle.attr('date')}"]`)

      // popupText.select('.first').text(Utils.formatNumber(parseInt(circle.attr("value"))));
      // popupText.select('.second').text(' ' + Utils.formatDate(new Date(circle.attr("date"))));
      _this._popupText(popupText,Utils.formatNumber(parseInt(bar.attr("value"))),Utils.formatNumber(parseInt(circle.attr("value"))),Utils.formatDate(new Date(circle.attr("date"))))
      popupText.attr("y", (height/2) + 2);
      textLength = popupText.node().getComputedTextLength() + 20;
      popup.attr("y", (height/2) - 12);
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
