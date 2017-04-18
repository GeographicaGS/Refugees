"use strict";

var CommonLegendView = require('../../view/LegendView');

module.exports = class LegendView extends CommonLegendView {

  constructor(options){
    super(options);
    this._template = require('../template/legendTemplate.html');
  }

}
