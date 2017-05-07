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
    this._query = `SELECT (SELECT count(*) FROM map3_settlements_over_time WHERE type='Refugee settlement') as count, table_label as label, population, to_date(established_yyyy_mm_dd,'DD/MM/YYYY') as date FROM map3_settlements_over_time WHERE table_label is not null and table_label!='' AND type='Refugee settlement' order by date DESC`;
  }
}
