"use strict";

var Config = require('../../config.js'),
  Utils = require('../../Utils.js'),
  CommonTableDataView = require('../../view/TableDataView')
;

module.exports = class TableDataView extends CommonTableDataView {

  constructor(options){
    super(options);
    this._template = require('../template/tableData.html');
    this.listenTo(this.model,'change:range',()=>{
      this._query = `SELECT source as from, settlment_name, date_yyyy_mm_dd as date,count as refugees FROM map2_daily_arrivals where date_yyyy_mm_dd is not null and count is not null AND date_yyyy_mm_dd >= '${this.model.get('range').start.toISOString()}'::timestamp AND date_yyyy_mm_dd <= '${this.model.get('range').finish.toISOString()}'::timestamp order by date, settlment_name, collection_point`
      this.render();
    });
  }

  render() {
    if(this._query){
      let sql = new cartodb.SQL({ user: Config.cartoUser });
      sql.execute(this._query)
      .done((data)=>{
        this.$el.html(this._template({rows:data.rows, Utils:Utils, csv:`http://${Config.cartoUser}.cartodb.com/api/v2/sql?format=csv&q=${this._query}`}));
      })
      .error((errors)=>{
        console.log("errors:" + errors);
      })
    }
    return this;
  }

}
