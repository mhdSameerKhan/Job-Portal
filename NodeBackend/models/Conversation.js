const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'students',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  employer_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'employers',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  job_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'job_listings',
      key: 'id'
    },
    onDelete: 'SET NULL'
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
  tableName: 'messaging_conversation',
  timestamps: false
});

module.exports = { Conversation };