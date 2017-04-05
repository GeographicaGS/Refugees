"use strict";

var CommonSummaryView = require('../../view/SummaryView')
  ;

module.exports = class SummaryView extends CommonSummaryView {

  constructor(options){
    super(options);
    this._template = require('../template/summary.html');
    this._query = 'SELECT collection_point, sum(count) as total FROM map2_daily_arrivals group by collection_point order by total DESC limit 4';
  }
}
