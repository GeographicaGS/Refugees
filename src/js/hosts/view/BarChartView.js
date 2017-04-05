"use strict";

var Config = require('../../config.js'),
  CommonBarChartView = require('../../view/BarChartView')
;

module.exports = class DataPanelView extends CommonBarChartView {

  render() {
    let sql = new cartodb.SQL({ user: Config.cartoUser });
    sql.execute('SELECT a.dname_uppe as name, b.percentage_refugee as total FROM districts_for_carto a left join map1_host_and_refugees b on a.dname_uppe=b.dname2014 where b.percentage_refugee is not null order by a.dname_uppe')
    .done((data)=>{
      this._draw(data.rows)
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
    return this;
  }

}
