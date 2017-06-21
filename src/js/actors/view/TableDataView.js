"use strict";

var CommonTableDataView = require('../../view/TableDataView'),
  Utils = require('../../utils.js')
;

module.exports = class TableDataView extends CommonTableDataView {

  constructor(options){
    super(options);
    this._template = require('../template/tableData.html');

    this.actors = options.actors
    this.settlements = options.settlements
    this.sectors = options.sectors

  }

  render(){
    let data = [];
    let actors = _.groupBy(this.collection.toJSON(),'actor_id')
    _.each(actors,(a,id)=>{
      if(this.actors.get(id).get('active') && this.actors.get(id).get('show')){
        let json = {actor:a[0].name}
        let sectorsSet = new Set();
        let settlementsSet = new Set();
        let districtSet = new Set();
        _.each(a,(elem)=>{
          if(this.sectors.get(elem.sector_id).get('active') && this.sectors.get(elem.sector_id).get('show')){
            sectorsSet.add(elem.sector);
          }
          if(this.settlements.get(elem.settlement_id).get('active') && this.settlements.get(elem.settlement_id).get('show')){
            settlementsSet.add(elem.settlement);
            districtSet.add(elem.district);
          }
        });
        json['sectors'] = Array.from(sectorsSet).sort();
        json['settlements'] = Array.from(settlementsSet).sort();
        json['districts'] = Array.from(districtSet).sort();
        if(json['sectors'].length > 0 && json['settlements'].length > 0){
          data.push(json);
        }
      }
    });

    data.sort(function(a,b) {
      return (a.actor > b.actor) ? 1 : ((b.actor > a.actor) ? -1 : 0);
    });

    this.$el.html(this._template({data:data, Utils:Utils}));
    return this;
  }
}
