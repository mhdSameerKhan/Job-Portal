const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobListing = sequelize.define('JobListing', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  employer_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'employers',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  responsibilities: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  job_type: {
    type: DataTypes.ENUM('full-time', 'part-time', 'internship'),
    allowNull: false
  },
  salary_min: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salary_max: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salary_currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  is_remote: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  posted_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'job_listings',
  timestamps: false
});

module.exports = { JobListing };