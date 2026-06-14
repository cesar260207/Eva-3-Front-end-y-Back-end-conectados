const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Routine = sequelize.define('Routine', {
  client_name: { type: DataTypes.STRING, allowNull: false },
  objective: { type: DataTypes.STRING, allowNull: false },
  days_per_week: { type: DataTypes.INTEGER, allowNull: false },
  difficulty: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Active' }
});

module.exports = Routine;