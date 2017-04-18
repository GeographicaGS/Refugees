"use strict";

var CommonSummaryView = require('../../view/SummaryView')
;

module.exports = class SummaryView extends CommonSummaryView {

  className(){
    return 'summary width400';
  }

  constructor(options){
    super(options);
    this._template = require('../template/summary.html');
    this._query = 'SELECT settlement, capacity, overcapacity FROM map3_settlements_over_time order by capacity DESC';
  }
}
