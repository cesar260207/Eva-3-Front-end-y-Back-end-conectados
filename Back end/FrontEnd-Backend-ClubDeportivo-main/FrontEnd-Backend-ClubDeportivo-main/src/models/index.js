const sequelize = require('../config/database');
const User = require('./User');
const Routine = require('./Routine'); 

const db = {
  sequelize,
  User,
  Routine 
};

module.exports = db;