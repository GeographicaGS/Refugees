"use strict";

var Backbone = require('backbone'),
  Config = require('../config.js'),
  Utils = require('../utils.js')
;

module.exports = class TableDataView extends Backbone.View {

  className(){
    return 'tableData';
  }

  render() {
    let sql = new cartodb.SQL({ user: Config.cartoUser });
    sql.execute(this._query)
    .done((data)=>{
      this.$el.html(this._template({rows:data.rows, Utils:Utils, csv:`http://${Config.cartoUser}.cartodb.com/api/v2/sql?format=csv&q=${this._query}`}));
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
    return this;
  }

}
