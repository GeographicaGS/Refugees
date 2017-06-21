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
    this._max = null;
    this.collection.each(function(settlement){
      if(settlement.get('active') && !settlement.get('hide')){
        settlement.get('actions').each(function(action){
          // if(action.get('active') && !action.get('hide')){
          if(!action.get('hide')){
            let actors = action.get('actors').where({active:true,hide:false});
            if(actors.length != 0){
              if(!actionCollection.get(action.get('id')))
                actionCollection.add({id:action.get('id'),active:action.get('active'),actors:new Set()});
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

  _changeFilter(e){
    if(this.$('.filterGroup .filter:not(.active)').length == 0){
      this.$('.filterGroup .filter').removeClass('active');
      $(e.currentTarget).addClass('active');

      this.collection.each(function(settlement){
        settlement.get('actions').each(function(action){
          if(action.get('id') != $(e.currentTarget).attr('id'))
           action.set('active',false);
         else
           action.set('active',true);
        });
      });

    }else{
      $(e.currentTarget).toggleClass('active');
      if(this.$('.filterGroup .filter.active').length == 0){
        this.$('.filterGroup .filter').addClass('active');
        this.collection.each(function(settlement){
          settlement.get('actions').each(function(action){
            action.set('active',true);
          });
        });
      }else{
        this.collection.each(function(settlement){
          settlement.get('actions').each(function(action){
            if(action.get('id') == $(e.currentTarget).attr('id'))
             action.set('active',!action.get('active'));
          });
        });
      }
    }
    this.trigger('whatFilter:change');
  }

}
