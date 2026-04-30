const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminActivityLog = sequelize.define('AdminActivityLog', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  admin_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  action: {
    type: DataTypes.ENUM(
      'user_approval',
      'content_approval',
      'user_ban',
      'content_removal',
      'system_update'
    ),
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'admin_activity_logs',
  timestamps: false,
  indexes: [
    {
      fields: ['timestamp']
    }
  ]
});

module.exports = { AdminActivityLog };