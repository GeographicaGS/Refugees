"use strict";

var Config = require('../config.js'),
  Utils = require('../utils.js'),
  MapView = require('./MapView'),
  template = require('../template/summary.html')
  ;

module.exports = class SummaryView extends Backbone.View {

  constructor(options){
    super(options);
  }

  className(){
    return 'summary';
  }

  render() {
    let sql = new cartodb.SQL({ user: Config.cartoUser });
    sql.execute('SELECT country, sum(refugees) as total FROM map1_refugees_district group by country order by total DESC limit 4')
    .done((data)=>{
      this.$el.html(template({rows:data.rows, Utils:Utils}));
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
    return this;
  }
}
