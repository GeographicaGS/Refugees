"use strict";

var Backbone = require('backbone'),
  CommonHomeView = require('../../view/HomeView'),
  Config = require('../../config.js'),
  Utils = require('../../utils.js'),
  MapView = require('./MapView'),
  SummaryView = require('./SummaryView'),
  DataPanelView = require('./DataPanelView'),
  loadingTemplate = require('../../template/loading.html'),
  template = require('../template/home.html')
  ;

module.exports = class HomeView extends CommonHomeView {

  constructor(options){
    super(options);
    this.contextModel = new Backbone.Model();
  }

  events() {
    return Object.assign({
      'click .tabs.range >div:not(.active)': '_changeRange'
    }, CommonHomeView.prototype.events());
  }

  render() {

    this._getDateRange('SELECT min(date_yyyy_mm_dd) as start, max(date_yyyy_mm_dd) as finish  FROM map2_daily_arrivals');

    this.$el.html(template());
    this._mapView = new MapView({el:this.$('#map')});
    _.defer(()=>{this._mapView.render();});
    this._summaryView = new SummaryView({model:this.contextModel,mapView:this._mapView});
    // this.$el.append(this._summaryView.render().$el);
    this.$el.append(this._summaryView.$el);
    this._dataPanelView = new DataPanelView({model:this.contextModel});
    this.$('#dataPanel').append(this._dataPanelView.render().$el);
    return this;
  }

  _changeRange(e){
    this.$('.tabs.range >div').removeClass('active');
    $(e.currentTarget).addClass('active');
    this.$el.append(loadingTemplate());
    if($(e.currentTarget).index() == 0){
      this._getDateRange('SELECT min(date_yyyy_mm_dd) as start, max(date_yyyy_mm_dd) as finish  FROM map2_daily_arrivals');
      this._mapView.renderTorque();
    }else if($(e.currentTarget).index() == 1){
      this._getDateRange(`SELECT min(date_yyyy_mm_dd) as start, max(date_yyyy_mm_dd) as finish FROM map2_daily_arrivals where date_yyyy_mm_dd > ((select max(date_yyyy_mm_dd) from map2_daily_arrivals) - '1 week'::interval)`)
      this._mapView.renderLastWeek();
    }
  }

  _getDateRange(query){
    let sql = new cartodb.SQL({ user: Config.cartoUser, protocol:'https' });
    sql.execute(query)
    .done((data)=>{
      this.$('.loading').remove();
      this._loadDateTitles(data.rows[0]);
      this.contextModel.set('range',{start:new Date(data.rows[0].start),finish:new Date(data.rows[0].finish)})
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
  }

  _loadDateTitles(data){
    this.$('.title .date').text(`${Utils.formatDateShort(new Date(data.start))} >> ${Utils.formatDateShort(new Date(data.finish))}`);
    if((new Date(data.finish) - new Date(data.start))/((24 * 60 * 60 * 1000)) <= 6){
      this.$('.dataPanel .header h4 span').text('last week times');
    }else{
      this.$('.dataPanel .header h4 span').text(`${Utils.formatDateShortNotDay(new Date(data.start))} - ${Utils.formatDateShortNotDay(new Date(data.finish))}`);
    }
  }

}
