"use strict";

var Backbone = require('backbone'),
  FilterView = require('./FilterView')
;

module.exports = class FiterWhoView extends FilterView {

  constructor(options){
    super(options);
    this._template = require('../template/filterWho.html');
    this.collection.comparator = (m)=>{
      if(this._max == null || this._max < m.get('where').size)
        this._max = m.get('where').size
      return m.get('where').size * -1
    };
    this.collection.sort();
  }

}
