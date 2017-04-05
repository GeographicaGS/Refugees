"use strict";

module.exports = class DataPanelView extends Backbone.View {

  className(){
    return 'dataPanel';
  }

  events(){
    return {
      'click .tabs >div:not(.active)': '_changeTab'
    };
  }

  remove(){
    if(this._chartView)
      this._chartView.remove();
    if(this._tableDataView)
      this._tableDataView.remove();
    super.remove();
  }

  render() {
    this.$el.html(this._template());
    if(this._chartView)
      this.$('.content').html(this._chartView.render().$el);
    if(this._tableDataView){
      this.$('.content').append(this._tableDataView.render().$el);
      if(this._chartView)
        this._tableDataView.$el.addClass('hide');
    }
    return this;
  }

  _changeTab(e){
    this.$('.tabs >div').removeClass('active');
    $(e.currentTarget).addClass('active');
    if($(e.currentTarget).index() == 0){
      this._tableDataView.$el.addClass('hide');
      this._chartView.$el.removeClass('hide');
    }else{
      this._chartView.$el.addClass('hide');
      this._tableDataView.$el.removeClass('hide');
    }
  }

}
