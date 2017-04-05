"use strict";

var Config = require('../../config.js'),
  CommonLineChartView = require('../../view/LineChartView')
;

module.exports = class DataPanelView extends CommonLineChartView {

  constructor(options){
    super(options);
  }

  render() {
    let sql = new cartodb.SQL({ user: Config.cartoUser });
    sql.execute('SELECT date_yyyy_mm_dd as date, sum(count) as total  FROM map2_daily_arrivals group by date_yyyy_mm_dd order by date')
    .done((data)=>{
      this._draw(data.rows)
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
    return this;
  }

}
