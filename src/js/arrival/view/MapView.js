"use strict";

var Config = require('../../config.js'),
  Utils = require('../../utils.js'),
  CommonMapView = require('../../view/MapView')
;

module.exports = class MapView extends CommonMapView {


  render() {
    super.render();
    return this;
  }
}
