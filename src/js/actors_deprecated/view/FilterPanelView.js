"use strict";

var Backbone = require('backbone'),
  Config = require('../../config.js'),
  FilterWhoView = require('./FilterWhoView'),
  FilterWhatView = require('./FilterWhatView'),
  FilterWhereView = require('./FilterWhereView')
;

module.exports = class FitlerPanelView extends Backbone.View {

  constructor(options){
    super(options);
    this._mapView = options.mapView;
  }

  remove(){
    if(this._filterWho)
      this._filterWho.remove();
    if(this._filterWhat)
      this._filterWhat.remove();
    if(this._filterWhere)
      this._filterWhere.remove();
  }

  className(){
    return 'filterColumns';
  }

  events() {
    return {
      'click .clearFilters': '_clearFilters'
    }
  }

  render(){
    this.$el.append(`<a class="clearFilters clear" href="#">Clear filters</a>`);
    let sql = new cartodb.SQL({ user: Config.cartoUser, protocol:'https' });
    sql.execute('SELECT settlement,site_management,site_planning,shelter,wash_construction_and_services,protection_and_community_services,health,nutrition,food_distribution,nfi_distribution,logistics,education,enviroment,livelihoods,sgbv from map_5_3w_map_settlements')
    .done((data)=>{
      let collection = new Backbone.Collection();
      this.collection = collection;
      for(var d of data.rows){
        let model = new Backbone.Model({
          id:d.settlement,
          active:true,
          hide:false,
          actions:new Backbone.Collection()
        });
        for(var k of Object.keys(d)){
          if(k != 'settlement' && d[k] != ''){
            let action = model.get('actions').add({
              id:k,
              active:true,
              hide:false,
              actors:new Backbone.Collection()
            });
            for(var a of d[k].split(',')){
              a = a.trim();
              if(a != ''){
                action.get('actors').add({
                  id:a,
                  active:false,
                  hide:false
                })
              }
            }
          }
        }
        collection.add(model)
      }
      this._filterWho = new FilterWhoView({collection:collection});
      this.$el.append(this._filterWho.render().$el);
      this._filterWhat = new FilterWhatView({collection:collection});
      this.$el.append(this._filterWhat.render().$el);
      this._filterWhere = new FilterWhereView({collection:collection});
      this.$el.append(this._filterWhere.render().$el);

      this._filterWho.on('whoFilter:change',(obj) => {
        this._clearFilters();
        // this._filterWhere.render();
        // this._filterWhat.render();
        // this._mapView.filterMap(collection);
      });

      this._filterWhat.on('whatFilter:change',(obj) => {
        this._filterWhere.render();
        // this._filterWho.render();
        this._mapView.filterMap(collection);
      });

      this._filterWhere.on('whereFilter:change',(obj) => {
        this._filterWhat.render();
        // this._filterWho.render();
        this._mapView.filterMap(collection);
      });



    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
    return this;
  }

  _clearFilters(e){
    e ? e.preventDefault():null;
    this.collection.each(function(settlement){
      // settlement.set('hide',false);
      settlement.set('active',true);
      settlement.get('actions').each(function(action){
        // action.set('hide',false);
        action.set('active',true);
        // action.get('actors').each(function(actor){
        //   actor.set('hide',false);
        //   actor.set('active',true);
        // });
      });
    });
    this._filterWhat.render();
    // this._filterWho.render();
    this._filterWhere.render();
    this._mapView.filterMap(this.collection);
  }

}
