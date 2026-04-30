import React from "react";
import "./UserManagementToolbar.css";

const UserManagementToolbar = ({ onSearch, onFilterChange }) => {
  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    onFilterChange(e.target.value);
  };

  return (
    <div className="user-toolbar">
      <h2>User Management</h2>

      <div className="toolbar-actions">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search users..."
            className="search-input"
            onChange={handleSearchChange}
          />
          <button className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <select className="filter-select" onChange={handleFilterChange}>
          <option value="">All User Types</option>
          <option value="student">Students</option>
          <option value="employer">Employers</option>
          <option value="admin">Admins</option>
        </select>
      </div>
    </div>
  );
};

export default UserManagementToolbar;
