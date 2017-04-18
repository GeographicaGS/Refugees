"use strict";

var Backbone = require('backbone');

module.exports = class HomeView extends Backbone.View {

  constructor(options){
    super(options);
  }

  events(){
    return {
      'click .splitControl': '_split'
    };
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

  _split(){
    this.$el.toggleClass('fullMap');
    setTimeout(()=>{
      this._mapView.map.invalidateSize()
    }, 300);
  }
}
