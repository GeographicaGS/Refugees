"use strict";

var LineChartView = require('./LineChartView'),
  template = require('../template/dataPanel.html')
  ;

module.exports = class DataPanelView extends Backbone.View {

  constructor(options){
    super(options);
    this._lineChartView = new LineChartView();
  }

  className(){
    return 'dataPanel';
  }

  remove(){
    if(this._lineChartView)
      this._lineChartView.remove();
    super.remove();
  }

  render() {
    this.$el.html(template());
    this.$('.content').html(this._lineChartView.render().$el);
    return this;
  }
}
