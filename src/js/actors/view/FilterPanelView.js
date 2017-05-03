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

  render(){
    let sql = new cartodb.SQL({ user: Config.cartoUser, protocol:'https' });
    sql.execute('SELECT settlement,site_management,site_planning,shelter,wash_construction_and_services,protection_and_community_services,health,nutrition,food_distribution,nfi_distribution,logistics,education,enviroment,livelihoods,sgbv from map_5_3w_map_settlements')
    .done((data)=>{
      let whereCollection = new Backbone.Collection();
      let whatCollection = new Backbone.Collection();
      let whoCollection = new Backbone.Collection();
      for(var d of data.rows){
        if(!whereCollection.get(d.settlement))
          whereCollection.add({id:d.settlement,active:true,what:new Set(),who:new Set()})
        for(var k of Object.keys(d)){
          if(k != 'settlement'){
            if(!whatCollection.get(k))
              whatCollection.add({id:k,active:true,where:new Set(),who:new Set()})
            if(d[k] != ''){
              whereCollection.get(d.settlement).get('what').add(k);
              whatCollection.get(k).get('where').add(d.settlement);
            }
            for(var a of d[k].split(',')){
              if(a!=''){
                a = a.trim();
                whatCollection.get(k).get('who').add(a);
                whereCollection.get(d.settlement).get('who').add(a);
                if(!whoCollection.get(a))
                  whoCollection.add({id:a,active:true,where:new Set(),what:new Set()})
                whoCollection.get(a).get('where').add(d.settlement);
                whoCollection.get(a).get('what').add(k);
              }
            }
          }
        }
      }

      let collection = new Backbone.Collection();
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
              action.get('actors').add({
                id:a,
                active:true,
                hide:false
              })
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

      // this._filterWho = new FilterWhoView({collection:whoCollection});
      // this.$el.append(this._filterWho.render().$el);
      // this._filterWhat = new FilterWhatView({collection:whatCollection,whoCollection:whoCollection});
      // this.$el.append(this._filterWhat.render().$el);
      // this._filterWhere = new FilterWhereView({collection:whereCollection});
      // this.$el.append(this._filterWhere.render().$el);

      this._filterWho.on('whoFilter:change',(obj) => {
        this._filterWhat.whoFiltered();
      });

    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
    return this;
  }

}
