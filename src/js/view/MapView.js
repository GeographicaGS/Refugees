"use strict";

module.exports = class MapView extends Backbone.View {

  constructor(options){
    super(options);
    this.$el = options.el;
  }

  events(){
    return {};
  }

  render() {

    this.map = new L.Map(this.$el[0], {
      zoomControl : false,
      scrollWheelZoom: true
    }).setView([1.372598,30.0537566], 7);

    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
      }).addTo(this.map);

    new L.Control.Zoom({ position: 'topright' }).addTo(this.map);

    return this;
  }
}
