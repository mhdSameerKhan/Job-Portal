import React, { useEffect, useState } from "react";
import SystemStats from "../../../components/Admin/Dashboard/SystemStats/SystemStats";
import PendingItems from "../../../components/Admin/Dashboard/PendingItems/PendingItems";
import "./Dashboard.css";
import adminService from "../../../services/adminService";
import { useAuth } from "../../../context/AuthContext";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    pendingCompanies: 0,
    activeJobs: 0,
  });
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, companiesData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getPendingCompanies(),
        ]);

        setStats({
          totalUsers: statsData.total_users || 0,
          totalCompanies: statsData.total_companies || statsData.total_employers || 0,
          pendingCompanies: statsData.pending_companies || statsData.pending_employers || 0,
          activeJobs: statsData.active_jobs || 0,
        });

        // Handle different response formats for pending companies
        let pendingArray = [];
        if (Array.isArray(companiesData)) {
          pendingArray = companiesData;
        } else if (companiesData && companiesData.data && Array.isArray(companiesData.data)) {
          pendingArray = companiesData.data;
        }
        setPendingCompanies(pendingArray);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data. Please try again."
        );
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApproveCompany = async (companyId) => {
    try {
      setError(null);
      await adminService.approveCompany(companyId);

      setPendingCompanies((prev) =>
        prev.filter((company) => company.id !== companyId)
      );

      setStats((prev) => ({
        ...prev,
        pendingCompanies: prev.pendingCompanies - 1,
        totalCompanies: prev.totalCompanies + 1,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to approve company. Please try again."
      );
      console.error("Approval error:", err);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <h1>Welcome back, {user?.first_name || "Admin"}</h1>

        <div className="dashboard-content">
          <SystemStats stats={stats} />

          <div className="dashboard-columns">
            <div className="pending-items-section">
              <h2>Pending Company Approvals</h2>
              {pendingCompanies.length > 0 ? (
                <PendingItems
                  items={pendingCompanies}
                  onApprove={handleApproveCompany}
                />
              ) : (
                <p className="no-pending">No companies pending approval</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
