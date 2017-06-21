module.exports = {

  getActionsSet(){
    return new Set(['site_management','site_planning','shelter','wash_construction_and_services','protection_and_community_services','health','nutrition','food_distribution','nfi_distribution','logistics','education','enviroment','livelihoods','sgbv']);
  },

  actionsQuery(actions){
    let actionsList = '';
    for(var a of actions){
      actionsList += `string_to_array(UPPER(${a}), ',')||`;
    }
    actionsList = actionsList.substring(0,actionsList.length-2)
    return actionsList;
  }

};
