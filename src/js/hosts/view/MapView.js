"use strict";

var Config = require('../../config.js'),
  Utils = require('../../utils.js'),
  CommonMapView = require('../../view/MapView'),
  LegendView = require('./LegendView')
;

module.exports = class MapView extends CommonMapView {

  constructor(options){
    super(options);
    this._popupHoverTemplate = require('../template/mapPopup.html');
    this._popupHoverSettlementTemplate = require('../template/settlementPopup.html');
    this._legendView = new LegendView();
  }

  render() {

    super.render();

    this.$el.append(this._legendView.render().$el);

    cartodb.createLayer(this.map, {
      user_name: Config.cartoUser,
      type: 'cartodb',
      sublayers: [
        this._ugandaLayer,
        {
          sql: `SELECT a.the_geom, a.the_geom_webmercator, a.dname_uppe, a.cartodb_id, b.dname2014,b.refugee_pop,
                b.percentage_refugee, b.host_pop,b.month_year,b.url
                FROM districts_for_carto a
                left join map1_host_and_refugees b
                on a.dname_uppe=b.dname2014`,
          cartocss: `#layer::ramp [zoom > 5]{
           polygon-fill: ramp([refugee_pop], (#d1eeea,#a8dbd9,#85c4c9,#68abb8,#4f90a6,#3b738f,#2a5674), quantiles (7));
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
          sql: `SELECT * FROM map3_settlements_over_time where type!='Refugee transit Centre'`,
          cartocss: require('../../template/settlementsCartoCss.html')(),
          interactivity: 'settlement, capacity, overcapacity, population, established_yyyy_mm_dd, male, female'
        }
    ]
    })
    .addTo(this.map)
    .done((layer)=>{
      this._featureOver(layer.getSubLayer(1));
      this._mouseout(layer.getSubLayer(1));
      this._featureOver(layer.getSubLayer(2),this._popupHoverSettlementTemplate);

    });
    return this;
  }
}
