"use strict";

var Backbone = require('backbone'),
  CommonHomeView = require('../../view/HomeView'),
  Config = require('../../config.js'),
  Utils = require('../../utils.js'),
  MapView = require('./MapView'),
  SummaryView = require('./SummaryView'),
  // FilterPanelView = require('./FilterPanelView'),
  DataPanelView = require('./DataPanelView'),
  template = require('../template/home.html')
  ;

module.exports = class HomeView extends CommonHomeView {

  render() {
    this.$el.html(template());

    let sql = new cartodb.SQL({ user: Config.cartoUser, protocol:'https' });
    sql.execute(`SELECT map5_t1.actor_id, map5_t1.name, map5_t2.settlement_id, map5_t2.settlement, map5_t2.district, map5_t3.sector_id, map5_t3.sector
      FROM map5_t4
      LEFT JOIN map5_t1 on map5_t1.actor_id = map5_t4.actor_id
      LEFT JOIN map5_t2 on map5_t2.settlement_id = map5_t4.settlement_id
      LEFT JOIN map5_t3 on map5_t3.sector_id = map5_t4.sector_id
      ORDER BY name`
    )
    .done((data)=>{

      let collection = new Backbone.Collection(data.rows)
      let actors = new Backbone.Collection(_.map(_.uniq(data.rows, function(r) { return r.actor_id; }), function(a){ return {id: a.actor_id, title:a.name, active:true, show:true}; }));
      let settlements = new Backbone.Collection(_.map(_.uniq(data.rows, function(r) { return r.settlement_id; }), function(s){ return {id: s.settlement_id, title:s.settlement, active:true, show:true}; }));
      let sectors = new Backbone.Collection(_.map(_.uniq(data.rows, function(r) { return r.sector_id; }), function(s){ return {id: s.sector_id, title:s.sector, active:true, show:true}; }));

      actors.comparator = (a)=>{
        return a.get('title');
      };
      settlements.comparator = (a)=>{
        return a.get('title');
      };
      sectors.comparator = (a)=>{
        return a.get('title');
      };
      actors.sort();
      settlements.sort();
      sectors.sort();

      this._mapView = new MapView({el:this.$('#map'),actors:actors, settlements:settlements, sectors:sectors});
      this._mapView.render();

      this._summaryView = new SummaryView({actors:actors, settlements:settlements, sectors:sectors, collection:collection});
      this.$el.append(this._summaryView.render().$el);

      this._dataPanelView = new DataPanelView({actors:actors, settlements:settlements, sectors:sectors, collection:collection});
      this.$('#dataPanel').append(this._dataPanelView.render().$el);

      this._summaryView.on('filter:change',() => {
        this._dataPanelView.render();
        this._mapView.filterMap();
      });


    })

    // this._dataPanelView = new FilterPanelView({mapView:this._mapView});
    // this.$('#dataPanel').append(this._dataPanelView.render().$el);
    return this;
  }

}
