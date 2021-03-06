"use strict";

var BarLineChartView = require('./BarLineChartView'),
  TableDataView = require('./TableDataView'),
  template = require('../template/dataPanel.html'),
  CommonDataPanelView = require('../../view/DataPanelView')
  ;

module.exports = class DataPanelView extends CommonDataPanelView {

  constructor(options){
    super(options);
    this._template = require('../template/dataPanel.html');
    this._chartView = new BarLineChartView();
    this._tableDataView = new TableDataView();
  }

}
