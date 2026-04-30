import React, { useState, useEffect } from "react";
import CompanyApprovalTabs from "../../../components/Admin/Companies/CompanyApprovalTabs/CompanyApprovalTabs";
import CompaniesList from "../../../components/Admin/Companies/CompaniesList/CompaniesList";
import "./Companies.css";
import adminService from "../../../services/adminService";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const AdminCompaniesPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 useEffect(() => {
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      let data;
      if (activeTab === "pending") {
        data = await adminService.getPendingCompanies();
      } else {
        data = await adminService.getVerifiedCompanies();
      }
      setCompanies(data || []);
      console.log("Companies data:", data);
    } catch (err) {
      setError("Failed to load companies. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchCompanies();
}, [activeTab]);


  const handleApproveCompany = async (companyId) => {
    try {
      await adminService.approveCompany(companyId);
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
    } catch (err) {
      setError("Failed to approve company. Please try again.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="admin-companies-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-companies-page">
        <div className="companies-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-companies-page">
      <div className="companies-container">
        <h1>Company Management</h1>

        <div className="companies-content">
          <CompanyApprovalTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <CompaniesList
            companies={companies}
            activeTab={activeTab}
            onApprove={handleApproveCompany}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminCompaniesPage;
