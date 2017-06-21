"use strict";

var Config = require('../../config.js'),
  Utils = require('../utils.js'),
  CommonMapView = require('../../view/MapView'),
  LegendView = require('./LegendView')
;

module.exports = class MapView extends CommonMapView {

  constructor(options){
    super(options);
    this._popupHoverDistrictTemplate = require('../../hosts/template/mapPopup.html');
    this._popupHoverTemplate = require('../template/mapPopup.html');
    this._legendView = new LegendView();

    this.actors = options.actors
    this.settlements = options.settlements
    this.sectors = options.sectors
  }

  render() {
    super.render();
    this.$el.append(this._legendView.render().$el);
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
          sql: this._getQuerLayer(this._getIdsFromFilter(this.actors), this._getIdsFromFilter(this.settlements), this._getIdsFromFilter(this.sectors)),
          cartocss: require('../../template/settlementsCartoCss.html')(),
          interactivity: 'settlement,actors,sectors'
        }
    ]
    },{https:true})
    .addTo(this.map)
    .done((layer)=>{
      this._featureOver(layer.getSubLayer(0), this._popupHoverDistrictTemplate);
      this._mouseout(layer.getSubLayer(0));
      this.settlementLayer = layer.getSubLayer(1);
      this._featureOver(layer.getSubLayer(1),this._popupHoverTemplate);
    });

    return this;
  }

  filterMap(){
    this.settlementLayer.setSQL(this._getQuerLayer(this._getIdsFromFilter(this.actors), this._getIdsFromFilter(this.settlements), this._getIdsFromFilter(this.sectors)))
  }

  _getIdsFromFilter(collection){
    let result = [];
    collection.each((c)=>{
      if(c.get('active') && c.get('show')){
        result.push(c.get('id'))
      }
    })
    return result;
  }

  _getQuerLayer(actors, settlements, sectors){
    return `
      SELECT row_number() OVER() AS cartodb_id, map5_t2.settlement_id, map5_t2.settlement, array_to_string(array_agg(distinct(map5_t1.abb)),', ') as actors, array_to_string(array_agg(distinct(map5_t3.sector)),', ') as sectors, map5_t2.the_geom_webmercator, null as type
      FROM map5_t4
      LEFT JOIN map5_t1 on map5_t1.actor_id = map5_t4.actor_id
      LEFT JOIN map5_t2 on map5_t2.settlement_id = map5_t4.settlement_id
      LEFT JOIN map5_t3 on map5_t3.sector_id = map5_t4.sector_id
      WHERE map5_t4.actor_id = any(array[${actors}]) AND map5_t4.settlement_id = any(array[${settlements}]) AND map5_t4.sector_id = any(array[${sectors}])
      group by map5_t2.settlement_id, map5_t2.settlement, map5_t2.the_geom_webmercator
    `;
  }

}
