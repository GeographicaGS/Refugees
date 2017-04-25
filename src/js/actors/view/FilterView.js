"use strict";

var Backbone = require('backbone'),
  _ = require('underscore')
;

module.exports = class FitlerView extends Backbone.View {

  constructor(options){
    super(options);
    this._max = null;
  }

  render(){
    this.$el.html(this._template({collection:this.collection.toJSON(),_:require('underscore')}));
    _.delay(()=>{
      for(var v of this.$('.barLabel span:last-child')){
        $(v).closest('.filter').find('.barValue').css({'width':((parseInt($(v).text()) * 100)/this._max) + '%'})
      }
    },500);
    return this;
  }

}
