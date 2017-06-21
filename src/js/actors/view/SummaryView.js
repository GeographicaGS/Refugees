"use strict";

var CommonSummaryView = require('../../view/SummaryView'),
  Utils = require('../utils.js')
;

module.exports = class SummaryView extends CommonSummaryView {

  constructor(options){
    super(options);
    this._template = require('../template/summary.html');
    this.actors = options.actors
    this.settlements = options.settlements
    this.sectors = options.sectors
  }

  events() {
    return {
      'click .data .filterBlock h3': '_showFilter',
      'click .data .filterBlock h3 .popupFilter .contentPopup li': '_changeFilter',
      'click .data .filterBlock h3 .popupFilter .headerPopup .selectAll': '_selectAll',
      'click .data .filterBlock h3 .popupFilter .headerPopup .clear': '_clearAll',
      'click .data .filterBlock h3 .popupFilter .footerPopup .cancel': 'render',
      'click .data .filterBlock h3 .popupFilter .footerPopup .accept': '_accept',
      'click .head .clearAll': '_clearAllFilters'
    }
  }

  render() {
    // this.$el.html(this._template({rows:data.rows, Utils:Utils}));
    this.$el.html(this._template({actors:this.actors.toJSON(), settlements:this.settlements.toJSON(), sectors:this.sectors.toJSON()}));
    return this;
  }

  className(){
    return 'summary actors';
  }

  _showFilter(e){
    this.$('.popupFilter').removeClass('active');
    $(e.currentTarget).find('.popupFilter').addClass('active');
  }

  _changeFilter(e){
    e.stopPropagation();
    let ul = $(e.currentTarget).closest('ul');
    if(ul.find('li:not(.active)').length == 0){
      ul.find('li').removeClass('active');
      $(e.currentTarget).addClass('active');
    }else{
      $(e.currentTarget).toggleClass('active');
      if(ul.find('li.active').length == 0){
        ul.find('li').addClass('active');
      }else{
      }
    }
  }

  _selectAll(e){
    e.stopPropagation();
    e.preventDefault();
    $(e.currentTarget).closest('.popupFilter').find('li').addClass('active');
  }

  _clearAll(e){
    e.stopPropagation();
    e.preventDefault();
    $(e.currentTarget).closest('.popupFilter').find('li').removeClass('active');
  }

  _accept(e){
    e.stopPropagation();
    e.preventDefault();
    let collectionsList = ['actors','settlements','sectors'];
    let collection = this[$(e.currentTarget).attr('collection')];
    let li = $(e.currentTarget).closest('.popupFilter').find('li');
    _.each(li,(l)=>{
      collection.get(parseInt($(l).attr('elem'))).set('active', $(l).hasClass('active'))
    });

    //Oculto todo todos los elementos de todos los filtros
    for(var cl of collectionsList){
      this._hideColletion(this[cl]);
    }

    //Muestro los elementos de los filtros en función de lo seleccionado
    this.collection.each((c)=>{
      let actor = this.actors.get(c.get('actor_id'));
      let sectors = this.sectors.get(c.get('sector_id'));
      let settlements = this.settlements.get(c.get('settlement_id'));

      if(sectors.get('active') && settlements.get('active')){
        actor.set('show',true);
      }

      if(actor.get('active') && settlements.get('active')){
        sectors.set('show',true);
      }

      if(actor.get('active') && sectors.get('active')){
        settlements.set('show',true);
      }

    });

    //Desactivo los filtros que se han quedado ocultos
    // for(var cl of collectionsList){
    //   this._desactiveHidden(this[cl]);
    // }

    this.trigger('filter:change');
    this.render();
  }

  _hideColletion(collection){
    collection.each((c)=>{
      c.set('show',false);
    });
  }

  // _desactiveHidden(collection){
  //   collection.each((c)=>{
  //     if(!c.get('show')){
  //       c.set('active',false);
  //     }
  //   });
  // }

  _clearAllFilters(e){
    e.preventDefault();
    this._clearFilter(this.actors);
    this._clearFilter(this.sectors);
    this._clearFilter(this.settlements);
    this.trigger('filter:change');
    this.render();
  }

  _clearFilter(collection){
    collection.each((c)=>{
      c.set('active',true);
      c.set('show',true);
    });
  }

}
