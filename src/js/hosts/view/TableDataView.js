"use strict";

var CommonTableDataView = require('../../view/TableDataView')
;

module.exports = class TableDataView extends CommonTableDataView {

  constructor(options){
    super(options);
    this._template = require('../template/tableData.html');
    this._query = 'SELECT district, country, refugees FROM map1_refugees_district order by district, country'
  }
}
