"use strict";

var Config = require('../config.js'),
  Utils = require('../utils.js'),
  MapView = require('./MapView'),
  SummaryView = require('./SummaryView'),
  DataPanelView = require('./DataPanelView'),
  template = require('../template/home.html')
  ;

module.exports = class HomeView extends Backbone.View {

  constructor(options){
    super(options);
  }

  events(){
    return {
      'click .splitControl': '_split'
    };
  }

  className(){
    return 'home';
  }

  remove(){
    if(this._mapView)
      this._mapView.remove();
    if(this._summaryView)
      this._summaryView.remove();
    if(this._dataPanelView)
      this._dataPanelView.remove();
    super.remove();
  }

  render() {
    this.$el.html(template());
    let sql = new cartodb.SQL({ user: Config.cartoUser });
    sql.execute('SELECT min(date_yyyy_mm_dd) as mindate, max(date_yyyy_mm_dd) as maxdate  FROM map2_daily_arrivals')
    .done((data)=>{
      this.$('.title .date').text(`${Utils.formatDateShort(new Date(data.rows[0].mindate))} >> ${Utils.formatDateShort(new Date(data.rows[0].maxdate))}`);
      this.$('.dataPanel .header h4 span').text(`${Utils.formatDateShortNotYear(new Date(data.rows[0].mindate))} - ${Utils.formatDateShortNotYear(new Date(data.rows[0].maxdate))}`);
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })

    this._mapView = new MapView({el:this.$('#map')});
    _.defer(()=>{this._mapView.render();});
    this._summaryView = new SummaryView();
    this.$el.append(this._summaryView.render().$el);
    this._dataPanelView = new DataPanelView();
    this.$('#dataPanel').append(this._dataPanelView.render().$el);
    return this;
  }

  _split(){
    this.$el.toggleClass('fullMap');
    setTimeout(()=>{
      this._mapView.map.invalidateSize()
    }, 300);
  }
}
