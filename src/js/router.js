"use strict";

var $ = require('jquery'),
  Backbone = require('backbone'),
  App = require('./App'),
  HomeView = require('./settlements/view/HomeView'),
  ArrivalView = require('./arrival/view/HomeView'),
  HostView = require('./hosts/view/HomeView'),
  SettlementView = require('./settlements/view/HomeView'),
  ActorsView = require('./actors/view/HomeView')
;


Backbone.$ = $;

module.exports = class Router extends Backbone.Router {
  constructor(){
    super();
    this.routes = {
      '' : 'home',
      'arrival' : 'arrival',
      'host(/:region)' : 'host',
      'settlement' : 'settlement',
      'actor' : 'actor'
    };
    this._bindRoutes();

  }
  home(){
    this.navigate('arrival',{trigger:true});
  }
  arrival(){
    App.showView(new ArrivalView().render());
  }
  host(region){
    App.showView(new HostView({region:region}).render());
  }
  settlement(){
    App.showView(new SettlementView().render());
  }
  actor(){
    App.showView(new ActorsView().render());
  }
};
