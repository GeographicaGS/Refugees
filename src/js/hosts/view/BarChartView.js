"use strict";

var Config = require('../../config.js'),
  CommonBarChartView = require('../../view/BarChartView')
  // Utils = require('../../utils.js')
;

module.exports = class DataPanelView extends CommonBarChartView {

  render() {
    let sql = new cartodb.SQL({ user: Config.cartoUser });
    sql.execute('SELECT a.dname_uppe as name, b.refugee_pop as total FROM districts_for_carto a left join map1_host_and_refugees b on a.dname_uppe=b.dname2014 where b.percentage_refugee is not null order by b.refugee_pop DESC')
    .done((data)=>{
      this._draw(data.rows)
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
    return this;
  }

  // _popupText(name,total){
  //   return '<tspan class="first">' + name  + ':</tspan> <tspan> ' + Utils.formatNumber(parseFloat(total)) + '</tspan>';
  // }

}
