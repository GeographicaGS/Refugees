"use strict";

var MapView = require('./MapView'),
  template = require('../template/summary.html')
  ;

module.exports = class SummaryView extends Backbone.View {

  constructor(options){
    super(options);
  }

  className(){
    return 'summary';
  }

  render() {
    this.$el.html(template());
    return this;
  }
}
