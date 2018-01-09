/*
'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    let groups = [{name:'Walmart',
                   type: 'test',
                   categories: [''],
                   description: 'test group',
                   created_at: new Date, 
                   updated_at: new Date}];
      return queryInterface.bulkInsert('Groups',groups,null);
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    
  }
};*/