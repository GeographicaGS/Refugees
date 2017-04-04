"use strict";

var Config = require('../config.js'),
  Utils = require('../utils.js'),
  template = require('../template/tableData.html')
  ;

module.exports = class TableDataView extends Backbone.View {

  constructor(options){
    super(options);
  }

  className(){
    return 'tableData';
  }

  render() {

    let sql = new cartodb.SQL({ user: Config.cartoUser });
    sql.execute('SELECT district, country, refugees FROM map1_refugees_district order by district, country')
    .done((data)=>{
      this.$el.html(template({rows:data.rows, Utils:Utils}));
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
    return this;
  }
}
