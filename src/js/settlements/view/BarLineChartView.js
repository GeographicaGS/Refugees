"use strict";

var Backbone = require('backbone'),
  d3 = require('d3'),
  Config = require('../../config.js'),
  CommonBarLineChartView = require('../../view/BarLineChartView')
;

module.exports = class BarLineChartView extends CommonBarLineChartView {

  constructor(options){
    super(options);
  }

  render() {
    let sql = new cartodb.SQL({ user: Config.cartoUser, protocol:'https' });
    sql.execute(`SELECT to_date(year::text,'YYYY') as date, replace(total,',','')::float as totalbar, number_of_settlements as totalline FROM map3_settlements_over_time_annual`)
    .done((data)=>{
      this._draw(data.rows)
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
    return this;
  }

  _popupText(popupText, totalBar, toltaLine, date){
    popupText.select('.first').text(`${totalBar} Refugees and ${toltaLine} Settlements`);
    popupText.select('.second').text(' ' + date);
  }

}
