"use strict";

var Config = require('../config.js'),
  Utils = require('../utils.js')
;

module.exports = class MapView extends Backbone.View {

  constructor(options){
    super(options);
    this.$el = options.el;
    this._ugandaLayer = {
      sql: `SELECT * FROM uganda`,
      cartocss: `#layer {
        polygon-fill: #f5f5f3;
        polygon-opacity:0;
        line-width: 1;
       line-color: #636e73 ;
       line-opacity: 1;

        [zoom >= 8]{
        line-width: 1.25;
        }

      }`
    };
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

  _featureOver(layer){
    layer.setInteraction(true);
    layer.on('featureOver',(e, pos, pixel, data, sublayer)=>{
      this.$('.mapPopup').removeClass('active');
        if(!this.map.hasLayer(this._popupHover) && !this.map.hasLayer(this._popup)){
          this._popupHover
          .setLatLng(pos)
          .openOn(this.map)
          .setContent(this._popupHoverTemplate({Utils:Utils, data:data}))
          ;
        }else if(this.map.hasLayer(this._popupHover)){
          this._popupHover
          .setLatLng(pos)
          .setContent(this._popupHoverTemplate({Utils:Utils, data:data}))
          .update();
        }
        this.$('.mapPopup').addClass('active');
    });
  }

  _mouseout(layer){
    layer.on('mouseout', ()=>{
      this.map.closePopup();
    })
  }

}
