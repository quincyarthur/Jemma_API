'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    let subscriptions = [{plan_name:'30 Day Free Trail',price:0,num_accounts:2,num_keywords:5,
                          account_update_interval:60,competitor_analysis:false,
                          created_at: new Date, updated_at: new Date
                         },
                        {plan_name:'Premium',price:30,num_accounts:5,num_keywords:10,
                         account_update_interval:30,competitor_analysis:false,
                         created_at: new Date, updated_at: new Date
                        },
                        {plan_name:'Platinum',price:100,num_accounts:10,num_keywords:15,
                         account_update_interval:15,competitor_analysis:true,
                         created_at: new Date, updated_at: new Date
                        }
                       ];
      return queryInterface.bulkInsert('Plans',subscriptions,null);
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