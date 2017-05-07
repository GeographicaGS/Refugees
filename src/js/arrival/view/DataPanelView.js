"use strict";

var Backbone = require('backbone'),
  Utils = require('../../utils.js'),
  LineChartView = require('./LineChartView'),
  TableDataView = require('./TableDataView'),
  template = require('../template/dataPanel.html'),
  CommonDataPanelView = require('../../view/DataPanelView')
  ;

module.exports = class DataPanelView extends CommonDataPanelView {

  constructor(options){
    super(options);
    this._template = require('../template/dataPanel.html');
    this._chartView = new LineChartView({model:this.model});
    this._tableDataView = new TableDataView({model:this.model});

    options.mapView.on('date:change',(obj) => {
      if(obj.value)
        this.$('.currentValue').html(`${Utils.formatNumber(obj.value)} · <span>${Utils.formatDate(obj.date)}</span>`);
      else
        this.$('.currentValue').text('');
    });

  }

}
