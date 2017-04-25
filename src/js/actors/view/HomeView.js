"use strict";

var CommonHomeView = require('../../view/HomeView'),
  Config = require('../../config.js'),
  Utils = require('../../utils.js'),
  MapView = require('./MapView'),
  FilterPanelView = require('./FilterPanelView'),
  template = require('../template/home.html')
  ;

module.exports = class HomeView extends CommonHomeView {

  render() {
    this.$el.html(template());
    this._mapView = new MapView({el:this.$('#map')});
    _.defer(()=>{this._mapView.render();});
    this._dataPanelView = new FilterPanelView();
    this.$('#dataPanel').append(this._dataPanelView.render().$el);
    return this;
  }

}
