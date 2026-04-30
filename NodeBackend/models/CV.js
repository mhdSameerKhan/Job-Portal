const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CV = sequelize.define('CV', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
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
  file: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'students_cv',
  timestamps: false
});

module.exports = { CV };