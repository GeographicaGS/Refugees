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
      var elemets = this.$('.barLabel span:last-child');
      //IE 10 support
      for(var i=0; i<elemets.length; i++){
        $(elemets[i]).closest('.filter').find('.barValue').css({'width':((parseInt($(elemets[i]).text()) * 100)/this._max) + '%'})
      }
    },500);
    return this;
  }

  _changeFilter(e){
    return null;
  }

}
