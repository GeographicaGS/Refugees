"use strict";

var Config = require('../../config.js'),
  CommonMapView = require('../../view/MapView'),
  LegendView = require('./LegendView')
;

module.exports = class MapView extends CommonMapView {

  constructor(options){
    super(options);
    this._legendView = new LegendView();
  }

  render() {
    super.render();
    this.$el.append(this._legendView.render().$el);
    return this;
  }
}
