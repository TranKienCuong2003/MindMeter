import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AuthCallback from "./pages/AuthCallback";
import UserManagementPage from "./pages/UserManagementPage";
import AdminDashboardPage, {
  AdminProfilePage,
} from "./pages/AdminDashboardPage";
import ExpertStudentsPage from "./pages/ExpertStudentsPage";
import StudentTestPage from "./pages/StudentTestPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import QuestionManagementPage from "./pages/QuestionManagementPage";
import AnnouncementManagementPage from "./pages/AnnouncementManagementPage";
import AdminStatisticsPage from "./pages/AdminStatisticsPage";
import ExpertDashboardPage from "./pages/ExpertDashboardPage";
import ExpertProfilePage from "./pages/ExpertProfilePage";
import AdviceSentPage from "./pages/AdviceSentPage";
import { jwtDecode } from "jwt-decode";
import AdminTestResultsPage from "./pages/AdminTestResultsPage";
import StudentHomePage from "./pages/StudentHomePage";
import IntroduceMindMeterPage from "./pages/IntroduceMindMeterPage";
import StudentTestResultPage from "./pages/StudentTestResultPage";
import StudentTestHistoryPage from "./pages/StudentTestHistoryPage";
import UserGuidePage from "./pages/UserGuidePage";
import TermsOfUse from "./pages/TermsOfUse";
import Disclaimer from "./pages/Disclaimer";
import ConsultTherapyPage from "./pages/ConsultTherapyPage";
import ContactPage from "./pages/ContactPage";
import PricingPage from "./pages/PricingPage";

export default function AppRoutes() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingUser(true);
    const token = localStorage.getItem("token");
    const anonymousToken = localStorage.getItem("anonymousToken");
    const publicPaths = [
      "/privacy-policy",
      "/introduce",
      "/user-guide",
      "/introduce-mindmeter",
      "/terms-of-use",
      "/disclaimer",
      "/consult-therapy",
      "/contact",
      "/pricing",
    ];

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          email: decoded.sub,
          role: decoded.role,
          firstName: decoded.firstName || "",
          lastName: decoded.lastName || "",
        });
        setLoadingUser(false);
        // Chỉ redirect nếu KHÔNG ở các public path
        if (
          decoded.role === "ADMIN" &&
          !window.location.pathname.startsWith("/admin") &&
          !publicPaths.includes(window.location.pathname)
        ) {
          navigate("/admin/dashboard", { replace: true });
        } else if (
          decoded.role === "EXPERT" &&
          !window.location.pathname.startsWith("/expert") &&
          !publicPaths.includes(window.location.pathname)
        ) {
          navigate("/expert/dashboard", { replace: true });
        } else if (
          decoded.role === "STUDENT" &&
          !window.location.pathname.startsWith("/student") &&
          window.location.pathname !== "/home" &&
          !publicPaths.includes(window.location.pathname)
        ) {
          navigate("/home", { replace: true });
        }
        // Sau khi set user, kiểm tra pendingTestType
        const pendingTestType = localStorage.getItem("pendingTestType");
        if (pendingTestType) {
          navigate(`/student/test?type=${pendingTestType}`, { replace: true });
          localStorage.removeItem("pendingTestType");
        }
      } catch (e) {
        setUser(null);
        setLoadingUser(false);
      }
    } else if (anonymousToken) {
      // Xử lý anonymous user
      setUser({
        email: "anonymous",
        role: "ANONYMOUS",
        firstName: "Anonymous",
        lastName: "User",
        isAnonymous: true,
      });
      setLoadingUser(false);
      // Anonymous users có thể truy cập tất cả public paths và student paths
      // Không cần redirect
      // Sau khi set user anonymous, kiểm tra pendingTestType
      const pendingTestType = localStorage.getItem("pendingTestType");
      if (pendingTestType) {
        navigate(`/student/test?type=${pendingTestType}`, { replace: true });
        localStorage.removeItem("pendingTestType");
      }
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [navigate]);

  const handleLogin = (data) => {
    setUser(data);
    localStorage.setItem("token", data.token);

    // Chuyển hướng sau đăng nhập thành công
    if (data.role === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
    } else if (data.role === "EXPERT") {
      navigate("/expert/dashboard", { replace: true });
    } else if (data.role === "STUDENT") {
      navigate("/home", { replace: true });
    }
  };

  const handleLogout = () => {
    if (user && (user.role === "ADMIN" || user.role === "EXPERT")) {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("anonymousToken");
      navigate("/login", { replace: true });
    } else {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("anonymousToken");
      navigate("/home", { replace: true });
    }
  };

  if (loadingUser) {
    return <div className="p-8 text-center">Đang kiểm tra đăng nhập...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/introduce-mindmeter" element={<IntroduceMindMeterPage />} />
      <Route path="/introduce" element={<IntroduceMindMeterPage />} />
      <Route path="/user-guide" element={<UserGuidePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/home" element={<StudentHomePage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="/disclaimer" element={<Disclaimer />} />
      <Route path="/consult-therapy" element={<ConsultTherapyPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      {!user ? (
        <>
          <Route
            path="/login"
            element={
              <LoginForm
                onLogin={handleLogin}
                onSwitchForm={() => navigate("/register")}
                onForgotPassword={() => navigate("/forgot-password")}
              />
            }
          />
          <Route
            path="/register"
            element={
              <RegisterForm
                onRegister={handleLogin}
                onSwitchForm={() => navigate("/login")}
              />
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : user.role === "ADMIN" ? (
        <>
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/admin/dashboard"
            element={<AdminDashboardPage handleLogout={handleLogout} />}
          />
          <Route
            path="/admin/profile"
            element={<AdminProfilePage handleLogout={handleLogout} />}
          />
          <Route
            path="/admin/users"
            element={<UserManagementPage handleLogout={handleLogout} />}
          />
          <Route
            path="/admin/questions"
            element={<QuestionManagementPage handleLogout={handleLogout} />}
          />
          <Route
            path="/admin/announcements"
            element={<AnnouncementManagementPage handleLogout={handleLogout} />}
          />
          <Route
            path="/admin/statistics"
            element={<AdminStatisticsPage handleLogout={handleLogout} />}
          />
          <Route
            path="/admin/tests"
            element={<AdminTestResultsPage handleLogout={handleLogout} />}
          />
          <Route
            path="*"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </>
      ) : user.role === "EXPERT" ? (
        <>
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/expert/dashboard"
            element={<ExpertDashboardPage handleLogout={handleLogout} />}
          />
          <Route
            path="/expert/students"
            element={<ExpertStudentsPage handleLogout={handleLogout} />}
          />
          <Route
            path="/expert/profile"
            element={<ExpertProfilePage handleLogout={handleLogout} />}
          />
          <Route
            path="/expert/advice-sent"
            element={<AdviceSentPage handleLogout={handleLogout} />}
          />
          <Route
            path="*"
            element={<Navigate to="/expert/dashboard" replace />}
          />
        </>
      ) : user.role === "ANONYMOUS" || user.role === "STUDENT" ? (
        <>
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/student/test" element={<StudentTestPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route
            path="/student/test-result"
            element={<StudentTestResultPage />}
          />
          <Route
            path="/student/test-history"
            element={<StudentTestHistoryPage />}
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </>
      ) : (
        <>
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/student/test" element={<StudentTestPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route
            path="/student/test-result"
            element={<StudentTestResultPage />}
          />
          <Route
            path="/student/test-history"
            element={<StudentTestHistoryPage />}
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </>
      )}
    </Routes>
  );
}
