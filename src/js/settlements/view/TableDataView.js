"use strict";

var CommonTableDataView = require('../../view/TableDataView')
;

module.exports = class TableDataView extends CommonTableDataView {

  constructor(options){
    super(options);
    this._template = require('../template/tableData.html');
    // this._query = 'SELECT settlement,established_yyyy_mm_dd as established_date,capacity,population as refugee_population,male as males,female as females,overcapacity FROM map3_settlements_over_time order by settlement'
    this._query = `SELECT replace(total,',','')::float as total_refugees, number_of_settlements, year FROM map3_settlements_over_time_annual`;
  }
}
