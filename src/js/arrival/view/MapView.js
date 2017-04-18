"use strict";

var d3 = require('d3'),
  Config = require('../../config.js'),
  Utils = require('../../utils.js'),
  CommonMapView = require('../../view/MapView'),
  LegendView = require('./LegendView')
;

module.exports = class MapView extends CommonMapView {

  constructor(options){
    super(options);
    this._currentDate = null;
    this._steps = 10;
    this._selectableLayers = [];
    this._popupHoverTemplate = require('../template/mapWeekPopup.html');
    this._legendView = new LegendView();
  }

  render() {
    super.render();

    this.$el.append(this._legendView.render().$el);

    let sql = new cartodb.SQL({ user: Config.cartoUser });
    sql.execute(`SELECT
                (SELECT COUNT(*) FROM (SELECT distinct(date_yyyy_mm_dd::date) FROM map2_daily_arrivals) as dates WHERE date_yyyy_mm_dd is not null) as distinctdates,
                (SELECT ST_Extent (DISTINCT(ST_GeomFromText('LINESTRING(' || long_origin || ' ' || lat_origin || ',' || long_destination || ' ' || lat_destination || ')',4326)))FROM map2_daily_arrivals WHERE long_origin is not null and lat_origin is not null and long_destination is not null and lat_destination is not null and date_yyyy_mm_dd is not null) as bbox`)
    .done((data)=>{
      this._distinctDates = data.rows[0].distinctdates;
      this._torqueDuration = Math.ceil((this._distinctDates * 60) / 79);
      let bbox = data.rows[0].bbox.replace('BOX','').replace('(','').replace(')','').split(',');
      // this.map.fitBounds(L.latLngBounds(bbox[0].split(' ').reverse(),bbox[1].split(' ').reverse()),{paddingTopLeft:[340,0]});
      this.map.fitBounds(L.latLngBounds(bbox[0].split(' ').reverse(),bbox[1].split(' ').reverse()),{paddingTopLeft:[0,40]});
      this.renderTorque();
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })

    cartodb.createLayer(this.map, {
      user_name: Config.cartoUser,
      type: 'cartodb',
      sublayers: [
        this._ugandaLayer
    ]
    })
    .addTo(this.map)
    .done((layer)=>{
      layer.setZIndex(2);
    });

    cartodb.createLayer(this.map, {
      user_name: Config.cartoUser,
      type: 'cartodb',
      sublayers: [
        {
          sql: `SELECT * FROM map3_settlements_over_time where type!='Refugee transit Centre'`,
          cartocss: `#layer {
            marker-width: 12;
            marker-opacity: 1;
            marker-fill-opacity: 1;
            marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170418082716camp-un_32.svg');
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
          interactivity: 'settlement'
        },
        {
          sql: `SELECT row_number() OVER() AS cartodb_id, collection_point, the_geom_webmercator from(
            SELECT collection_point,
            ST_Transform (
            ST_SetSRID(ST_GeomFromText('POINT(' || long_origin || ' ' || lat_origin || ')'),4326)
            ,3857) as the_geom_webmercator
            FROM map2_daily_arrivals WHERE long_origin is not null and lat_origin is not null and long_destination is not null and lat_destination is not null and date_yyyy_mm_dd is not null
            GROUP BY long_origin,lat_origin,long_destination,lat_destination,collection_point
           ) as points`,
          cartocss: `#layer {
            marker-width: 6;
            marker-fill: #fff;
            marker-fill-opacity: 1;
            marker-allow-overlap: true;
            marker-line-width: 1.25;
            marker-line-color: #F7563C;
            marker-line-opacity: 1;

            [zoom >= 7]{
              marker-width: 10;
              marker-line-width: 2;
            }

            [zoom >= 10]{
              marker-width: 12;
              marker-line-width: 2;
            }
            [zoom >= 12]{
              marker-width: 16;
              marker-line-width: 3;
            }
          }`,
          interactivity: 'collection_point'
        },
        {
          sql:`SELECT row_number() OVER() AS cartodb_id, the_geom_webmercator from(
            SELECT DISTINCT(
            ST_Transform (
            ST_GeomFromText('POINT(' || long_destination || ' ' || lat_destination || ')',4326)
            ,3857)
              ) as the_geom_webmercator
            FROM map2_daily_arrivals WHERE long_origin is not null and lat_origin is not null and long_destination is not null and lat_destination is not null and date_yyyy_mm_dd is not null
           ) as points`,
          cartocss:require('../../template/settlementsCartoCss.html')()
        }
    ]
    })
    .addTo(this.map)
    .done((layer)=>{
      layer.setZIndex(4);
      // this._featureOver(layer.getSubLayer(1));
      // this._mouseout(layer.getSubLayer(1));
      this._featureOver(layer.getSubLayer(0),require('../template/simplePopup.html'),200);
      this._mouseout(layer.getSubLayer(0));

      this._featureOver(layer.getSubLayer(1),require('../template/simplePopup.html'),200);
      this._mouseout(layer.getSubLayer(1));
    });
    return this;
  }

  renderTorque(){

    this._removeSelectableLayers();
    this._legendView.renderTorque();

    cartodb.createLayer(this.map, {
      user_name: Config.cartoUser,
      type: 'cartodb',
      sublayers: [
        {
          sql: `SELECT row_number() OVER() AS cartodb_id, the_geom_webmercator from(
            SELECT DISTINCT(
            ST_Transform (
            ST_GeomFromText('LINESTRING(' || long_origin || ' ' || lat_origin || ',' || long_destination || ' ' || lat_destination || ')',4326)
            ,3857)
              ) as the_geom_webmercator
            FROM map2_daily_arrivals WHERE long_origin is not null and lat_origin is not null and long_destination is not null and lat_destination is not null and date_yyyy_mm_dd is not null
           ) as lines`,
          cartocss: `#layer::network [zoom >= 6]{
            line-width: 3;
            line-color: #636e73;
            line-opacity: 0.1;

            [zoom >= 8]{
              line-width: 3.5;
            }
          }

          #layer [zoom >= 5]{
            line-width: 0.7;
            line-color: #0072bc;
            line-opacity: 0.5;
            line-dasharray: 1, 2;

            [zoom >= 8]{
              line-width: 1.5;
              line-dasharray: 1.5, 3;
            }

          }`
        }
    ]
    })
    .addTo(this.map)
    .done((layer)=>{
      layer.setZIndex(3);
      this._selectableLayers.push(layer);
    });

    cartodb.createLayer(this.map, {
      type: 'torque',
      options: {
        user_name: Config.cartoUser,
        loop: true,
        query: `SELECT * FROM (SELECT row_number() OVER() AS cartodb_id, * FROM daily_arrivals(${this._steps})) as a${new Date().getTime()}`,
        cartocss: require('../template/arrivalsCartoCss.html')({dates:this._distinctDates, duration:this._torqueDuration, steps:this._steps})
      }
    })
    .addTo(this.map)
    .done((layer)=>{
      this._selectableLayers.push(layer);
      layer.setZIndex(2);
      layer.on('change:time',(obj)=>{
        if(obj.time != 'Invalid Date'){
          let date = new Date(obj.time);
          if(!this._currentDate || (date.getFullYear() != this._currentDate.getFullYear() || date.getMonth() != this._currentDate.getMonth() || date.getDate() != this._currentDate.getDate())){

            this.trigger('date:change',{date: date});


            this._currentDate = date;
            let dateText = `${this._currentDate.toLocaleString('en', {weekday: 'short' })} ${this._currentDate.toLocaleString('en', {month: 'short' })} ${this._currentDate.toLocaleString('en', {day: '2-digit'})} ${this._currentDate.toLocaleString('en', {year: 'numeric'})}`
            if(d3.selectAll('.guideTime').node())
              d3.selectAll('.guideTime')
                .transition()
                .duration(Math.floor((this._torqueDuration/this._distinctDates)*1000))
                .ease(d3.easeLinear)
                .attr('transform', 'translate(' + d3.selectAll('circle[date^="' + dateText + '"]').attr('cx') +')');

          }
        }
      });

    });
  }

  renderLastWeek(){
    this._removeSelectableLayers();
    this._legendView.renderLastWeek();

    // cartodb.createLayer(this.map, {
    //   user_name: Config.cartoUser,
    //   type: 'cartodb',
    //   sublayers: [
    //     this._ugandaLayer,
    //     {
    //       sql: `SELECT row_number() OVER() AS cartodb_id, sum, ST_Line_Interpolate_Point(the_geom_webmercator,0.5) as the_geom_webmercator, degrees(ST_Azimuth(point_a,point_b)) as angle  FROM (
    //           SELECT  sum(count),
    //           ST_Transform (
    //         ST_GeomFromText('LINESTRING(' || long_origin || ' ' || lat_origin || ',' || long_destination || ' ' || lat_destination || ')',4326),3857)  as the_geom_webmercator,
    //             ST_Transform (
    //         ST_GeomFromText('POINT(' || long_origin || ' ' || lat_origin || ')',4326),3857)  as point_a,
    //               ST_Transform (
    //         ST_GeomFromText('POINT(' || long_destination || ' ' || lat_destination || ')',4326),3857)  as point_b
    //         FROM map2_daily_arrivals
    //         where date_yyyy_mm_dd > ((select max(date_yyyy_mm_dd) from map2_daily_arrivals) - '1 week'::interval)
    //         group by long_origin,lat_origin,long_destination,lat_destination) as data
    //       `,
    //       cartocss: `#layer{
    //       marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/20170410170646flecha.png');
    //       marker-transform: rotate([angle]-90);
    //       marker-allow-overlap: true;
    //       marker-width: ramp([sum], range(20, 60), equal(5));
    //       }`
    //     }
    // ]
    // })
    // .addTo(this.map)
    // .done((layer)=>{
    //   this._selectableLayers = layer;
    //   layer.setZIndex(4);
    // });

    cartodb.createLayer(this.map, {
      user_name: Config.cartoUser,
      type: 'cartodb',
      sublayers: [
        {
          sql: `SELECT row_number() OVER() AS cartodb_id, the_geom_webmercator, count,settlment_name,collection_point from(
          SELECT sum(count) as count,settlment_name,collection_point,
                ST_Transform (
                ST_GeomFromText('LINESTRING(' || long_origin || ' ' || lat_origin || ',' || long_destination || ' ' || lat_destination || ')',4326)
                ,3857)
                   as the_geom_webmercator
                FROM map2_daily_arrivals WHERE long_origin is not null and lat_origin is not null and long_destination is not null and lat_destination is not null and date_yyyy_mm_dd is not null

                group by long_origin,lat_origin,long_destination,lat_destination,settlment_name,collection_point
            ) as lines`,
          cartocss: `#layer::network [zoom >= 5]{
            line-color: #fff;
            line-opacity: 1;
            line-width: ramp([count], range(5, 9), equal(5));

            [zoom >= 8]{
              line-width: ramp([count], range(6, 14), equal(5));
            }

            [zoom >= 10]{
              line-width: ramp([count], range(8, 16), equal(5));
            }

            [zoom >= 12]{
              line-width: ramp([count], range(11, 21), equal(5));
            }

          }


          #layer [zoom >= 5]{

            line-color: #0072bc;
            line-opacity: 0.8;
            comp-op: multiply;

            line-width: ramp([count], range(3, 7), equal(5));

            [zoom >= 8]{

            line-color: #0072bc;
            line-opacity: 0.8;
            comp-op: multiply;

            line-width: ramp([count], range(4, 12), equal(5));

          }
            [zoom >= 10]{

            line-color: #0072bc;
            line-opacity: 0.8;
            comp-op: multiply;

            line-width: ramp([count], range(6, 14), equal(5));

          }
            [zoom >= 12]{

            line-color: #0072bc;
            line-opacity: 0.8;
            comp-op: multiply;

            line-width: ramp([count], range(9, 19), equal(5));

          }

          }`,
          interactivity: 'count,settlment_name,collection_point'
        },
        {
          sql: `SELECT row_number() OVER() AS cartodb_id, sum, ST_Line_Interpolate_Point(the_geom_webmercator,0.5) as the_geom_webmercator, degrees(ST_Azimuth(point_a,point_b)) as angle  FROM (
              SELECT  sum(count),
              ST_Transform (
            ST_GeomFromText('LINESTRING(' || long_origin || ' ' || lat_origin || ',' || long_destination || ' ' || lat_destination || ')',4326),3857)  as the_geom_webmercator,
                ST_Transform (
            ST_GeomFromText('POINT(' || long_origin || ' ' || lat_origin || ')',4326),3857)  as point_a,
                  ST_Transform (
            ST_GeomFromText('POINT(' || long_destination || ' ' || lat_destination || ')',4326),3857)  as point_b
            FROM map2_daily_arrivals
            where date_yyyy_mm_dd > ((select max(date_yyyy_mm_dd) from map2_daily_arrivals) - '1 week'::interval)
            group by long_origin,lat_origin,long_destination,lat_destination) as data
          `,
          cartocss: `#layer [zoom >=7]{
            marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/production/geointelligence/assets/2017041212343020170410170646flecha.png');
            marker-transform: rotate([angle]-90);
            marker-allow-overlap: true;
            marker-width: 16;
            [zoom >=8]{
              marker-width: 24;
            }
            [zoom >=10]{
              marker-width: 30;
            }
            [zoom >=12]{
              marker-width: 40;
            }
          }`
        }
    ]
    })
    .addTo(this.map)
    .done((layer)=>{
      this._selectableLayers.push(layer);
      layer.setZIndex(3);
      this._featureOver(layer.getSubLayer(0),null,200);
      this._mouseout(layer.getSubLayer(0));
    });

  }

  _removeSelectableLayers(){
    for(var l of this._selectableLayers)
      l.remove();

    this._selectableLayers = [];
  }

}
