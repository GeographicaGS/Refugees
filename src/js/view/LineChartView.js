"use strict";

var d3 = require('d3');

module.exports = class DataPanelView extends Backbone.View {

  constructor(options){
    super(options);
  }

  render() {
    _.defer(()=>{
      this._draw();
    });
    return this;
  }

  _draw(){

    var data = [
      {date:'24-Apr-07',close:93.24},
      {date:'25-Apr-07',close:95.35},
      {date:'26-Apr-07',close:98.84},
      {date:'27-Apr-07',close:99.92},
      {date:'30-Apr-07',close:99.80}
    ];

    let parent = this.$el.parent();
    this.$el.html(`<svg width="${parent.width()}" height="${parent.height()}"></svg>`);


    let svg = d3.select(this.$('svg')[0]),
      maxLabel = d3.max(data, function(d) { return d.close; }),
      maxWidth
    ;

    svg.append("text").text(maxLabel).each(function() { maxWidth = this.getBBox().width; }).remove()

    let margin = {top: 20, right: maxWidth, bottom: 30, left: maxWidth},
      width = Math.floor(parent.width()) - margin.left - margin.right,
      height = Math.floor(parent.height()) - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
      parseTime = d3.timeParse("%d-%b-%y"),
      x = d3.scaleTime().rangeRound([0, width]),
      y = d3.scaleLinear().rangeRound([height, 0]),
      line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.close); })
    ;

    for(var d of data){
      d.date = parseTime(d.date);
    }

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent(data, function(d) { return d.close; }));

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .append("text")
      .attr("fill", "#000")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      ;

    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickSize(0))
      .select(".domain")
      .remove();

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-width+20).tickFormat(''))
      .select(".domain")
      .remove();

    let mainPath = g.append("path")
      .datum(data)
      .attr("class", "mainPath")
      .attr("fill", "none")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2)
      .attr("d", line);

    let totalLength = mainPath.node().getTotalLength();
    mainPath
     .attr("stroke-dasharray", totalLength + " " + totalLength )
     .attr("stroke-dashoffset", totalLength)
     .transition()
       .duration(1000)
       .ease(d3.easeLinear)
       .attr("stroke-dashoffset", 0);

  }

}
