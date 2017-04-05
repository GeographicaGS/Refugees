"use strict";

var Config = require('../config.js'),
  Utils = require('../utils.js')
;

module.exports = class MapView extends Backbone.View {

  constructor(options){
    super(options);
    this.$el = options.el;
    this._popupHover = L.popup({
      closeButton: false
    });
  }

  events(){
    return {};
  }

  render() {

    this.map = new L.Map(this.$el[0], {
      zoomControl : false,
      scrollWheelZoom: true
    }).setView([1.372598,30.0537566], 7);

    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
      }).addTo(this.map);

    this._labelLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png', {
      }).addTo(this.map);


    new L.Control.Zoom({ position: 'topright' }).addTo(this.map);

    return this;
  }
}
