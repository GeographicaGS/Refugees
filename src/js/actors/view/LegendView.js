"use strict";

var CommonLegendView = require('../../view/LegendView'),
  Config = require('../../config.js'),
  Utils = require('../../utils.js')
;

module.exports = class LegendView extends CommonLegendView {

  constructor(options){
    super(options);
    this._template = require('../template/legendTemplate.html')
  }

  render(){
    let sql = new cartodb.SQL({ user: Config.cartoUser, protocol:'https' });
    sql.execute('SELECT max(refugee_pop), min(refugee_pop) from map1_host_and_refugees')
    .done((data)=>{
      this.$el.html(this._template({max:data.rows[0].max,min:data.rows[0].min,Utils:Utils}))
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
    return this;
  }

}
