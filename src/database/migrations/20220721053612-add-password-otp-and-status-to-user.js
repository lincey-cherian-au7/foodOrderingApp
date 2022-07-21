'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users','password',{
      allowNull:false,
      type:Sequelize.STRING
    })
    await queryInterface.addColumn('Users','otp',{
      allowNull:false,
      type:Sequelize.STRING
    })
    await queryInterface.addColumn('Users','status',{
      allowNull:false,
      type:Sequelize.BOOLEAN,
      defaultValue:false
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users','password');
    await queryInterface.removeColumn('Users','otp');
    await queryInterface.removeColumn('Users','status');
  }
};
