"use strict";

var LineChartView = require('./LineChartView'),
  TableDataView = require('./TableDataView'),
  template = require('../template/dataPanel.html')
  ;

module.exports = class DataPanelView extends Backbone.View {

  constructor(options){
    super(options);
    this._lineChartView = new LineChartView();
    this._tableDataView = new TableDataView();
  }

  className(){
    return 'dataPanel';
  }

  events(){
    return {
      'click .tabs >div:not(.active)': '_changeTab'
    };
  }

  remove(){
    if(this._lineChartView)
      this._lineChartView.remove();
    super.remove();
  }

  render() {
    this.$el.html(template());
    // this.$('.content').html(this._lineChartView.render().$el);
    this.$('.content').append(this._tableDataView.render().$el);
    // this._tableDataView.$el.addClass('hide');
    return this;
  }

  _changeTab(e){
    this.$('.tabs >div').removeClass('active');
    $(e.currentTarget).addClass('active');
    if($(e.currentTarget).index() == 0){
      this._tableDataView.$el.addClass('hide');
      this._lineChartView.$el.removeClass('hide');
    }else{
      this._lineChartView.$el.addClass('hide');
      this._tableDataView.$el.removeClass('hide');
    }
  }

}
