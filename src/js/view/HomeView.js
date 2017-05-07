"use strict";

var Backbone = require('backbone'),
    Config = require('../config.js');

module.exports = class HomeView extends Backbone.View {

  constructor(options){
    super(options);

    //FOR RESPONSIVE
    $(window).resize(()=>{
      if($('body').height() <= Config.heightResponsive && !this.$el.hasClass('fullMap'))
        this._split();
    });
  }

  events(){
    return {
      'click .splitControl': '_split'
    };
  }

  className(){
    return `home ${$('body').height() <= Config.heightResponsive ? 'fullMap':null}`;
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

  _split(){
    this.$el.toggleClass('fullMap');
    setTimeout(()=>{
      this._mapView.map.invalidateSize()
      //FOR RESPONSIVE
      if(this._dataPanelView && this._dataPanelView._chartView){
        if(this.$el.hasClass('fullMap'))
          this._dataPanelView._chartView.$('svg').remove();
        else
          this._dataPanelView._chartView.reDraw()
      }
    }, 300);
  }
}
