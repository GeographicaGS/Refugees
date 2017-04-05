module.exports = {
  cartoUser: 'geointelligence',
  apps:{
    arrival:{
      home: require('./arrival/view/HomeView')
    },
    hosts:{
      home: require('./hosts/view/HomeView')
    },
    settlements:{
      home: require('./settlements/view/HomeView')
    }
  },
  // currentApp: 'arrival'
  currentApp: 'settlements'
};
