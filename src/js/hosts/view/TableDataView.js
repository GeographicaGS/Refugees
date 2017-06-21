"use strict";

var CommonTableDataView = require('../../view/TableDataView')
;

module.exports = class TableDataView extends CommonTableDataView {

  constructor(options){
    super(options);
    this._template = require('../template/tableData.html');
    // this._query = 'SELECT district, country, refugees FROM map1_refugees_district order by district, country'
    this._query = `SELECT district,
                     unnest(array['Burundi', 'DR_Congo', 'Eritrea', 'Ethiopia', 'Rwanda', 'Somalia', 'South Sudan', 'Sudan', 'Other', 'Unregistered']) AS country,
                     unnest(array[burundi, dr_congo, eritrea, ethiopia, rwanda, somalia, south_sudan, sudan, other, unregistered]) AS refugees
                  FROM map1refugee_district_breakdown order by district, country`
  }
}
