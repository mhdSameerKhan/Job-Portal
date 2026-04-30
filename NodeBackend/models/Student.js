const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
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
  university: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  major: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  graduation_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1900,
      max: 2100
    }
  },
  gpa: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 4
    }
  },
  linkedin_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  github_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  portfolio_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  resume_headline: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
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
  tableName: 'students',
  timestamps: false
});

module.exports = { Student };