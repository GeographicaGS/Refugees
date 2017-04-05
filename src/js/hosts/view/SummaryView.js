"use strict";

var CommonSummaryView = require('../../view/SummaryView')
;

module.exports = class SummaryView extends CommonSummaryView {

  constructor(options){
    super(options);
    this._template = require('../template/summary.html');
    this._query = 'SELECT country, sum(refugees) as total FROM map1_refugees_district group by country order by total DESC limit 4';
  }
}
