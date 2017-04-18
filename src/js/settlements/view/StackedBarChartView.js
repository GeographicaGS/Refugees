"use strict";

var Config = require('../../config.js'),
  CommonStackedBarChartView = require('../../view/StackedBarChartView')
;

module.exports = class DataPanelView extends CommonStackedBarChartView {

  constructor(options){
    super(options);
    this.metaModel = new Backbone.Model({
      'south_sudan':{color:'#f7563c', name:'South Sudan'},
      'drc': {color:'#efc47e',name:'Republic of the Congo'},
      'somalia': {color:'#f3ad6a',name:'Somalia'},
      'rwanda': {color:'#f7945d',name:'Republic of Rwanda'},
      'burundi': {color:'#ecda9a',name:'Burundi'}
    });
    // this.metaModel = new Backbone.Model({
    //   'male':{color:'#F7563C', name:'Male'},
    //   'female': {color:'#FB8B60',name:'Female'}
    // });
  }

  render() {
    let sql = new cartodb.SQL({ user: Config.cartoUser });
    sql.execute('SELECT settlement as name, south_sudan, drc, somalia, rwanda, burundi, south_sudan+drc+somalia+rwanda+burundi as total from map3_settlements_over_time order by total DESC')
    // sql.execute('SELECT settlement as name, male,female, male+female as total from map3_settlements_over_time order by total DESC')
    .done((data)=>{
      this._draw(data.rows)
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })
    return this;
  }

}
