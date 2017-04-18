"use strict";

var Backbone = require('backbone'),
  d3 = require('d3'),
  Config = require('../../config.js'),
  CommonLineChartView = require('../../view/LineChartView')
;

module.exports = class DataPanelView extends CommonLineChartView {

  constructor(options){
    super(options);
    this.listenTo(this.model,'change:range',()=>{
      this._query = `SELECT date_yyyy_mm_dd as date, sum(count) as total
        FROM map2_daily_arrivals
        where date_yyyy_mm_dd is not null and count is not null  AND date_yyyy_mm_dd >= '${this.model.get('range').start.toISOString()}'::timestamp AND date_yyyy_mm_dd <= '${this.model.get('range').finish.toISOString()}'::timestamp
        group by date_yyyy_mm_dd order by date`
      this.render();
    });
  }

  render() {
    if(this._query){
      let sql = new cartodb.SQL({ user: Config.cartoUser });
      sql.execute(this._query)
      .done((data)=>{
        this._draw(data.rows)
      })
      .error((errors)=>{
        console.log("errors:" + errors);
      })
    }
    return this;
  }

  _draw(data){
    super._draw(data);
    d3.selectAll(this.$('svg >g')).append('line')
       .attr('stroke-width', 1)
       .attr('class', 'guideTime')
       .attr('x1', 1)
       .attr('y1', 1)
       .attr('x2', 1)
       .attr('y2', d3.selectAll(this.$('.guide')).attr('y2'))
       .attr('transform', 'translate(0)')
     ;
  }

}
