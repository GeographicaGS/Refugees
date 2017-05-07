"use strict";

var Backbone = require('backbone'),
  moment = require('moment'),
  Config = require('../../config.js'),
  Utils = require('../../utils.js'),
  CommonSummaryView = require('../../view/SummaryView')
  ;

module.exports = class SummaryView extends CommonSummaryView {

  className(){
    // return 'summary width400';
    return 'summary width340';
  }

  constructor(options){
    super(options);
    // this._query = 'SELECT collection_point, sum(count) as total FROM map2_daily_arrivals where count is not null AND collection_point is not null  group by collection_point order by total DESC limit 4';
    this.listenTo(this.model,'change:range',()=>{
      if(this._isWeek()){
        this._query = `SELECT source, sum(count) as total
          FROM map2_daily_arrivals
          where count is not null AND collection_point is not null AND date_yyyy_mm_dd >= '${this.model.get('range').start.toISOString()}'::timestamp AND date_yyyy_mm_dd <= '${this.model.get('range').finish.toISOString()}'::timestamp
          group by source order by total DESC`
          // options.mapView.on('date:change',(obj) => {
          //   options.mapView.off('date:change');
          // });
      }else{
        this._query = `SELECT source, count as total, date_yyyy_mm_dd
          FROM map2_daily_arrivals
          where count is not null AND collection_point is not null AND date_yyyy_mm_dd >= '${this.model.get('range').start.toISOString()}'::timestamp AND date_yyyy_mm_dd <= '${this.model.get('range').finish.toISOString()}'::timestamp
          order by source,date_yyyy_mm_dd`
          options.mapView.on('date:change',(obj) => {
            this._update(obj.date);
          });
      }

      this.render();
    });
  }

  render(){
    if(this._isWeek()){
      this._template = require('../template/summaryWeek.html');
      super.render();
    }else{
      this._template = require('../template/summary.html');
      let sql = new cartodb.SQL({ user: Config.cartoUser, protocol:'https' });
      sql.execute(this._query)
      .done((data)=>{
        let total = _.reduce(data.rows, function(memo, obj){ return memo + obj.total; }, 0);
        this._data = _.groupBy(data.rows, function(d){ return d.source;});
        this._data['DRC'] = this._groupByMonth(this._data['DRC']);
        this._data['Burundi'] = this._groupByMonth(this._data['Burundi']);
        this._data['Somalia'] = this._groupByMonth(this._data['Somalia']);
        this._data['Others'] = this._groupByMonth(this._data['Others']);
        this._data['South Sudan'] = this._groupByWeek(this._data['South Sudan'],7);
        this.$el.html(this._template({total:total, Utils:Utils}));
      })
      .error((errors)=>{
        console.log("errors:" + errors);
      })
    }
  }

  _update(date){
    let data;
    if(this._data){

      this.$('.data .drc').text('-');
      this.$('.data .burundi').text('-');
      this.$('.data .somalia').text('-');
      this.$('.data .southSudan').text('-');
      this.$('.data .others').text('-');

      this.$('.data .drcDate').text('');
      this.$('.data .burundiDate').text('');
      this.$('.data .somaliaDate').text('');
      this.$('.data .southSudanDate').text('');
      this.$('.data .othersDate').text('');

      data = (this._data['DRC'][`${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}`])/2;
      this.$('.data .drc').text(Utils.formatNumber(data));
      if(data && data != 0)
        this.$('.data .drcDate').text(Utils.formatDateShortNotDay(date));

      data = (this._data['Burundi'][`${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}`])/2;
      this.$('.data .burundi').text(Utils.formatNumber(data));
      if(data && data != 0)
        this.$('.data .burundiDate').text(Utils.formatDateShortNotDay(date));

      data = this._data['Somalia'][`${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}`];
      this.$('.data .somalia').text(Utils.formatNumber(data));
      if(data && data != 0)
        this.$('.data .somaliaDate').text(Utils.formatDateShortNotDay(date));

      data = this._data['South Sudan'][`${moment(date).isoWeek()}`];
      this.$('.data .southSudan').text(Utils.formatNumber(data));
      if(data && data != 0)
        this.$('.data .southSudanDate').text(`${Utils.formatDateShortNotYear(moment().day("Monday").isoWeeks(moment(date).isoWeek()).toDate())} - ${Utils.formatDateShortNotYear(moment().day("Sunday").isoWeeks(moment(date).isoWeek()).toDate())}`);

      data = this._data['Others'][`${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}`];
      this.$('.data .others').text(Utils.formatNumber(data));
      if(data && data != 0)
        this.$('.data .othersDate').text(Utils.formatDateShortNotDay(date));
    }
  }

  _isWeek(){
    return (this.model.get('range').finish - this.model.get('range').start)/((24 * 60 * 60 * 1000)) <= 6;
  }

  _groupByMonth(data){
    data = _.groupBy(data, function(d){ return d.date_yyyy_mm_dd.substring(0,7);});
    _.each(data,function(d,key){
      data[key] = _.reduce(d, function(a, b){ return a + b.total; }, 0)
    })
    return data;
  }

  _groupByWeek(data){
    data = _.groupBy(data, function(d){ return moment(new Date(d.date_yyyy_mm_dd)).isoWeek();});
    _.each(data,function(d,key){
      data[key] = _.reduce(d, function(a, b){ return a + b.total; }, 0)
    })
    return data;
  }

}
