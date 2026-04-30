import React, { useState, useEffect } from "react";
import UserManagementToolbar from "../../../components/Admin/Users/UserManagementToolbar/UserManagementToolbar";
import UsersTable from "../../../components/Admin/Users/UsersTable/UsersTable";
import BulkOperations from "../../../components/Admin/Users/BulkOperations/BulkOperations";
import "./Users.css";
import adminService from "../../../services/adminService";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getUsers();
        
        // Ensure data is an array
        const usersArray = Array.isArray(data) ? data : [];
        
        setUsers(usersArray);
        setFilteredUsers(usersArray);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.response?.data?.message || "Failed to load users. Please try again.");
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!Array.isArray(users) || users.length === 0) {
      setFilteredUsers([]);
      return;
    }

    let results = users.filter(user => user && user.id); // Filter out invalid users

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter((user) =>
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchLower))
      );
    }

    if (userTypeFilter) {
      results = results.filter((user) => {
        if (userTypeFilter === "student") return user.user_type === 1;
        if (userTypeFilter === "employer") return user.user_type === 2;
        if (userTypeFilter === "admin") return user.user_type === 3;
        return true;
      });
    }

    setFilteredUsers(results);
  }, [searchTerm, userTypeFilter, users]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filter) => {
    setUserTypeFilter(filter);
  };

  const handleUserSelect = (userId, isSelected) => {
    setSelectedUsers((prev) =>
      isSelected ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  };

  const handleSelectAll = (isSelected) => {
    setSelectedUsers(isSelected ? filteredUsers.map((user) => user.id) : []);
  };

  const handleStatusUpdate = async (userId, isActive) => {
    try {
      await adminService.updateUserStatus(userId, isActive);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_active: isActive } : user
        )
      );
    } catch (err) {
      setError("Failed to update user status. Please try again.");
      console.error(err);
    }
  };

  const handleBulkStatusUpdate = async (isActive) => {
    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          adminService.updateUserStatus(userId, isActive)
        )
      );
      setUsers((prev) =>
        prev.map((user) =>
          selectedUsers.includes(user.id)
            ? { ...user, is_active: isActive }
            : user
        )
      );
      setSelectedUsers([]);
    } catch (err) {
      setError("Failed to update users. Please try again.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="admin-users-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users-page">
        <div className="users-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="users-container">
        <h1>User Management</h1>

        <div className="users-content">
          <UserManagementToolbar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
          <UsersTable
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            onSelectAll={handleSelectAll}
            onStatusUpdate={handleStatusUpdate}
          />
          {selectedUsers.length > 0 && (
            <BulkOperations
              onBulkVerify={() => handleBulkStatusUpdate(true)}
              onBulkDisable={() => handleBulkStatusUpdate(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
