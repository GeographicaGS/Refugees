"use strict";

var MapView = require('./MapView'),
  SummaryView = require('./SummaryView'),
  DataPanelView = require('./DataPanelView'),
  template = require('../template/home.html')
  ;

module.exports = class HomeView extends Backbone.View {

  constructor(options){
    super(options);
  }

  events(){
    return {};
  }

  className(){
    return 'home';
  }

  remove(){
    if(this._mapView)
      this._mapView.remove();
    if(this._summaryView)
      this._summaryView.remove();
    if(this._dataPanelView)
      this._dataPanelView.remove();
    super.remove();
  }

  render() {
    this.$el.html(template());
    this._mapView = new MapView({el:this.$('#map')});
    _.defer(()=>{this._mapView.render();});
    this._summaryView = new SummaryView();
    this.$el.append(this._summaryView.render().$el);
    this._dataPanelView = new DataPanelView();
    this.$('#dataPanel').append(this._dataPanelView.render().$el);
    return this;
  }
}
