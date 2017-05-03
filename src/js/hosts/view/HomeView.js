"use strict";

var CommonHomeView = require('../../view/HomeView'),
  Config = require('../../config.js'),
  Utils = require('../../utils.js'),
  MapView = require('./MapView'),
  SummaryView = require('./SummaryView'),
  DataPanelView = require('./DataPanelView'),
  template = require('../template/home.html')
  ;

module.exports = class HomeView extends CommonHomeView {

  constructor(options){
    super(options);
    this._region = options.region;
  }

  render() {
    let sql = new cartodb.SQL({ user: Config.cartoUser, protocol:'https' });
    sql.execute('SELECT distinct(month_year) FROM map1_host_and_refugees where month_year is not null and month_year!=\'\'')
    .done((data)=>{

      let minDate, maxDate;
      for(var d of data.rows){
        // var date = new Date('2000-' + d.month_year);
        var date = new Date('2000/' + d.month_year.replace('-', '/'));
        if(!minDate || date < minDate)
          minDate = date
        if(!maxDate || date > maxDate)
          maxDate = date
      }
      this.$('.title .date').text(Utils.formatDateShortNotYear(minDate) + (minDate != maxDate ? (`>> ${Utils.formatDateShortNotYear(maxDate)}`) : ''));
      this.$('.dataPanel .header h4 span').text(Utils.formatDateShortNotYear(minDate) + (minDate != maxDate ? (` - ${Utils.formatDateShortNotYear(maxDate)}`) : ''));
    })
    .error((errors)=>{
      console.log("errors:" + errors);
    })

    this.$el.html(template());
    this._mapView = new MapView({el:this.$('#map'),region:this._region});
    _.defer(()=>{this._mapView.render();});
    this._summaryView = new SummaryView();
    this.$el.append(this._summaryView.render().$el);
    this._dataPanelView = new DataPanelView();
    this.$('#dataPanel').append(this._dataPanelView.render().$el);
    return this;
  }

}
