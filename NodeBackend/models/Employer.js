const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Employer = sequelize.define('Employer', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  company_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  company_website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  company_logo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'employers',
  timestamps: false
});

module.exports = { Employer };