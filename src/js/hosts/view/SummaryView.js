"use strict";

var CommonSummaryView = require('../../view/SummaryView')
;

module.exports = class SummaryView extends CommonSummaryView {

  constructor(options){
    super(options);
    this._template = require('../template/summary.html');
    // this._query = 'SELECT country, sum(refugees) as total FROM map1_refugees_district WHERE country!=\'Unregistered\' group by country order by total DESC';
    this._query = `SELECT country, sum(refugees) as total
                  FROM (SELECT district,
                     unnest(array['Burundi', 'DR_Congo', 'Eritrea', 'Ethiopia', 'Rwanda', 'Somalia', 'South Sudan', 'Sudan', 'Other', 'Unregistered']) AS "country",
                     unnest(array[burundi, dr_congo, eritrea, ethiopia, rwanda, somalia, south_sudan, sudan, other, unregistered]) AS "refugees"
                  FROM map1refugee_district_breakdown) as a
                  WHERE country!=\'Unregistered\' group by country order by total DESC`;
  }

  className(){
    return 'summary width340';
  }
}
