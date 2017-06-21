"use strict";

var CommonSummaryView = require('../../view/SummaryView'),
  Utils = require('../utils.js')
;

module.exports = class SummaryView extends CommonSummaryView {

  constructor(options){
    super(options);
    this._template = require('../template/summary.html');

    this._query = `SELECT * FROM(
          SELECT settlement, array_length(actors,1) as count, actors FROM (

          SELECT settlement,

          (SELECT ARRAY(

            SELECT DISTINCT(TRIM(regexp_replace(UNNEST(actors),E'[\n\r]+', '', 'g' )))

          FROM map_5_3w_map_settlements)
          ) as actors FROM (

            SELECT settlement, ${Utils.actionsQuery(Utils.getActionsSet())} as actors

              FROM map_5_3w_map_settlements
            ) as a

        ) as aa  WHERE true ) as aaa WHERE count is not null ORDER BY count DESC`;

  }

  className(){
    return 'summary width400';
  }
}
