import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import { FaBrain } from "react-icons/fa";
import ChatBotModal from "../components/ChatBotModal";
import AnonymousTestModal from "../components/AnonymousTestModal";
import AnonymousBanner from "../components/AnonymousBanner";
import UpgradeAnonymousModal from "../components/UpgradeAnonymousModal";
import { ThemeContext } from "../App";
import DashboardHeader from "../components/DashboardHeader";
import HeroSection from "../components/HeroSection";
import TestListSection from "../components/TestListSection";
import AboutSection from "../components/AboutSection";
import FAQSection from "../components/FAQSection";
import FooterSection from "../components/FooterSection";
import {
  createAnonymousAccount,
  upgradeAnonymousAccount,
  isAnonymousUser,
  saveAnonymousUser,
  saveAnonymousToken,
  getCurrentUser,
  getCurrentToken,
  clearAnonymousData,
} from "../services/anonymousService";

const StudentHomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [chatOpen, setChatOpen] = useState(false);
  const [anonymousModalOpen, setAnonymousModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { theme, setTheme } = React.useContext(ThemeContext);
  const [chatbotBottom, setChatbotBottom] = useState(24); // px, default bottom-6
  const dragRef = useRef(null);
  const dragData = useRef({ startY: 0, startBottom: 0, dragging: false });
  const [selectedTestType, setSelectedTestType] = useState(null); // Thêm state lưu testType

  useEffect(() => {
    document.title =
      i18n.language === "vi" ? "Trang chủ | MindMeter" : "Home | MindMeter";
  }, [i18n.language]);

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace("#", ""));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  // Lấy thông tin user từ token hoặc anonymous account
  let user = null;
  const currentUser = getCurrentUser();
  const currentToken = getCurrentToken();

  if (currentUser) {
    if (
      isAnonymousUser(currentUser) ||
      currentUser.role === "ANONYMOUS" ||
      currentUser.email === null
    ) {
      // User ẩn danh
      user = {
        ...currentUser,
        name: currentUser.name || "Người dùng Ẩn danh",
        anonymous: true,
      };
    } else {
      // User đã đăng nhập
      user = currentUser;
    }
  } else if (currentToken) {
    try {
      const decoded = jwtDecode(currentToken);
      user = {};
      user.name = (
        (decoded.firstName || "") +
        (decoded.lastName ? " " + decoded.lastName : "")
      ).trim();
      user.email = decoded.sub || decoded.email || "";
      if (!user.name) user.name = user.email || "Student";
      if (decoded.avatar) user.avatar = decoded.avatar;
      if (decoded.role) user.role = decoded.role;
      if (decoded.anonymous) user.anonymous = true;
    } catch {}
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearAnonymousData();
    window.location.href = "/home"; // Force reload để reset toàn bộ state và user
  };

  const handleProfile = () => {
    // Navigate to profile page or show profile modal
    navigate("/student/profile");
  };

  // Các loại bài test hiện có
  const testTypes = [
    {
      key: "PHQ-9",
      name: "Bài Test PHQ-9",
      description:
        "Đánh giá mức độ trầm cảm dựa trên tiêu chuẩn quốc tế PHQ-9.",
      icon: (
        <svg
          className="w-8 h-8 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      key: "GAD-7",
      name: "Bài Test GAD-7",
      description: "Đánh giá mức độ lo âu dựa trên thang đo GAD-7 quốc tế.",
      icon: (
        <svg
          className="w-8 h-8 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
      ),
    },
    {
      key: "BDI",
      name: "Bài Test BDI",
      description:
        "Đánh giá mức độ trầm cảm theo thang Beck Depression Inventory (BDI).",
      icon: (
        <svg
          className="w-8 h-8 text-purple-600 dark:text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6a2 2 0 012-2h12a2 2 0 012 2v8c0 2.21-3.582 4-8 4z"
          />
        </svg>
      ),
    },
  ];

  // Thay đổi hàm handleTakeTest để nhận loại test
  const handleTakeTest = (testType) => {
    // Kiểm tra xem user đã đăng nhập hoặc có tài khoản ẩn danh chưa
    if (!currentUser && !currentToken) {
      // Chưa có tài khoản, lưu lại testType và hiển thị modal chọn
      setSelectedTestType(testType); // Lưu testType
      setAnonymousModalOpen(true);
      return;
    }
    navigate(`/student/test?type=${testType}`);
  };

  // Sửa hàm handleAnonymousStart để dùng selectedTestType
  const handleAnonymousStart = async () => {
    try {
      const response = await createAnonymousAccount();
      console.log("Anonymous API response:", response); // Thêm log kiểm tra
      const { user: anonymousUser, token } = response;
      if (!token) {
        alert(
          "Không nhận được token từ server. Vui lòng thử lại hoặc liên hệ admin."
        );
        return;
      }
      // Lưu thông tin user và token
      saveAnonymousUser(anonymousUser);
      saveAnonymousToken(token);
      // Đóng modal
      setAnonymousModalOpen(false);
      // Lưu pendingTestType vào localStorage để AppRoutes xử lý điều hướng
      const type = selectedTestType || "DASS-21";
      localStorage.setItem("pendingTestType", type);
      // Reload lại trang để AppRoutes kiểm tra và điều hướng đúng
      window.location.reload();
    } catch (error) {
      console.error("Error creating anonymous account:", error);
      alert("Lỗi tạo tài khoản ẩn danh. Vui lòng thử lại!");
    }
  };

  // Xử lý chuyển đến trang đăng nhập
  const handleLoginStart = () => {
    navigate("/login");
  };

  // Xử lý nâng cấp tài khoản ẩn danh
  const handleUpgradeAccount = async (userId, upgradeData) => {
    try {
      const response = await upgradeAnonymousAccount(userId, upgradeData);

      // Xóa dữ liệu anonymous
      clearAnonymousData();

      // Lưu thông tin user mới
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Refresh trang để cập nhật thông tin user
      window.location.reload();
    } catch (error) {
      console.error("Error upgrading account:", error);
      throw error;
    }
  };

  // Xử lý hiển thị modal nâng cấp
  const handleUpgradeClick = () => {
    setUpgradeModalOpen(true);
  };

  // Drag handlers for chatbot icon
  const handleDragStart = (e) => {
    dragData.current.dragging = true;
    dragData.current.startY =
      e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    dragData.current.startBottom = chatbotBottom;
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDragMove);
    document.addEventListener("touchend", handleDragEnd);
  };
  const handleDragMove = (e) => {
    if (!dragData.current.dragging) return;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    const deltaY = dragData.current.startY - clientY;
    let newBottom = dragData.current.startBottom + deltaY;
    // Clamp to window height
    const minBottom = 16;
    const maxBottom = window.innerHeight - 100;
    if (newBottom < minBottom) newBottom = minBottom;
    if (newBottom > maxBottom) newBottom = maxBottom;
    setChatbotBottom(newBottom);
  };
  const handleDragEnd = () => {
    dragData.current.dragging = false;
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchmove", handleDragMove);
    document.removeEventListener("touchend", handleDragEnd);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Anonymous Banner - chỉ hiển thị cho user ẩn danh */}
      {isAnonymousUser(user) && (
        <AnonymousBanner onUpgradeClick={handleUpgradeClick} />
      )}

      {/* Dashboard Header */}
      <DashboardHeader
        logoIcon={
          <FaBrain className="w-8 h-8 text-indigo-500 dark:text-indigo-300" />
        }
        logoText="MindMeter Student"
        user={user}
        theme={theme}
        setTheme={setTheme}
        i18n={i18n}
        onLogout={handleLogout}
        onProfile={handleProfile}
        className="mb-4"
      />

      {/* Add top padding to account for fixed header, only if not anonymous */}
      <div className={isAnonymousUser(user) ? undefined : "pt-20"}>
        <HeroSection user={user} onLogout={handleLogout} />
        <div id="test-section">
          <TestListSection onTakeTest={handleTakeTest} />
        </div>
        <div className="w-full bg-white py-14 md:py-20 dark:bg-gray-900">
          <AboutSection />
          {/* Section: Tôi có nên thực hiện bài test trầm cảm hay không? */}
          <section className="max-w-6xl mx-auto px-4 dark:bg-gray-900 rounded-2xl py-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 text-center tracking-tight">
              {t("studentHome.testOnlineTitle")}
            </h2>
            <div className="max-w-3xl mx-auto text-base md:text-lg text-gray-800 dark:text-white space-y-8 leading-relaxed text-center">
              <p>{t("studentHome.testOnlineP1")}</p>
              <p>{t("studentHome.testOnlineP2")}</p>
            </div>
          </section>
        </div>
        <FAQSection />
        <FooterSection />
      </div>

      {/* Chatbot Icon Floating Button */}
      <button
        ref={dragRef}
        onClick={() => setChatOpen(true)}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          position: "fixed",
          right: 24,
          bottom: chatbotBottom,
          zIndex: 50,
          cursor: "grab",
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl focus:outline-none select-none"
        title="Chat với AI MindMeter"
      >
        <img
          src="/src/assets/images/Chatbot.png"
          alt="Chatbot"
          className="w-10 h-10 object-contain"
          draggable={false}
        />
      </button>

      {/* Modals */}
      <ChatBotModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        user={user}
      />

      <AnonymousTestModal
        isOpen={anonymousModalOpen}
        onClose={() => setAnonymousModalOpen(false)}
        onAnonymousStart={handleAnonymousStart}
        onLoginStart={handleLoginStart}
      />

      <UpgradeAnonymousModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgrade={handleUpgradeAccount}
        userId={user ? user.id : undefined}
      />
    </div>
  );
};

export default StudentHomePage;
