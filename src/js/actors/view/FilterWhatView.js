"use strict";

var Backbone = require('backbone'),
  FilterView = require('./FilterView')
;

module.exports = class FiterWhatView extends FilterView {

  constructor(options){
    super(options);
    this._template = require('../template/filterWhat.html');
    // this.collection.comparator = (m)=>{
    //   if(this._max == null || this._max < m.get('who').size)
    //     this._max = m.get('who').size
    //   return m.get('who').size * -1
    // };
    // this.collection.sort();
    // this._whoCollection = options.whoCollection;
  }

  render(){
    let actionCollection = new Backbone.Collection();
    this.collection.each(function(settlement){
      if(settlement.get('active') && !settlement.get('hide')){
        settlement.get('actions').each(function(action){
          if(action.get('active') && !action.get('hide')){
            let actors = action.get('actors').where({active:true,hide:false});
            if(actors.length != 0){
              if(!actionCollection.get(action.get('id')))
                actionCollection.add({id:action.get('id'),actors:new Set()});
              for(var actor of actors){
                actionCollection.get(action.get('id')).get('actors').add(actor.get('id'));
              }
            }
          }
        });
      }
    });
    actionCollection.comparator = (m)=>{
      if(this._max == null || this._max < m.get('actors').size)
        this._max = m.get('actors').size
      return m.get('actors').size * -1
    };
    actionCollection.sort();
    this.$el.html(this._template({collection:actionCollection.toJSON(),_:require('underscore')}));
    super.render();
    return this;
  }

}
