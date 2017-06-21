"use strict";

var TableDataView = require('./TableDataView'),
  template = require('../template/dataPanel.html'),
  CommonDataPanelView = require('../../view/DataPanelView')
  ;

module.exports = class DataPanelView extends CommonDataPanelView {

  constructor(options){
    super(options);
    this._template = require('../template/dataPanel.html');
    this._tableDataView = new TableDataView({actors:options.actors, settlements:options.settlements, sectors:options.sectors, collection:options.collection});
  }

}
