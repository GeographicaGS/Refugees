"use strict";

var Backbone = require('backbone'),
  FilterView = require('./FilterView')
;

module.exports = class FiterWhatView extends FilterView {

  constructor(options){
    super(options);
    this._template = require('../template/filterWhat.html');
    this.collection.comparator = (m)=>{
      if(this._max == null || this._max < m.get('who').size)
        this._max = m.get('who').size
      return m.get('who').size * -1
    };
    this.collection.sort();
  }

}
