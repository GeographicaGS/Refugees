"use strict";

var $ = require('jquery'),
  Backbone = require('backbone'),
  App = require('./App'),
  HomeView = require('./settlements/view/HomeView'),
  ArrivalView = require('./arrival/view/HomeView'),
  HostView = require('./hosts/view/HomeView'),
  SettlementView = require('./settlements/view/HomeView')
;


Backbone.$ = $;

module.exports = class Router extends Backbone.Router {
  constructor(){
    super();
    this.routes = {
      '' : 'home',
      'arrival' : 'arrival',
      'host' : 'host',
      'settlement' : 'settlement'
    };
    this._bindRoutes();

  }
  home(){
    this.navigate('arrival',{trigger:true});
  }
  arrival(){
    App.showView(new ArrivalView().render());
  }
  host(){
    App.showView(new HostView().render());
  }
  settlement(){
    App.showView(new SettlementView().render());
  }
};
