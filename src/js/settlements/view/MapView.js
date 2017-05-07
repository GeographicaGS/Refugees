"use strict";

var moment = require('moment'),
  Config = require('../../config.js'),
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

    this.map.setView(Config.northCoords, Config.northZoom);

    this.$el.append(this._legendView.render().$el);

    let sql = new cartodb.SQL({ user: Config.cartoUser, protocol:'https' });
    sql.execute(`SELECT max(to_date(established_yyyy_mm_dd,'DD/MM/YYYY')) as date FROM map3_settlements_over_time WHERE established_yyyy_mm_dd is not null AND type='Refugee settlement'`)
    .done((data)=>{
      this._maxDate = new Date(data.rows[0].date);
      sql.execute(`SELECT settlement, ST_X(the_geom) as x, ST_Y(the_geom) as y FROM map3_settlements_over_time WHERE established_yyyy_mm_dd is not null AND type='Refugee settlement' AND to_date(established_yyyy_mm_dd,'DD/MM/YYYY') >= to_date('01/01/2012', 'DD/MM/YYYY')`).done((data)=>{
        this._newSettlements = data.rows;
        this._renderTorque();
      })
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })

    // cartodb.createLayer(this.map, {
    //   user_name: Config.cartoUser,
    //   type: 'cartodb',
    //   sublayers: [
    //     {
    //       sql: `SELECT * FROM map3_settlements_over_time WHERE established_yyyy_mm_dd is not null AND type='Refugee settlement' AND to_date(established_yyyy_mm_dd,'DD/MM/YYYY') >= to_date('01/01/2012', 'DD/MM/YYYY')`,
    //       cartocss: `#layer {
    //         marker-width: 12;
    //         marker-opacity: 1;
    //         marker-fill-opacity: 1;
    //         marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170425105323camp-un_32.svg');
    //         marker-allow-overlap: true;
    //
    //         [zoom >= 8]{
    //       	marker-width: 16;
    //         }
    //         [zoom >= 10]{
    //       	marker-width: 24;
    //       	}
    //         [zoom >= 12]{
    //       	marker-width: 32;
    //       	}
    //       }`,
    //       interactivity: 'settlement,type,established_yyyy_mm_dd'
    //     }
    //   ]
    // },{https:true})
    // .addTo(this.map)
    // .done((layer)=>{
    //   layer.setZIndex(3);
    //   this._featureOver(layer.getSubLayer(0));
    //   this._mouseout(layer.getSubLayer(0));
    // });


    cartodb.createLayer(this.map, {
      user_name: Config.cartoUser,
      type: 'cartodb',
      sublayers: [
        // this._ugandaLayer,
        {
          sql: `SELECT a.the_geom, a.the_geom_webmercator, a.dname_uppe, a.cartodb_id, b.dname2014,b.refugee_pop,
                b.percentage_refugee, b.host_pop,b.month_year,b.url
                FROM districts_for_carto a
                left join map1_host_and_refugees b
                on a.dname_uppe=b.dname2014`,
                cartocss: `
                #layer::ramp [zoom > 5]{
                 polygon-opacity:0 ;
                [percentage_refugee = null] {
                  polygon-opacity:0;
                 }
                }

                #layer::limits{
                 line-width: 0;
                 line-opacity: 0;
                }
                #layer [zoom > 5]{
                 line-width: 0;
                 line-opacity: 0;
                }`,
          interactivity: 'dname_uppe, percentage_refugee, refugee_pop, host_pop, month_year'
        },
        {
          // sql: `SELECT * FROM map3_settlements_over_time WHERE type!='Refugee settlement' OR (type='Refugee settlement' AND to_date(established_yyyy_mm_dd,'DD/MM/YYYY') < to_date('01/01/2012', 'DD/MM/YYYY'))`,
          sql: `SELECT * FROM map3_settlements_over_time WHERE type!='Refugee settlement' OR (type='Refugee settlement' AND to_date(established_yyyy_mm_dd,'DD/MM/YYYY') < to_date('01/01/2012', 'DD/MM/YYYY'))`,
          cartocss: `#layer {
            marker-width: 12;
            marker-opacity: 1;
            marker-fill-opacity: 1;
            marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170425105323camp-un_32.svg');
            marker-allow-overlap: false;

            [type = 'Refugee transit Centre']{
              marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170425102933transition-center.svg');
            }
            [type='Refugee transit centre']{
              marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170425102933transition-center.svg');
            }
            [type='Reception centre']{
              marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170425102933transition-center.svg');
            }
            [type='Collection point']{
              marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170425102933transition-center.svg');
            }
            [type='Urban Refugee Location']{
              marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170505082414UGD-urban-refugee-location.svg');
            }
            [type='Border Point']{
              marker-width: 8;
              marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170426114622UGD-border-point.svg');
            }

            [zoom >= 8]{
          	   marker-width: 16;
               [type='Border Point']{
                 marker-width: 10;
               }
            }
            [zoom >= 9]{
              marker-allow-overlap: true;
            }
            [zoom >= 10]{
          	   marker-width: 24;
               [type='Border Point']{
                 marker-width: 16;
               }
          	}
            [zoom >= 12]{
          	   marker-width: 32;
               [type='Border Point']{
                 marker-width: 21;
               }
          	}
          }`,
          interactivity: 'settlement, type, established_yyyy_mm_dd'
        },
        {
          sql: `SELECT * FROM map3_settlements_over_time WHERE established_yyyy_mm_dd is not null AND type='Refugee settlement' AND to_date(established_yyyy_mm_dd,'DD/MM/YYYY') >= to_date('01/01/2012', 'DD/MM/YYYY')`,
          cartocss: `#layer {
            marker-width: 12;
            marker-opacity: 0.1;
            marker-fill-opacity: 0.1;
            marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170425105323camp-un_32.svg');
            marker-allow-overlap: true;

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
          interactivity: 'settlement,type,established_yyyy_mm_dd'
        }
      ]
    },{https:true})
    .addTo(this.map)
    .done((layer)=>{
      layer.setZIndex(2);
      this._featureOver(layer.getSubLayer(0),require('../../hosts/template/mapPopup.html'));
      this._mouseout(layer.getSubLayer(0));
      this._featureOver(layer.getSubLayer(1));
      this._mouseout(layer.getSubLayer(1));
      this._featureOver(layer.getSubLayer(2));
      this._mouseout(layer.getSubLayer(2));
    });

    // cartodb.createLayer(this.map, {
    //   user_name: Config.cartoUser,
    //   type: 'cartodb',
    //   sublayers: [
    //     {
    //       sql: `SELECT a.the_geom, a.the_geom_webmercator, a.dname_uppe, a.cartodb_id, b.dname2014,b.refugee_pop,
    //             b.percentage_refugee, b.host_pop,b.month_year,b.url
    //             FROM districts_for_carto a
    //             left join map1_host_and_refugees b
    //             on a.dname_uppe=b.dname2014`,
    //             cartocss: `#layer::ramp [zoom > 5]{
    //              polygon-fill: ramp([refugee_pop], (#d1eeea,#a8dbd9,#85c4c9,#68abb8,#4f90a6,#3b738f,#2a5674), quantiles (7));
    //               polygon-opacity:1 ;
    //             [percentage_refugee = null] {
    //               polygon-fill: #f5f5f3 ;
    //               polygon-opacity:0.3 ;
    //              }
    //             }
    //
    //             #layer::limits [zoom > 5]{
    //              line-width: 3;
    //              line-color: #ffffff ;
    //              line-opacity: 0.3;
    //
    //               [zoom >= 8]{
    //              line-width: 5;
    //              line-color: #ffffff ;
    //              line-opacity: 0.3;
    //               }
    //             }
    //
    //             #layer [zoom > 5]{
    //              line-width: 0.7;
    //              line-color: #636e73 ;
    //              line-opacity: 1;
    //               line-dasharray: 1, 2;
    //
    //               [zoom >= 8]{
    //             	line-width: 1;
    //               line-dasharray: 1.5, 3;
    //             	}
    //             }`,
    //       interactivity: 'dname_uppe, percentage_refugee, refugee_pop, host_pop, month_year'
    //     }
    // ]
    // },{https:true})
    // .addTo(this.map)
    // .done((layer)=>{
    //   layer.setZIndex(1);
    //   this._featureOver(layer.getSubLayer(0),require('../../hosts/template/mapPopup.html'));
    //   this._mouseout(layer.getSubLayer(0));
    // });

    return this;
  }

  _renderTorque(){
    cartodb.createLayer(this.map, {
      type: 'torque',
      options: {
        user_name: Config.cartoUser,
        loop: false,
        // query: `SELECT the_geom_webmercator,type, to_date(established_yyyy_mm_dd,'DD/MM/YYYY') as to_date, CASE WHEN type='Refugee transit Centre' or type='Refugee transit centre' or type='Collection point' or type='Reception centre' THEN 2 ELSE 1 END as category FROM map3_settlements_over_time WHERE established_yyyy_mm_dd is not null AND type='Refugee settlement' AND to_date(established_yyyy_mm_dd,'DD/MM/YYYY') >= to_date('01/01/2012', 'DD/MM/YYYY')`,
        query: `SELECT cartodb_id, settlement, the_geom_webmercator,type, to_date(established_yyyy_mm_dd,'DD/MM/YYYY') as to_date FROM map3_settlements_over_time WHERE established_yyyy_mm_dd is not null AND type='Refugee settlement' AND to_date(established_yyyy_mm_dd,'DD/MM/YYYY') >= to_date('01/01/2012', 'DD/MM/YYYY')`,
        cartocss: `Map {
          -torque-frame-count: 32;
          -torque-animation-duration: 10;
          -torque-time-attribute: "to_date";
          -torque-aggregation-function: "count(cartodb_id)";
          -torque-resolution: 1;
          -torque-data-aggregation: cumulative;
        }
        #layer {
          marker-width: 8;
          marker-fill-opacity: 1;
          marker-allow-overlap: true;
          marker-file: url('/img/camp_32.png');

          [zoom >= 8]{
        	   marker-width: 10;
          }
          [zoom >= 10]{
        	   marker-width: 18;
        	}
          [zoom >= 12]{
        	   marker-width: 24;
        	}
        }`,
      }
    },{https:true})
    .addTo(this.map)
    .done((layer)=>{
      this._torqueLayer = layer;
      layer.setZIndex(4);
      let pointsAdded = [];
      $('.cartodb-timeslider .slider-wrapper').addClass('big');
      $('.cartodb-timeslider a.button').click(()=>{
        if(this._finishTorque){
          this._finishTorque = false;
          layer.stop();
          pointsAdded = [];
        }
      });

      layer.on('change:time',(obj)=>{
        let points =layer.getActivePointsBBox(obj.step);
        let markers = [],
          popups = [];
        if(points.length > 0){
          for(var i=0; i<points.length; i++){
            if(!_.find(pointsAdded, function(p){ return p.lat == points[i][0].lat && p.lon == points[i][0].lon; })){
            // if(!_.find(this.map._layers, function(p){ if(p.getLatLng) return p.getLatLng().lat == points[i][0].lat && p.getLatLng().lng == points[i][0].lon;})){
              markers.push(L.circleMarker(L.latLng(points[i][0].lat, points[i][0].lon), {
                  radius: 7,
                  color: '#f7563c',
                  fillColor: '#f7563c',
                  fillOpacity: 0,
                  opacity:0,
                  className:'pulse',
                  closeOnClick: false,
                  autoClose: false,
                  closePopupOnClick:false
              }).addTo(this.map));

              let point = null;
              for(var d of this._newSettlements){
                if(!point || (Math.abs((d.x - points[i][0].lon)) + Math.abs((d.y - points[i][0].lat))) < (Math.abs((point.x - points[i][0].lon)) + Math.abs((point.y - points[i][0].lat))))
                  point = d;
              }
              // var point = _.find(this._newSettlements,(d)=>{
              //   if((Math.abs((d.x - points[i][0].lon)) + Math.abs((d.y - points[i][0].lat))) < closest)
              //     return d;
              // })
              let popup = L.popup({
                autoClose:false,
                closeOnClick:false,
                closeButton:false
              })
              .setLatLng(L.latLng(point.y, point.x))
              .setContent(`<div class="miniMapPopup ${point.settlement == 'Olua II' ? 'translate':''}">${point.settlement}</div>`);
              this.map.addLayer(popup);
              popups.push(popup);
              setTimeout(()=>{
                this.$('.miniMapPopup').addClass('hidden');
              }, 1000);

              pointsAdded.push(points[i][0]);
            }
          }
        }

        setTimeout(()=>{
          for(var m of markers){
            this.map.removeLayer(m);
          }
          for(var p of popups){
            this.map.removeLayer(p);
          }
        }, 3000);

        if(this._maxDate.getTime() == obj.time.getTime())
          this._finishTorque = true;
      });

    });
  }

}
