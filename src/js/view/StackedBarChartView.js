"use strict";

var Backbone = require('backbone'),
  d3 = require('d3'),
  Utils = require('../utils.js')
;

module.exports = class StackedBarChartView extends Backbone.View {

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
      maxLabel = d3.max(data, function(d) { return d.total; }),
      maxWidth,
      colors = []
    ;

    for(var key in this.metaModel.toJSON()){
      colors.push(this.metaModel.get(key).color);
    }

    svg.append("text").text(maxLabel).each(function() { maxWidth = Math.ceil(this.getBBox().width) + 10; }).remove()
    let margin = {top: 20, right: maxWidth, bottom: 30, left: maxWidth},
      minDate,
      maxDate,
      width = Math.floor(parent.width()) - margin.left - margin.right,
      height = Math.floor(parent.height()) - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
      x = d3.scaleBand().rangeRound([0, width]).padding(0.5),
      y = d3.scaleLinear().rangeRound([height,0]),
      z = d3.scaleOrdinal().range(colors);
    ;

    var keys = Object.keys(this.metaModel.toJSON());
    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d) { return d.total; })]);
    z.domain(keys);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-width+20).tickFormat(''))
      .select(".domain")
      .remove();

    g.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .append("text")
      .attr("class", "textx")
      .attr("fill", "#000")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      ;

    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickSize(0))
      .select(".domain")
      .remove();

    data.forEach(function(d) {
        var y0 = 0;
        d.values = z.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
    });

    var bar = g.selectAll(".label")
      .data(data)
      .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x(d.name) + ",0)"; });

    var bar_enter = bar.selectAll("rect")
      .data(function(d) { return d.values; })
      .enter();

    bar_enter.append("rect")
      .attr("name", (d)=> {return this.metaModel.get(d.name).name; })
      .attr("total", function(d) {return d.y1 - d.y0; })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(0); })
      .attr("height",0)
      .style("fill", function(d) { return z(d.name); })
      .transition()
      .duration(250)
      .ease(d3.easeLinear)
      // .delay(function (d, i) {return i * 50;})
      .attr("y", function(d) { return y(d.y1); })
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
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

    let texts = this.$('.xaxis text'),
      maxTextWidth = width/texts.length;
    for(var i=0; i<texts.length; i++){
      var textLength = texts[i].getComputedTextLength(),
        text = d3.select(texts[i]).text(),
        originalText = text;
      while (textLength > (maxTextWidth - 2) && text.length > 0) {
        text = text.slice(0, -1);
        // d3.select(texts[i]).html(`${text}...<title>${originalText}</title>`);
        d3.select(texts[i]).text(`${text}...`);
        d3.select(texts[i]).append('title').text(originalText)
        textLength = texts[i].getComputedTextLength();
      }
    }

    svg.selectAll("rect").on('mousemove',function() {

      svg.attr("class", "active");

      let circle,
        x = d3.mouse(this)[0],
        y = d3.mouse(this)[1],
        textLength
      ;

      // popupText.html('<tspan class="first">' + $(this).attr('name')  + ':</tspan> <tspan> ' + Utils.formatNumber(parseFloat($(this).attr("total"))) + "</tspan>");
      popupText.select('.first').text($(this).attr('name'));
      popupText.select('.second').text(' ' + Utils.formatNumber(parseFloat($(this).attr("total"))));
      popupText.attr("y", y + 2);
      textLength = popupText.node().getComputedTextLength() + 20;
      popup.attr("y", y - 12);
      popup.attr("width", textLength);

      popupText.attr("transform", $(this).closest('g').attr('transform'));
      popup.attr("transform", $(this).closest('g').attr('transform'));

      let string = popupText.attr("transform"),
      translate = parseInt(string.substring(string.indexOf("(")+1, string.indexOf(")")).split(",")[0]);

      if(translate + x + textLength > width){
        popupText.attr("x", x - textLength);
        popup.attr("x", x - textLength - 10);
      }else{
        popupText.attr("x", x+15);
        popup.attr("x", x+5);
      }
    });

    svg.selectAll("rect").on('mouseout',function() {
      svg.attr("class", null);
    });

  }

}
