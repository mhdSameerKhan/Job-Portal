import React from "react";
import "./UsersTable.css";
import { format } from "date-fns";

const UsersTable = ({
  users,
  selectedUsers,
  onUserSelect,
  onSelectAll,
  onStatusUpdate,
}) => {
  const formatDate = (dateInput) => {
    if (!dateInput) return "Never";
    try {
      let date;
      // Handle Firestore Timestamp format
      if (dateInput.toDate) {
        date = dateInput.toDate();
      } else if (dateInput.seconds) {
        date = new Date(dateInput.seconds * 1000);
      } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else {
        return "Never";
      }
      
      if (isNaN(date.getTime())) {
        return "Never";
      }
      
      return format(date, "MMM dd, yyyy HH:mm");
    } catch {
      return "Never";
    }
  };

  const getUserType = (type) => {
    switch (type) {
      case 1:
        return "Student";
      case 2:
        return "Employer";
      case 3:
        return "Admin";
      default:
        return "Unknown";
    }
  };

  const allSelected =
    users.length > 0 && users.every((user) => selectedUsers.includes(user.id));

  return (
    <div className="users-table-container">
      {users.length === 0 ? (
        <div className="no-users">No users found matching your criteria</div>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="select-all"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th>Email</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => onUserSelect(user.id, e.target.checked)}
                  />
                </td>
                <td>{user.email || "N/A"}</td>
                <td>
                  {user.first_name || ""} {user.last_name || ""}
                </td>
                <td>
                  <span
                    className={`user-type ${getUserType(
                      user.user_type
                    ).toLowerCase()}`}
                  >
                    {getUserType(user.user_type)}
                  </span>
                </td>
                <td>
                  <span
                    className={`user-status ${
                      user.is_active !== false ? "verified" : "disabled"
                    }`}
                  >
                    {user.is_active !== false ? "Active" : "Disabled"}
                  </span>
                </td>
                <td>{formatDate(user.last_login)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className={`action-btn ${
                        user.is_active !== false ? "disable" : "verify"
                      }`}
                      onClick={() => onStatusUpdate(user.id, !(user.is_active !== false))}
                    >
                      <i
                        className={`fas ${
                          user.is_active ? "fa-ban" : "fa-check-circle"
                        }`}
                      ></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsersTable;
