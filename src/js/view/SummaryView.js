"use strict";

var Backbone = require('backbone'),
  Config = require('../config.js'),
  Utils = require('../utils.js')
;

module.exports = class SummaryView extends Backbone.View {

  className(){
    return 'summary';
  }

  render() {
    let sql = new cartodb.SQL({ user: Config.cartoUser, protocol:'https' });
    sql.execute(this._query)
    .done((data)=>{
      this.$el.html(this._template({rows:data.rows, Utils:Utils}));
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
    return this;
  }

}
