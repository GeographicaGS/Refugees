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

    new L.Control.Zoom({ position: 'topright' }).addTo(this.map);

    cartodb.createLayer(this.map, {
      user_name: Config.cartoUser,
      type: 'cartodb',
      sublayers: [
        {
          sql: `SELECT a.the_geom, a.the_geom_webmercator, a.dname_uppe, a.cartodb_id, b.dname2014,b.refugee_pop,
                b.percentage_refugee, b.host_pop,b.month_year,b.url
                FROM districts_for_carto a
                left join map1_host_and_refugees b
                on a.dname_uppe=b.dname2014`,
          cartocss: `#layer::ramp [zoom > 5]{
           polygon-fill: ramp([percentage_refugee], (#fff6ac ,#fdca8c ,#fb8b60 ,#f7563c ,#eb160b ,#c90000 ,#960000 ), quantiles);
            polygon-opacity:0.85 ;
          [percentage_refugee = null] {
            polygon-fill: #f5f5f3 ;
            polygon-opacity:0.3 ;
           }

          }

          #layer::limits [zoom > 5]{
           line-width: 3;
           line-color: #ffffff ;
           line-opacity: 0.3;

            [zoom >= 8]{
           line-width: 5;
           line-color: #ffffff ;
           line-opacity: 0.3;
            }
          }

          #layer [zoom > 5]{
           line-width: 0.7;
           line-color: #636e73 ;
           line-opacity: 1;
            line-dasharray: 1, 2;

            [zoom >= 8]{
          	line-width: 1;
            line-dasharray: 1.5, 3;
          	}

          }`,
          interactivity: 'dname_uppe, percentage_refugee, refugee_pop, host_pop, month_year'
        },
        {
          sql: `SELECT * FROM map3_settlements_over_time`,
          cartocss: `#layer {
            marker-width: 16;
            marker-fill-opacity: 1;
            marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170404115910UGD-camp-icon_32.svg');
            marker-allow-overlap: true;

            [zoom >= 9]{
          	marker-width: 24;
          	}
            [zoom >= 11]{
          	marker-width: 32;
          	}
          }`
        }
    ]
    })
    .addTo(this.map)
    .done((layer)=>{
      layer.getSubLayer(0).setInteraction(true);
      layer.getSubLayer(0).on('featureOver',(e, pos, pixel, data, sublayer)=>{
        // if(data.percentage_refugee){
          if(!this.map.hasLayer(this._popupHover) && !this.map.hasLayer(this._popup)){
            this._popupHover
            .setLatLng(pos)
            .setContent(require('../template/mapPopup.html')({Utils:Utils, data:data}))
            .openOn(this.map);
          }else if(this.map.hasLayer(this._popupHover)){
            this._popupHover
            .setLatLng(pos)
            .setContent(require('../template/mapPopup.html')({Utils:Utils, data:data}))
            .update();
          }
        // }else{
        //   this.map.closePopup();
        // }
      });

      layer.getSubLayer(0).on('mouseout', ()=>{
        this.map.closePopup();
      })

    });

    return this;
  }
}
