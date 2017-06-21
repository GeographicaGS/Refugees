"use strict";

var CommonHomeView = require('../../view/HomeView'),
  Config = require('../../config.js'),
  Utils = require('../../utils.js'),
  MapView = require('./MapView'),
  SummaryView = require('./SummaryView'),
  FilterPanelView = require('./FilterPanelView'),
  template = require('../template/home.html')
  ;

module.exports = class HomeView extends CommonHomeView {

  render() {
    this.$el.html(template());
    this._mapView = new MapView({el:this.$('#map')});
    _.defer(()=>{this._mapView.render();});
    this._summaryView = new SummaryView();
    this.$el.append(this._summaryView.render().$el);
    this._dataPanelView = new FilterPanelView({mapView:this._mapView});
    this.$('#dataPanel').append(this._dataPanelView.render().$el);
    return this;
  }

}
