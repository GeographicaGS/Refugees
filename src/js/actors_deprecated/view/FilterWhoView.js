"use strict";

var Backbone = require('backbone'),
  FilterView = require('./FilterView')
;

module.exports = class FiterWhoView extends Backbone.View {

  constructor(options){
    super(options);
    this._template = require('../template/filterWho.html');
    this.model = new Backbone.Model({popup:true})
    let _this = this;
    this.actorsCollection = new Backbone.Collection();
    this.collection.each(function(settlement){
      settlement.get('actions').each(function(action){
        action.get('actors').each(function(actor){
          if(!_this.actorsCollection.get(actor.get('id')))
            _this.actorsCollection.add({id:actor.get('id'),active:actor.get('active')});
        });
      });
    });
    this.actorsCollection.comparator = (m)=>{
      return m.get('id');
    };
    this.actorsCollection.sort();
  }

  events() {
    return {
      'click .actorsGroup .actor': '_toggleActor',
      'click .actorsTools .all': '_selectAll',
      'click .actorsTools .clear': '_clear',
      'click .accept': '_accept',
      'click .cancel': '_cancel',
      'click .selectActors': '_openPopup',
    }
  }

  render(){
    this.$el.html(this._template({collection:this.actorsCollection.toJSON(),model:this.model.toJSON(),_:require('underscore')}));
    super.render();
    return this;
  }

  _toggleActor(e){
    $(e.currentTarget).toggleClass('active');
  }

  _selectAll(e){
    e.preventDefault();
    this.$('.actorsGroup .actor').addClass('active');
  }

  _clear(e){
    e.preventDefault();
    this.$('.actorsGroup .actor').removeClass('active');
  }

  _accept(e){
    e.preventDefault();
    var _this = this;
    if(this.$('.actorsGroup .actor.active').length > 0){
      this.collection.each(function(settlement){
        settlement.get('actions').each(function(action){
          action.get('actors').each(function(actor){
            actor.set('active',_this.$(`.actorsGroup .actor[id="${actor.get('id')}"]`).hasClass('active'));
            _this.actorsCollection.get(actor.get('id')).set('active',actor.get('active'));
          });
        });
      });

      this.trigger('whoFilter:change');
      this._closePopup();

    }else{
      this.$('.actorsGroup').addClass('error');
      setTimeout(()=>{
        this.$('.actorsGroup').removeClass('error');
      }, 1000);
    }
  }

  _cancel(e){
    if(this.actorsCollection.where({active:true}).length > 0){
      this._closePopup();
    }
  }

  _closePopup(){
    this.model.set('popup',false);
    this.render();
  }

  _openPopup(e){
    e.preventDefault();
    this.model.set('popup',true);
    this.render();
  }

  // _changeFilter(e){
  //   if(this.$('.filterGroup .filter:not(.active)').length == 0){
  //     this.$('.filterGroup .filter').removeClass('active');
  //     $(e.currentTarget).addClass('active');
  //
  //     this.collection.each(function(settlement){
  //       settlement.get('actions').each(function(action){
  //         action.get('actors').each(function(actor){
  //           if(actor.get('id') != $(e.currentTarget).attr('id'))
  //            actor.set('active',false);
  //          else
  //            actor.set('active',true);
  //         });
  //       });
  //     });
  //
  //   }else{
  //     $(e.currentTarget).toggleClass('active');
  //     if(this.$('.filterGroup .filter.active').length == 0){
  //       this.$('.filterGroup .filter').addClass('active');
  //
  //       this.collection.each(function(settlement){
  //         settlement.get('actions').each(function(action){
  //           action.get('actors').each(function(actor){
  //             actor.set('active',true);
  //           });
  //         });
  //       });
  //
  //     }else{
  //
  //       this.collection.each(function(settlement){
  //         settlement.get('actions').each(function(action){
  //           action.get('actors').each(function(actor){
  //             if(actor.get('id') == $(e.currentTarget).attr('id'))
  //              actor.set('active',!actor.get('active'));
  //           });
  //         });
  //       });
  //
  //     }
  //   }
  //   this.trigger('whoFilter:change');
  // }

}
