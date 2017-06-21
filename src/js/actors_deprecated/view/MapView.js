"use strict";

var Config = require('../../config.js'),
  Utils = require('../utils.js'),
  CommonMapView = require('../../view/MapView'),
  LegendView = require('./LegendView')
;

module.exports = class MapView extends CommonMapView {

  constructor(options){
    super(options);
    this._popupHoverTemplate = require('../template/mapPopup.html');
    this._legendView = new LegendView();
  }

  render() {
    super.render();
    this.$el.append(this._legendView.render().$el);
    cartodb.createLayer(this.map, {
      user_name: Config.cartoUser,
      type: 'cartodb',
      sublayers: [
        // this._ugandaLayer,
        {
          sql: this._getQuerLayer(new Set(),Utils.getActionsSet(),new Set())
          ,
          cartocss: `#layer {
            marker-width: ramp([count], range(12, 30), quantiles(5));
            marker-fill-opacity: 1;
            marker-allow-overlap: true;
            marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170425102947camp_32.svg');
          }`,
          interactivity: 'settlement,count'
        }
    ]
    },{https:true})
    .addTo(this.map)
    .done((layer)=>{
      this._layer = layer;
      this._featureOver(layer.getSubLayer(0));
      this._mouseout(layer.getSubLayer(0));
    });

    return this;
  }

  _getQuerLayer(actorsDisabled,actions,settlementDisabled){
    let actors = '',
      settlements = ' WHERE true ',
      actionsList = '';
    if(actorsDisabled.size == 0){
      actors = '\'\'';
    }else{
      for(var c of actorsDisabled){
        actors += `'${c.toUpperCase()}',`;
      }
      actors = actors.substring(0,actors.length-1)
    }

    for(var s of settlementDisabled){
      settlements += ` AND settlement!='${s}' `
    }

    actionsList = Utils.actionsQuery(actions);
    // for(var a of actions){
    //   actionsList += `string_to_array(UPPER(${a}), ',')||`;
    // }
    // actionsList = actionsList.substring(0,actionsList.length-2)

    return `SELECT * FROM(
      SELECT cartodb_id, the_geom_webmercator, settlement, actors, array_length(actors,1) as count FROM (

      SELECT cartodb_id, the_geom_webmercator, settlement,

      (SELECT ARRAY(

        SELECT DISTINCT(TRIM(regexp_replace(UNNEST(actors),E'[\\n\\r]+', '', 'g' )))
        except
        SELECT UNNEST(array[${actors}])

      FROM map_5_3w_map_settlements)
      ) as actors FROM (

        SELECT cartodb_id, the_geom_webmercator, settlement,

          ${actionsList}
          as actors

          FROM map_5_3w_map_settlements
        ) as a

    ) as aa ${settlements}) as aaa WHERE count is not null`;
  }

  filterMap(collection){
    let actorsDisabled = new Set(),
      actions =  new Set(),
      settlementDisabled =  new Set()
    ;

    collection.each(function(settlement){
      if(settlement.get('active') && !settlement.get('hide')){
        settlement.get('actions').each(function(action){
          if(action.get('active') && !action.get('hide')){
            actions.add(action.get('id'));
            action.get('actors').each(function(actor){
              if(actor.get('hide') || !actor.get('active'))
                actorsDisabled.add(actor.get('id'));
            });
          }
        });

      }else{
        settlementDisabled.add(settlement.get('id'));
      }
    });
    this._layer.setQuery(this._getQuerLayer(actorsDisabled,actions,settlementDisabled));
  }

}
