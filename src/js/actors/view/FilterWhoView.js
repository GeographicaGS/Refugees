"use strict";

var Backbone = require('backbone'),
  FilterView = require('./FilterView')
;

module.exports = class FiterWhoView extends FilterView {

  constructor(options){
    super(options);
    this._template = require('../template/filterWho.html');
    // this.collection.comparator = (m)=>{
    //   if(this._max == null || this._max < m.get('where').size)
    //     this._max = m.get('where').size
    //   return m.get('where').size * -1
    // };
    // this.collection.sort();
  }

  _changeFilter(e){
    super._changeFilter(e);
    this.trigger('whoFilter:change');
  }

  render(){
    let actorsCollection = new Backbone.Collection();
    this.collection.each(function(settlement){
      if(settlement.get('active') && !settlement.get('hide')){
        settlement.get('actions').each(function(action){
          if(action.get('active') && !action.get('hide')){
            action.get('actors').each(function(actor){
              if(actor.get('active') && !actor.get('hide')){
                if(!actorsCollection.get(actor.get('id')))
                  actorsCollection.add({id:actor.get('id'),settlements:new Set()});
                actorsCollection.get(actor.get('id')).get('settlements').add(settlement.get('id'));
              }
            });
          }
        });
      }
    });
    actorsCollection.comparator = (m)=>{
      if(this._max == null || this._max < m.get('settlements').size)
        this._max = m.get('settlements').size
      return m.get('settlements').size * -1
    };
    actorsCollection.sort();
    this.$el.html(this._template({collection:actorsCollection.toJSON(),_:require('underscore')}));
    super.render();
    return this;
  }

}
