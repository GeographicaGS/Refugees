"use strict";

var CommonTableDataView = require('../../view/TableDataView')
;

module.exports = class TableDataView extends CommonTableDataView {

  constructor(options){
    super(options);
    this._template = require('../template/tableData.html');
    this._query = 'SELECT settlment_name, source, date_yyyy_mm_dd as date,count FROM map2_daily_arrivals order by date, settlment_name, collection_point'
  }
}
