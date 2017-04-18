"use strict";

var CommonLegendView = require('../../view/LegendView');

module.exports = class LegendView extends CommonLegendView {

  constructor(options){
    super(options);
  }

  renderTorque(){
    this._template = require('../template/legendTorqueTemplate.html');
    this.render();
  }

  renderLastWeek(){
    this._template = require('../template/legendLastWeekTemplate.html');
    this.render();
  }

}
