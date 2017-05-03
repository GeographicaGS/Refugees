"use strict";

var Backbone = require('backbone'),
  _ = require('underscore')
;

module.exports = class FitlerView extends Backbone.View {

  constructor(options){
    super(options);
    this._max = null;
  }

  events() {
    return {
      'click .filterGroup .filter': '_changeFilter'
    }
  }

  render(){
    _.delay(()=>{
      for(var v of this.$('.barLabel span:last-child')){
        $(v).closest('.filter').find('.barValue').css({'width':((parseInt($(v).text()) * 100)/this._max) + '%'})
      }
    },500);
    return this;
  }

  _changeFilter(e){

    if(this.collection.where({active:true}).length == this.collection.length){
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
      if(this.collection.where({active:true}).length == 0){
        this.$('.filterGroup .filter').addClass('active');
        this.collection.each(function(model) {
           model.set('active',true);
        });
      }
    }
  }

  whoFiltered(){
    // this.collection.each((model)=>{
    //   model.set('hide',true)
    //   for(var w of this._whoCollection.toJSON()){
    //     if(w.active && model.get('who').has(w.id)){
    //       model.set('hide',false);
    //       break;
    //     }
    //   }
    // });
    // this.collection.each((model)=>{
    //   if(settlement.get('active') && !settlement.get('hide')){
    //     action.get('actors').each(function(actor){
    //       debugger;
    //     });
    //   });
    // });
    this.render();
  }

}
