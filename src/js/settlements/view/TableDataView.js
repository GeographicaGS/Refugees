"use strict";

var CommonTableDataView = require('../../view/TableDataView')
;

module.exports = class TableDataView extends CommonTableDataView {

  constructor(options){
    super(options);
    this._template = require('../template/tableData.html');
    this._query = 'SELECT settlement,established_yyyy_mm_dd,population,capacity,overcapacity FROM map3_settlements_over_time order by settlement'
  }
}
