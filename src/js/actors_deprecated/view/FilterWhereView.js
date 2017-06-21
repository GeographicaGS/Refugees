"use strict";

var Backbone = require('backbone'),
  FilterView = require('./FilterView')
;

module.exports = class FiterWhereView extends FilterView {

  constructor(options){
    super(options);
    this._template = require('../template/filterWhere.html');
    // this.collection.comparator = (m)=>{
    //   if(this._max == null || this._max < m.get('who').size)
    //     this._max = m.get('who').size
    //   return m.get('who').size * -1
    // };
    // this.collection.sort();
  }

  render(){
    let settlementCollection = new Backbone.Collection();
    this._max = null;
    this.collection.each(function(settlement){
      // if(settlement.get('active') && !settlement.get('hide')){
      if(!settlement.get('hide')){
        let actions = settlement.get('actions').where({active:true,hide:false})
        if(actions.length > 0){
          for(var action of actions){
            let actors = action.get('actors').where({active:true,hide:false})
            if(actors.length > 0){
              if(!settlementCollection.get(settlement.get('id')))
                settlementCollection.add({id:settlement.get('id'),active:settlement.get('active'),actors:new Set()});
              for(var actor of actors){
                settlementCollection.get(settlement.get('id')).get('actors').add(actor.get('id'));
              }
            }
          }
        }


      }
    });
    settlementCollection.comparator = (m)=>{
      if(this._max == null || this._max < m.get('actors').size)
        this._max = m.get('actors').size
      return m.get('actors').size * -1
    };
    settlementCollection.sort();
    this.$el.html(this._template({collection:settlementCollection.toJSON(),_:require('underscore')}));
    super.render();
    return this;
  }

  _changeFilter(e){
    if(this.collection.where({active:true,hide:false}).length == this.collection.length){
      this.$('.filterGroup .filter').removeClass('active');
      $(e.currentTarget).addClass('active');
      this.collection.each(function(model) {
         if(model.get('id') != $(e.currentTarget).attr('id'))
          model.set('active',false);
        else
          model.set('active',true);
      });

    }else{
      let model = this.collection.get($(e.currentTarget).attr('id'));
      model.set('active',!model.get('active'));
      $(e.currentTarget).toggleClass('active');
      if(this.collection.where({active:true,hide:false}).length == 0){
        this.$('.filterGroup .filter').addClass('active');
        this.collection.each(function(model) {
           model.set('active',true);
        });
      }
    }
    this.trigger('whereFilter:change');
  }

}
