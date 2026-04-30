import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Header from "./components/common/Header/Header";
import Footer from "./components/common/Footer/Footer";

import Login from "./pages/auth/Login/Login";
import Register from "./pages/auth/Register/Register";

import StudentDashboard from "./pages/student/StudentDashboard/Dashboard";
import StudentProfile from "./pages/student/Profile/Profile";
import CVManager from "./pages/student/CVManager/CVManager";
import JobSearch from "./pages/student/JobsListing/JobSearch";
import Applications from "./pages/student/Applications/Applications";
import JobDetails from "./pages/student/JobDetails/JobDetails";
import StudentMessages from "./pages/student/Messages/Messages";

import EmployerDashboard from "./pages/employer/EmployerDashboard/Dashboard";
import EmployerProfile from "./pages/employer/Profile/Profile";
import PostJob from "./pages/employer/PostJobScreen/PostJob";
import Applicants from "./pages/employer/Applicants/Applicants";
import Shortlist from "./pages/employer/Shortlist/Shortlist";
import EmployerMessages from "./pages/employer/Messages/Messages";

import AdminDashboard from "./pages/admin/Dashboard/Dashboard";
import AdminUsers from "./pages/admin/Users/Users";
import AdminCompanies from "./pages/admin/Companies/Companies";

import Home from "./pages/Home";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const ProtectedRoute = ({ children, requiredUserType }) => {
    const { isAuthenticated, getUserType, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return <div>Loading...</div>; 
    }


    if (!isAuthenticated()) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredUserType && getUserType() !== requiredUserType) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  const PublicRoute = ({ children }) => {
    const { isAuthenticated, getUserType, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>; 
    }

    if (isAuthenticated()) {
      const userType = getUserType();
      let dashboardPath = "/";
      if (userType !== undefined && userType !== null) {
        switch (userType) {
          case 1:
            dashboardPath = "/student/dashboard";
            break;
          case 2:
            dashboardPath = "/employer/dashboard";
            break;
          case 3:
            dashboardPath = "/admin/dashboard";
            break;
          default:
            dashboardPath = "/";
        }
      }
      return <Navigate to={dashboardPath} replace />;
    }

    return children;
  };

  return (
    <Router>
      <AuthProvider>
        <div
          className="flex flex-col min-h-screen"
          style={{ backgroundColor: "#fbfaff" }}
        >
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute requiredUserType={1}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute requiredUserType={1}>
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/cv"
                element={
                  <ProtectedRoute requiredUserType={1}>
                    <CVManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/jobs"
                element={
                  <ProtectedRoute requiredUserType={1}>
                    <JobSearch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/jobs/:id"
                element={
                  <ProtectedRoute requiredUserType={1}>
                    <JobDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/applications"
                element={
                  <ProtectedRoute requiredUserType={1}>
                    <Applications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/messages"
                element={
                  <ProtectedRoute requiredUserType={1}>
                    <StudentMessages />
                  </ProtectedRoute>
                }
              />

              {/* Employer Routes */}
              <Route
                path="/employer/dashboard"
                element={
                  <ProtectedRoute requiredUserType={2}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/profile"
                element={
                  <ProtectedRoute requiredUserType={2}>
                    <EmployerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/post-job"
                element={
                  <ProtectedRoute requiredUserType={2}>
                    <PostJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/applicants"
                element={
                  <ProtectedRoute requiredUserType={2}>
                    <Applicants />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/shortlist"
                element={
                  <ProtectedRoute requiredUserType={2}>
                    <Shortlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/messages"
                element={
                  <ProtectedRoute requiredUserType={2}>
                    <EmployerMessages/>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredUserType={3}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredUserType={3}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/companies"
                element={
                  <ProtectedRoute requiredUserType={3}>
                    <AdminCompanies />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <Navigate to="/" replace />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
