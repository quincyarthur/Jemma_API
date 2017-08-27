'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    let account_types = [{description:'Twitter',created_at: new Date, updated_at: new Date},
                         {description:'Facebook',created_at: new Date, updated_at: new Date},
                         {description:'Instagram',created_at: new Date, updated_at: new Date},
                         {description:'Youtube',created_at: new Date, updated_at: new Date}
                        ];
      return queryInterface.bulkInsert('Account_Types',account_types,null);
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  }
};