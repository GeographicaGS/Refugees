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
    this._popupHoverSettlementTemplate = require('../../settlements/template/mapPopup.html');
    this._legendView = new LegendView();
    this.bbox={
      arua:L.latLngBounds([2.438228596940692,29.745483398437504],[3.877956193557512,32.63076782226563]),
      adjumani:L.latLngBounds([2.1088986592431382,29.962463378906254],[4.986977441713361,35.73303222656251]),
      midWest:L.latLngBounds([0.9640048075894316,30.34286499023438],[2.4052990502867853,33.22814941406251]),
      southWest:L.latLngBounds([-1.5159363834516735,27.5482177734375],[1.3676679520963495,33.31878662109376]),
      kampala:L.latLngBounds([0.15277844444162314,32.25379943847657],[0.47789973201328145,32.90199279785157])
    }[options.region]
  }

  render() {

    super.render();
    if(this.bbox)
      this.map.fitBounds(this.bbox);

    this.$el.append(this._legendView.render().$el);

    cartodb.createLayer(this.map, {
      user_name: Config.cartoUser,
      type: 'cartodb',
      sublayers: [
        // this._ugandaLayer,
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
          sql: `SELECT * FROM map3_settlements_over_time where type='Refugee settlement'`,
          cartocss: require('../../template/settlementsCartoCss.html')(),
          // interactivity: 'settlement, capacity, overcapacity, population, established_yyyy_mm_dd, male, female'
          interactivity: 'settlement, type'
        }
    ]
    },{https:true})
    .addTo(this.map)
    .done((layer)=>{
      this._featureOver(layer.getSubLayer(0));
      this._mouseout(layer.getSubLayer(0));
      this._featureOver(layer.getSubLayer(1),this._popupHoverSettlementTemplate);

    });
    return this;
  }
}
