"use strict";

var Config = require('../../config.js'),
  Utils = require('../../utils.js'),
  CommonMapView = require('../../view/MapView')
;

module.exports = class MapView extends CommonMapView {

  constructor(options){
    super(options);
    this._popupHover = L.popup({
      closeButton: false
    });
    this._finishTorque = false;
    this._popupHoverTemplate = require('../template/mapPopup.html');
  }

  render() {

    super.render();

    let sql = new cartodb.SQL({ user: Config.cartoUser });
    sql.execute(`SELECT max(to_date(established_yyyy_mm_dd,'DD/MM/YYYY')) as date FROM map3_settlements_over_time`)
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
            marker-width: 32;
            marker-fill-opacity: 0;
            marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170404115910UGD-camp-icon_32.svg');
            marker-allow-overlap: true;
          }`,
          interactivity: 'settlement, capacity, overcapacity, population, established_yyyy_mm_dd'
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
        query: `SELECT *, to_date(established_yyyy_mm_dd,'DD/MM/YYYY') as to_date FROM map3_settlements_over_time`,
        cartocss: `Map {
          -torque-frame-count: 32;
          -torque-animation-duration: 10;
          -torque-time-attribute: "to_date";
          -torque-aggregation-function: "count(1)";
          -torque-resolution: 1;
          -torque-data-aggregation: cumulative;
        }
        ${require('../../template/settlementsCartoCss.html')()}
        `
      }
    })
    .addTo(this.map)
    .done((layer)=>{
      this._torqueLayer = layer;
      layer.setZIndex(3);
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

  _featureOver(layer){
    layer.setInteraction(true);
    layer.on('featureOver',(e, pos, pixel, data, sublayer)=>{
      let dateArray = data.established_yyyy_mm_dd.split('/');
      if(new Date(`${dateArray[2]}-${dateArray[1]}-${dateArray[0]}`).getTime() <= this._torqueLayer.getTime().getTime()){
        this.$('.mapPopup').removeClass('active');
        if(!this.map.hasLayer(this._popupHover) && !this.map.hasLayer(this._popup)){
          this._popupHover
          .setLatLng(pos)
          .openOn(this.map)
          .setContent(this._popupHoverTemplate({Utils:Utils, data:data}))
          ;
        }else if(this.map.hasLayer(this._popupHover)){
          this._popupHover
          .setLatLng(pos)
          .setContent(this._popupHoverTemplate({Utils:Utils, data:data}))
          .update();
        }
        this.$('.mapPopup').addClass('active');
      }
    });
  }

}
