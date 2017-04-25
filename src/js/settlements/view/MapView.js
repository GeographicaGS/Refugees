"use strict";

var Config = require('../../config.js'),
  Utils = require('../../utils.js'),
  CommonMapView = require('../../view/MapView'),
  LegendView = require('./LegendView')
;

module.exports = class MapView extends CommonMapView {

  constructor(options){
    super(options);
    this._finishTorque = false;
    this._popupHoverTemplate = require('../template/mapPopup.html');
    this._legendView = new LegendView();
  }

  render() {

    super.render();

    this.$el.append(this._legendView.render().$el);

    let sql = new cartodb.SQL({ user: Config.cartoUser });
    sql.execute(`SELECT max(to_date(established_yyyy_mm_dd,'DD/MM/YYYY')) as date FROM map3_settlements_over_time WHERE established_yyyy_mm_dd is not null`)
    .done((data)=>{
      this._maxDate = new Date(data.rows[0].date);
      this._renderTorque();
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })

    cartodb.createLayer(this.map, {
      user_name: Config.cartoUser,
      type: 'cartodb',
      sublayers: [
        this._ugandaLayer,
        {
          sql: `SELECT * FROM map3_settlements_over_time`,
          cartocss: `#layer {
            marker-width: 18;
            marker-opacity: 1;
            marker-fill-opacity: 1;
            marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170425105323camp-un_32.svg');
            marker-allow-overlap: true;

            [type = 'Refugee transit Centre']{
              marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170425122658UGD-transition-center_un.svg');
            }

            [zoom >= 8]{
          	marker-width: 16;
            }
            [zoom >= 10]{
          	marker-width: 24;
          	}
            [zoom >= 12]{
          	marker-width: 32;
          	}
          }`,
          interactivity: 'settlement, capacity, overcapacity, population, established_yyyy_mm_dd, male, female'
        }
      ]
    })
    .addTo(this.map)
    .done((layer)=>{
      layer.setZIndex(2);
      this._featureOver(layer.getSubLayer(1));
      this._mouseout(layer.getSubLayer(1));
    });

    return this;
  }

  _renderTorque(){
    cartodb.createLayer(this.map, {
      type: 'torque',
      options: {
        user_name: Config.cartoUser,
        loop: false,
        query: `SELECT *, to_date(established_yyyy_mm_dd,'DD/MM/YYYY') as to_date, CASE WHEN type='Refugee transit Centre' THEN 2 ELSE 1 END as category FROM map3_settlements_over_time`,
        cartocss: `Map {
          -torque-frame-count: 32;
          -torque-animation-duration: 10;
          -torque-time-attribute: "to_date";
          -torque-aggregation-function: "CDB_Math_Mode(category)";
          -torque-resolution: 1;
          -torque-data-aggregation: cumulative;
        }
        ${require('../../template/settlementsCartoCss.html')({local:true})}`,
      }
    })
    .addTo(this.map)
    .done((layer)=>{
      // layer.setSteps(10);
      this._torqueLayer = layer;
      layer.setZIndex(3);
      $('.cartodb-timeslider .slider-wrapper').css({'width':'349px'});
      $('.cartodb-timeslider a.button').click(()=>{
        if(this._finishTorque){
          this._finishTorque = false;
          layer.stop();
        }
      });
      layer.on('change:time',(obj)=>{
        if(this._maxDate.getTime() == obj.time.getTime())
          this._finishTorque = true;
      });

    });
  }

}
