import React, { useState } from "react";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaGlobe,
  FaChevronDown,
  FaHistory, // Thêm icon lịch sử
  FaEllipsisV, // Thêm icon 3 chấm
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BellIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { authFetch } from "../authFetch";
import { isAnonymousUser } from "../services/anonymousService";

function mergeAndSortNotifications(adviceArr, systemArr) {
  // Chuẩn hóa advice
  const advice = (adviceArr || []).map((n) => ({
    ...n,
    type: "advice",
    isRead: n.isRead !== undefined ? n.isRead : n.read, // Đảm bảo luôn có isRead
    createdAt: n.createdAt || n.sentAt || n.timestamp,
  }));
  // Chuẩn hóa system announcement
  const system = (systemArr || []).map((n) => ({
    ...n,
    type: "system",
    isRead: true, // system announcement luôn coi là đã đọc
    createdAt: n.createdAt,
  }));
  // Gộp và sort
  return [...advice, ...system].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export default function DashboardHeader({
  logoIcon, // React node, ví dụ <FaChartPie ... />
  logoText, // string, ví dụ "MindMeter Admin" hoặc "MindMeter Expert"
  user,
  theme,
  setTheme,
  onLogout,
  onProfile, // optional
  className,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showIntroMenu, setShowIntroMenu] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNoti, setLoadingNoti] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Fetch notifications khi mở popup
  useEffect(() => {
    if (showNotifications && user && user.role === "STUDENT") {
      setLoadingNoti(true);
      Promise.all([
        authFetch("/api/advice/received").then((res) =>
          Array.isArray(res)
            ? res
            : res && typeof res.json === "function"
            ? res.json()
            : []
        ),
        authFetch("/api/auth/student/announcements").then((res) =>
          Array.isArray(res)
            ? res
            : res && typeof res.json === "function"
            ? res.json()
            : []
        ),
      ])
        .then(([adviceData, systemData]) => {
          const adviceArr = Array.isArray(adviceData) ? adviceData : [];
          const systemArr = Array.isArray(systemData) ? systemData : [];
          const notiArr = mergeAndSortNotifications(adviceArr, systemArr);
          setNotifications(notiArr);
          // Đếm số chưa đọc dựa trên notiArr đã chuẩn hóa
          setUnreadCount(
            notiArr.filter((n) => n.type === "advice" && !n.isRead).length
          );
          setLoadingNoti(false);
        })
        .catch(() => setLoadingNoti(false));
    }
  }, [showNotifications, user]);

  // Fetch unreadCount khi user thay đổi (vào trang, login, reload...)
  useEffect(() => {
    if (user && user.role === "STUDENT") {
      authFetch("/api/advice/received")
        .then((res) =>
          Array.isArray(res)
            ? res
            : res && typeof res.json === "function"
            ? res.json()
            : []
        )
        .then((data) => {
          const adviceArr = Array.isArray(data) ? data : [];
          // Chuẩn hóa adviceArr để lấy đúng isRead
          const mapped = adviceArr.map((n) => ({
            ...n,
            isRead: n.isRead !== undefined ? n.isRead : n.read,
          }));
          setUnreadCount(mapped.filter((n) => !n.isRead).length);
        })
        .catch(() => {});
    }
  }, [user]);

  // Đánh dấu đã đọc
  const markAsRead = (id) => {
    authFetch(`/api/advice/${id}/read`, { method: "PUT" })
      .then(() => {
        setNotifications((prev) => {
          const updated = prev.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          // Đếm số chưa đọc dựa trên notiArr đã chuẩn hóa
          setUnreadCount(
            updated.filter((n) => n.type === "advice" && !n.isRead).length
          );
          return updated;
        });
      })
      .catch(() => {});
  };
  return (
    <div
      className={
        "fixed top-0 left-0 w-full z-30 flex items-center justify-between px-12 py-4 " +
        (theme === "dark"
          ? "bg-gray-900/90 border-gray-800"
          : "bg-white/80 border-blue-100") +
        " backdrop-blur-md shadow-lg rounded-b-2xl border-b animate-fade-in-slow " +
        (className || "")
      }
    >
      {/* Logo + 3 chấm: Mobile */}
      <div className="flex items-center gap-5 select-none cursor-pointer md:gap-5 md:cursor-pointer w-full md:w-auto">
        <div
          className="flex items-center gap-5 select-none cursor-pointer"
          onClick={() => navigate("/home")}
        >
          {logoIcon}
          <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 dark:from-indigo-300 dark:via-blue-300 dark:to-purple-400 bg-clip-text text-transparent tracking-wide">
            {logoText}
          </span>
        </div>
        {/* Nút 3 chấm chỉ hiện ở mobile */}
        <div className="flex-1 flex justify-end md:hidden">
          <button
            className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-800 focus:outline-none"
            onClick={() => setShowMobileMenu((v) => !v)}
            aria-label="Open menu"
          >
            <FaEllipsisV className="w-6 h-6 text-white dark:text-white" />
          </button>
        </div>
      </div>
      {/* Menu ngang: chỉ hiện ở md trở lên */}
      <div className="flex-1 justify-center hidden md:flex">
        <nav className="flex gap-14 items-center text-base font-semibold">
          <span
            className="cursor-pointer hover:text-blue-600 dark:text-white"
            onClick={() => navigate("/home")}
          >
            {t("navHome")}
          </span>
          <div
            className="relative"
            onMouseEnter={() => setShowIntroMenu(true)}
            onMouseLeave={() => setShowIntroMenu(false)}
          >
            <span
              className={
                "cursor-pointer hover:text-blue-600 flex items-center gap-1 dark:text-white " +
                (showIntroMenu ? "text-blue-600" : "")
              }
            >
              {t("navAbout")}{" "}
              <FaChevronDown className="inline text-xs mt-0.5" />
            </span>
            {/* Dropdown About */}
            {showIntroMenu && (
              <>
                <div
                  className="absolute left-0 top-full w-full h-3 z-40"
                  onMouseEnter={() => setShowIntroMenu(true)}
                  onMouseLeave={() => setShowIntroMenu(false)}
                />
                <div
                  className="absolute left-0 top-[calc(100%+12px)] bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 min-w-[220px] z-50 border border-blue-100 dark:border-gray-700"
                  onMouseEnter={() => setShowIntroMenu(true)}
                  onMouseLeave={() => setShowIntroMenu(false)}
                >
                  <div
                    className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                    onClick={() => {
                      navigate("/privacy-policy");
                      setShowIntroMenu(false);
                    }}
                  >
                    {t("navPrivacyPolicy")}
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                    onClick={() => {
                      navigate("/terms-of-use");
                      setShowIntroMenu(false);
                    }}
                  >
                    {t("navTermsOfUse")}
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                    onClick={() => {
                      navigate("/user-guide");
                      setShowIntroMenu(false);
                    }}
                  >
                    {t("navUserGuide")}
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                    onClick={() => {
                      navigate("/disclaimer");
                      setShowIntroMenu(false);
                    }}
                  >
                    {t("navDisclaimer")}
                  </div>
                </div>
              </>
            )}
          </div>
          <span
            className="cursor-pointer hover:text-blue-600 dark:text-white"
            onClick={() => {
              function smoothScrollTo(element) {
                if (!element) return;
                const headerOffset = 90; // adjust if needed
                const elementPosition =
                  element.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;
                const start = window.pageYOffset;
                const distance = offsetPosition - start;
                const duration = 900; // ms, slower scroll
                let startTime = null;
                function animation(currentTime) {
                  if (startTime === null) startTime = currentTime;
                  const timeElapsed = currentTime - startTime;
                  const run = ease(timeElapsed, start, distance, duration);
                  window.scrollTo(0, run);
                  if (timeElapsed < duration) requestAnimationFrame(animation);
                }
                function ease(t, b, c, d) {
                  t /= d / 2;
                  if (t < 1) return (c / 2) * t * t + b;
                  t--;
                  return (-c / 2) * (t * (t - 2) - 1) + b;
                }
                requestAnimationFrame(animation);
              }
              if (window.location.pathname === "/home") {
                const el = document.getElementById("test-section");
                smoothScrollTo(el);
              } else {
                navigate("/home#test-section");
                setTimeout(() => {
                  const el = document.getElementById("test-section");
                  smoothScrollTo(el);
                }, 400);
              }
            }}
          >
            {t("navTestList")}
          </span>
          <span
            className="cursor-pointer hover:text-blue-600 dark:text-white"
            onClick={() => navigate("/contact")}
          >
            {t("navContact")}
          </span>
        </nav>
      </div>
      {/* Di chuyển menu mobile ra ngoài header để luôn hiển thị đúng khi showMobileMenu */}
      {showMobileMenu && (
        <div className="absolute top-20 left-0 w-full bg-white dark:bg-gray-900 shadow-lg z-50 flex flex-col items-center py-4 animate-fade-in md:hidden">
          {/* Main nav items - chỉ hiển thị các mục chính */}
          <span
            className="py-3 w-full text-center font-semibold text-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
            onClick={() => {
              navigate("/home");
              setShowMobileMenu(false);
            }}
          >
            {t("navHome")}
          </span>
          <div className="w-full border-t border-gray-200 dark:border-gray-700 my-1" />
          <span
            className="py-3 w-full text-center font-semibold text-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 text-gray-900 dark:text-white"
            onClick={() => setShowIntroMenu((v) => !v)}
          >
            {t("navAbout")} <FaChevronDown className="inline text-xs mt-0.5" />
          </span>
          {showIntroMenu && (
            <div className="w-full flex flex-col items-center">
              <span
                className="py-2 w-full text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                onClick={() => {
                  navigate("/privacy-policy");
                  setShowIntroMenu(false);
                  setShowMobileMenu(false);
                }}
              >
                {t("navPrivacyPolicy")}
              </span>
              <span
                className="py-2 w-full text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                onClick={() => {
                  navigate("/terms-of-use");
                  setShowIntroMenu(false);
                  setShowMobileMenu(false);
                }}
              >
                {t("navTermsOfUse")}
              </span>
              <span
                className="py-2 w-full text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                onClick={() => {
                  navigate("/user-guide");
                  setShowIntroMenu(false);
                  setShowMobileMenu(false);
                }}
              >
                {t("navUserGuide")}
              </span>
              <span
                className="py-2 w-full text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                onClick={() => {
                  navigate("/disclaimer");
                  setShowIntroMenu(false);
                  setShowMobileMenu(false);
                }}
              >
                {t("navDisclaimer")}
              </span>
            </div>
          )}
          <div className="w-full border-t border-gray-200 dark:border-gray-700 my-1" />
          <span
            className="py-3 w-full text-center font-semibold text-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
            onClick={() => {
              navigate("/home#test-section");
              setShowMobileMenu(false);
            }}
          >
            {t("navTestList")}
          </span>
          <div className="w-full border-t border-gray-200 dark:border-gray-700 my-1" />
          <span
            className="py-3 w-full text-center font-semibold text-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
            onClick={() => {
              navigate("/contact");
              setShowMobileMenu(false);
            }}
          >
            {t("navContact")}
          </span>
        </div>
      )}
      {/* Đưa icon chuông vào cùng khối với avatar và tên */}
      <div className="relative items-center gap-6 select-none hidden md:flex">
        {/* Nếu không có user, hiển thị nút Đăng nhập/Đăng ký */}
        {!user ? (
          <div className="flex gap-3">
            <button
              className="px-5 py-2 rounded-full font-semibold bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all duration-200"
              onClick={() => navigate("/login")}
            >
              {t("login")}
            </button>
            <button
              className="px-5 py-2 rounded-full font-semibold border border-blue-600 text-blue-600 bg-white dark:bg-gray-900 shadow-md hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200"
              onClick={() => navigate("/register")}
            >
              {t("register")}
            </button>
          </div>
        ) : (
          // ...avatar/menu như cũ...
          <>
            {/* Icon chuông */}
            {user && user.role === "STUDENT" && (
              <button
                className="relative focus:outline-none mr-2"
                onClick={() => {
                  setShowNotifications((v) => !v);
                  setShowMenu(false);
                }}
                aria-label="Notifications"
              >
                <BellIcon className="w-7 h-7 text-blue-500 dark:text-blue-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            {/* Khối avatar + tên + mũi tên */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                setShowMenu((v) => !v);
                setShowNotifications(false);
              }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border-2 border-indigo-400 dark:border-indigo-700 shadow hover:scale-105 transition"
                />
              ) : (
                <FaUserCircle className="w-10 h-10 text-indigo-400 dark:text-indigo-200 bg-white dark:bg-gray-800 rounded-full border-2 border-indigo-200 dark:border-indigo-700 shadow hover:scale-105 transition" />
              )}
              <span className="font-semibold text-gray-800 dark:text-gray-100 mr-2">
                {isAnonymousUser(user) ? t("anonymousUserName") : user.name}
              </span>
              <FaChevronDown className="text-indigo-500 dark:text-indigo-300" />
            </div>
            {showMenu && (
              <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-blue-100 dark:border-gray-700 min-w-[180px] py-2 animate-fade-in z-50">
                {onProfile && !isAnonymousUser(user) && (
                  <div
                    className="px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProfile();
                      setShowMenu(false);
                    }}
                  >
                    <FaUserCircle className="text-indigo-400 dark:text-indigo-200" />
                    <span>{t("accountInfo")}</span>
                  </div>
                )}
                {user.role === "STUDENT" && !isAnonymousUser(user) && (
                  <div
                    className="px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/student/test-history");
                      setShowMenu(false);
                    }}
                  >
                    <FaHistory className="text-gray-500 dark:text-gray-300" />
                    <span>{t("history")}</span>
                  </div>
                )}
                <div
                  className={
                    `px-4 py-2 flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer ` +
                    (theme === "dark" ? "text-white" : "text-gray-700")
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setTheme(theme === "dark" ? "light" : "dark");
                    setShowMenu(false);
                  }}
                >
                  {theme === "dark" ? (
                    <FaSun className="text-yellow-400" />
                  ) : (
                    <FaMoon className="text-gray-600" />
                  )}
                  <span>
                    {theme === "dark" ? t("lightMode") : t("darkMode")}
                  </span>
                </div>
                <div
                  className="px-4 py-2 flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi");
                    setShowMenu(false);
                  }}
                >
                  <FaGlobe className="text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-100">
                    {i18n.language === "vi"
                      ? "Ngôn ngữ: Tiếng Anh"
                      : "Language: Vietnamese"}
                  </span>
                </div>
                <div
                  className="px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                    setShowMenu(false);
                  }}
                >
                  <FaSignOutAlt className="text-red-500" />
                  <span>{t("logout")}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Popup notification */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-0.5 w-96 max-w-[90vw] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-blue-100 dark:border-gray-700 z-60 animate-fade-in">
          <div className="p-4 border-b border-blue-100 dark:border-gray-700 font-bold text-lg text-blue-700 dark:text-blue-200">
            {t("notification.title")}
          </div>
          {/* Filter buttons */}
          <div className="flex gap-2 px-4 py-2 border-b border-blue-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <button
              className={`px-3 py-1 rounded-lg font-semibold text-sm transition border ${
                filterType === "all"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
              }`}
              onClick={() => setFilterType("all")}
            >
              {t("notification.filter.all") || "Tất cả"}
            </button>
            <button
              className={`px-3 py-1 rounded-lg font-semibold text-sm transition border ${
                filterType === "system"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
              }`}
              onClick={() => setFilterType("system")}
            >
              {t("notification.type.system") || "Thông báo hệ thống"}
            </button>
            <button
              className={`px-3 py-1 rounded-lg font-semibold text-sm transition border ${
                filterType === "advice"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
              }`}
              onClick={() => setFilterType("advice")}
            >
              {t("notification.type.advice") || "Lời khuyên"}
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loadingNoti ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-300">
                {t("loading")}...
              </div>
            ) : notifications.filter((n) =>
                filterType === "all" ? true : n.type === filterType
              ).length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-300">
                {t("notification.noNotifications")}
              </div>
            ) : (
              notifications
                .filter((n) =>
                  filterType === "all" ? true : n.type === filterType
                )
                .map((n) => (
                  <div
                    key={n.id + n.type}
                    className={`px-4 py-3 border-b border-blue-50 dark:border-gray-700 flex flex-col gap-1 ${
                      n.isRead
                        ? "bg-gray-50 dark:bg-gray-900"
                        : "bg-blue-50 dark:bg-blue-900"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-semibold ${
                          n.isRead
                            ? "text-gray-500 dark:text-gray-300"
                            : "text-blue-700 dark:text-blue-200"
                        }`}
                      >
                        {/* Nhãn loại thông báo */}
                        {n.type === "advice"
                          ? t("notification.type.advice") || "Lời khuyên"
                          : t("notification.type.system") ||
                            "Thông báo hệ thống"}
                      </span>
                      {/* Chỉ advice mới có thể đánh dấu đã đọc */}
                      {n.type === "advice" && !n.isRead && (
                        <button
                          className="text-xs text-blue-600 dark:text-blue-300 underline ml-2"
                          onClick={() => markAsRead(n.id)}
                        >
                          {t("notification.markAsRead")}
                        </button>
                      )}
                    </div>
                    {/* Tiêu đề và nội dung */}
                    <div className="font-bold text-base text-gray-800 dark:text-gray-100">
                      {n.type === "advice"
                        ? t("notification.defaultAdviceTitle")
                        : n.title || n.subject || "(Không có tiêu đề)"}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-200">
                      {n.content || n.message || n.body || ""}
                    </div>
                    {/* Ngày tạo */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString("vi-VN")
                        : ""}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
