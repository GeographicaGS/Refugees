"use strict";

var Backbone = require('backbone'),
  Config = require('../config.js'),
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
    this._popupHover = L.popup({
      closeButton: false,
      // keepInView:true
      autoPan:false
    });

    $(window).resize(()=>{
      setTimeout(()=>{
        this.map.invalidateSize()
      }, 300);
    });

  }

  events(){
    return {};
  }

  remove(){
    if(this._legendView)
      this._legendView.remove();

    this.map.remove();
    this.$el.remove();
    super.remove();
  }

  render() {

    this.map = new L.Map(this.$el[0], {
      zoomControl : false,
      scrollWheelZoom: true
    }).setView([1.372598,32.582520], 7);

    // L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png', {
    //     //  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
    //   }).addTo(this.map);
    //
    // this._labelLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png', {
    //   }).addTo(this.map);

    // L.tileLayer('https://api.mapbox.com/styles/v1/gecko/cj1c3beu800dc2rqmm4fjrwh4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2Vja28iLCJhIjoidktzSXNiVSJ9.NyDfX4V8ETtONgPKIeQmvw', {
    // }).addTo(this.map);

    L.tileLayer('https://api.mapbox.com/styles/v1/gecko/cj27rw7wy001w2rmzx0qdl0ek/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2Vja28iLCJhIjoidktzSXNiVSJ9.NyDfX4V8ETtONgPKIeQmvw', {
    }).addTo(this.map);

    new L.Control.Zoom({ position: 'topright' }).addTo(this.map);

    this.$el.append(`<a class="geckoLink" href="http://www.geogecko.com/" target="_blank">Made by Geo Gecko</a>`);

    return this;
  }

  _featureOver(layer,popupTemplate=null,marginTop=null){
    layer.setInteraction(true);
    popupTemplate = popupTemplate ? popupTemplate:this._popupHoverTemplate;
    layer.on('featureOver',(e, pos, pixel, data, sublayer)=>{
      if(!this.map.hasLayer(this._popupHover) && !this.map.hasLayer(this._popup)){
        this._popupHover
        .setLatLng(pos)
        .openOn(this.map)
        .setContent(popupTemplate({Utils:Utils, data:data}))
        ;
      }else if(this.map.hasLayer(this._popupHover)){
        this._popupHover
        .setLatLng(pos)
        .setContent(popupTemplate({Utils:Utils, data:data}))
        .update();
      }
      if(pixel.y < (marginTop ? marginTop:this.$('.mapPopup').height())){
        this.$('.mapPopup').addClass('bottom');
      }

    });
  }

  _mouseout(layer){
    layer.on('mouseout', ()=>{
      this.map.closePopup();
    })
  }

}
