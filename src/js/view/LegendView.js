"use strict";

var Backbone = require('backbone');

module.exports = class LegendView extends Backbone.View {

  className(){
    return 'legend';
  }

  events(){
    return {
      'click .closeLegend': '_closeLegend',
      'click .info': '_openLegend'
    };
  }

  render() {
    if(this._template)
      this.$el.html(this._template());
    return this;
  }

  _closeLegend(e){
    e.preventDefault();
    this.$el.addClass('closeState');
  }

  _openLegend(e){
    e.preventDefault();
    this.$el.removeClass('closeState');
  }

}
