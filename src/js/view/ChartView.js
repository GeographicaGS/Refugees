"use strict";

var Backbone = require('backbone');

module.exports = class ChartView extends Backbone.View {

  constructor(options){
    super(options);
    $(window).resize(()=>{
      if(this.data);
      this._draw(this.data);
    });
  }

  reDraw(){
    if(this.data);
      this._draw(this.data);
  }
}
