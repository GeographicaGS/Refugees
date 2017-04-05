"use strict";

var Config = require('../../config.js'),
  Utils = require('../../utils.js'),
  CommonMapView = require('../../view/MapView')
;

module.exports = class MapView extends CommonMapView {

  constructor(options){
    super(options);
    this._popupHover = L.popup({
      closeButton: false
    });
  }

  render() {

    super.render();

    cartodb.createLayer(this.map, {
      user_name: Config.cartoUser,
      type: 'cartodb',
      sublayers: [
        {
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
        },
        {
          sql: `SELECT a.the_geom, a.the_geom_webmercator, a.dname_uppe, a.cartodb_id, b.dname2014,b.refugee_pop,
                b.percentage_refugee, b.host_pop,b.month_year,b.url
                FROM districts_for_carto a
                left join map1_host_and_refugees b
                on a.dname_uppe=b.dname2014`,
          cartocss: `#layer::ramp [zoom > 5]{
             polygon-fill: ramp([percentage_refugee], (#f7feae,#d9edb0,#aed4b2,#7cb8b5,#3a93b9,#0072bc,#0052a3 ), quantiles (7));
              polygon-opacity:1 ;
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
      layer.getSubLayer(1).setInteraction(true);
      layer.getSubLayer(1).on('featureOver',(e, pos, pixel, data, sublayer)=>{
        this.$('.mapPopup').removeClass('active');
        // if(data.percentage_refugee){
          if(!this.map.hasLayer(this._popupHover) && !this.map.hasLayer(this._popup)){
            this._popupHover
            .setLatLng(pos)
            .openOn(this.map)
            .setContent(require('../template/mapPopup.html')({Utils:Utils, data:data}))
            ;
          }else if(this.map.hasLayer(this._popupHover)){
            this._popupHover
            .setLatLng(pos)
            .setContent(require('../template/mapPopup.html')({Utils:Utils, data:data}))
            .update();
          }
          this.$('.mapPopup').addClass('active');
        // }else{
        //   this.map.closePopup();
        // }
      });

      layer.getSubLayer(1).on('mouseout', ()=>{
        this.map.closePopup();
      })

    });

    return this;
  }
}
