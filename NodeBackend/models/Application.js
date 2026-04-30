const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  job_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'job_listings',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  student_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  cv_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'students_cv',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  application_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('applied', 'shortlisted', 'rejected'),
    defaultValue: 'applied'
  },
  cover_letter: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'applications',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['job_id', 'student_id']
    }
  ]
});

module.exports = { Application };