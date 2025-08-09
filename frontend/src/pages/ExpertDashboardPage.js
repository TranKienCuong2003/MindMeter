import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";
import { ThemeContext } from "../App";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaGlobe,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaUserGraduate,
  FaSmile,
  FaSadTear,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import StatCard from "../components/StatCard";
import DepressionStatsChart from "../components/DepressionStatsChart";
import logo from "../logo.svg";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from "recharts";
import { authFetch } from "../authFetch";
import FooterSection from "../components/FooterSection";

export default function ExpertDashboardPage({
  handleLogout: propHandleLogout,
}) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAdvices: 0,
    depressionLevels: {},
    recentSurveys: [],
  });
  const [testStats, setTestStats] = useState(null);
  const { theme, setTheme } = React.useContext(ThemeContext);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const [sentAdviceCount, setSentAdviceCount] = useState(0);
  // Lấy user từ token
  let user = { name: "", avatar: null, email: "" };
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      user.name = (
        (decoded.firstName || "") +
        (decoded.lastName ? " " + decoded.lastName : "")
      ).trim();
      user.email = decoded.sub || decoded.email || "";
      if (!user.name) user.name = user.email || "Expert";
      if (decoded.avatar) user.avatar = decoded.avatar;
      if (decoded.role) user.role = decoded.role;
    } catch {}
  }
  const handleLogout =
    propHandleLogout ||
    (() => {
      localStorage.removeItem("token");
      navigate("/login");
    });
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const handleLang = (lang) => i18n.changeLanguage(lang);

  useEffect(() => {
    document.title = "Dashboard chuyên gia | MindMeter";
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        // Lấy thống kê tổng quan hệ thống (giống admin)
        const resStats = await authFetch("/api/admin/statistics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resStats.ok) throw new Error("Lỗi lấy thống kê");
        const statsData = await resStats.json();
        // Lấy thống kê test theo ngày
        const resTestStats = await authFetch(
          "/api/admin/statistics/test-count-by-date?days=14",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (resTestStats.ok) {
          const testStatsData = await resTestStats.json();
          setTestStats(testStatsData);
        }
        // Lấy 5 khảo sát gần đây nhất
        const resRecent = await authFetch("/api/admin/test-results/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resRecent.ok) {
          const recentSurveys = await resRecent.json();
          setStats({
            totalTests: statsData.totalTests || 0,
            depressionLevels: {
              MINIMAL: statsData.minimalTests || 0,
              MILD: statsData.mildTests || 0,
              MODERATE: statsData.moderateTests || 0,
              SEVERE: statsData.severeTests || 0,
            },
            recentSurveys: recentSurveys.slice(0, 5) || [],
          });
        }
        // Lấy số lượng lời khuyên đã gửi của chuyên gia hiện tại
        const resAdvice = await authFetch("/api/expert/messages/sent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resAdvice.ok) {
          const adviceList = await resAdvice.json();
          setSentAdviceCount(adviceList.length);
        } else {
          setSentAdviceCount(0);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  // Thêm AnimatedNumber giống AdminDashboardPage.js
  const AnimatedNumber = ({ value }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let start = 0;
      const end = Number(value);
      if (start === end) return;
      let increment = end / 30;
      let current = start;
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setDisplay(end);
          clearInterval(timer);
        } else {
          setDisplay(Math.floor(current));
        }
      }, 15);
      return () => clearInterval(timer);
    }, [value]);
    return <span>{display}</span>;
  };

  return (
    <div
      className={
        theme === "dark"
          ? "min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 overflow-x-hidden"
          : "min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-blue-100 to-white overflow-x-hidden"
      }
    >
      <DashboardHeader
        logoIcon={<span className="text-indigo-500 text-3xl">🎓</span>}
        logoText={t("MindMeter Expert Dashboard")}
        user={user}
        theme={theme}
        setTheme={setTheme}
        i18n={i18n}
        onLogout={handleLogout}
        onProfile={() => navigate("/expert/profile")}
      />
      <div className="flex-grow pt-32 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1
            className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-3 animate-fade-in"
            style={{ lineHeight: 1.35 }}
          >
            <span className="text-indigo-500 animate-bounce">🎓</span>
            <span>{t("expertDashboardTitle")}</span>
          </h1>
          <div
            className="h-1 w-40 bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 mx-auto rounded mb-2 animate-slide-in"
            style={{ paddingBottom: 12 }}
          ></div>
          <div
            className="text-lg text-gray-500 italic animate-fade-in-slow"
            style={{ lineHeight: 1.8 }}
          >
            {t("expertDashboardSlogan")}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={<span className="text-indigo-500 text-4xl">📋</span>}
            value={stats.totalTests || 0}
            label={t("totalTests")}
            color="text-indigo-600"
            bgColor="bg-indigo-50"
            iconBg="bg-indigo-100"
            onClick={() => navigate("/expert/students?filter=ALL")}
            className="cursor-pointer hover:scale-105"
          />
          <StatCard
            icon={<span className="text-blue-400 text-4xl">🔄</span>}
            value={sentAdviceCount}
            label={t("totalAdvices")}
            color="text-blue-600"
            bgColor="bg-blue-50"
            iconBg="bg-blue-100"
            onClick={() => navigate("/expert/advice-sent")}
            className="cursor-pointer hover:scale-105"
          />
          <StatCard
            icon={<span className="text-yellow-400 text-4xl">😊</span>}
            value={stats.depressionLevels?.MINIMAL || 0}
            label={t("minimalDepression")}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
            iconBg="bg-yellow-100"
            onClick={() => navigate("/expert/students?filter=MINIMAL")}
            className="cursor-pointer hover:scale-105"
          />
          <StatCard
            icon={<span className="text-orange-400 text-4xl">🙂</span>}
            value={stats.depressionLevels?.MILD || 0}
            label={t("mildDepression")}
            color="text-orange-600"
            bgColor="bg-orange-50"
            iconBg="bg-orange-100"
            onClick={() => navigate("/expert/students?filter=MILD")}
            className="cursor-pointer hover:scale-105"
          />
          <StatCard
            icon={<span className="text-yellow-700 text-4xl">😐</span>}
            value={stats.depressionLevels?.MODERATE || 0}
            label={t("moderateDepression")}
            color="text-yellow-700"
            bgColor="bg-yellow-100"
            iconBg="bg-yellow-200"
            className="md:col-start-2 cursor-pointer hover:scale-105"
            onClick={() => navigate("/expert/students?filter=MODERATE")}
          />
          <StatCard
            icon={<span className="text-red-400 text-4xl">😢</span>}
            value={stats.depressionLevels?.SEVERE || 0}
            label={t("severeDepression")}
            color="text-red-600"
            bgColor="bg-red-50"
            iconBg="bg-red-100"
            onClick={() => navigate("/expert/students?filter=SEVERE")}
            className="cursor-pointer hover:scale-105"
          />
        </div>
        {/* Biểu đồ tỷ lệ mức trầm cảm */}
        <DepressionStatsChart testStats={testStats} t={t} />
        {/* Bảng khảo sát gần đây giữ nguyên như cũ */}
        <div className="mt-10 bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border-t-4 border-blue-400">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-bold text-blue-700">
              {t("recentSurveys")}
            </div>
            <button
              className="text-blue-500 hover:underline text-sm font-medium"
              onClick={() => navigate("/expert/students")}
            >
              {t("seeAll")}
            </button>
          </div>
          {stats.recentSurveys.length === 0 ? (
            <div className="text-gray-400">{t("noData")}</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-blue-800 dark:text-blue-200 uppercase">
                    {t("studentNameHeader")}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-blue-800 dark:text-blue-200 uppercase">
                    {t("emailHeader")}
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-blue-800 dark:text-blue-200 uppercase">
                    {t("scoreHeader")}
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-blue-800 dark:text-blue-200 uppercase">
                    {t("levelHeader")}
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-blue-800 dark:text-blue-200 uppercase">
                    {t("dateHeader")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSurveys.map((s, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-blue-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-2 dark:text-white">
                      {s.studentName}
                    </td>
                    <td className="px-4 py-2 dark:text-white">{s.email}</td>
                    <td className="px-4 py-2 text-center dark:text-white">
                      {s.totalScore}
                    </td>
                    <td className="px-4 py-2 text-center dark:text-white">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          s.severityLevel === "SEVERE"
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                            : s.severityLevel === "MODERATE"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                            : s.severityLevel === "MILD"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {t(s.severityLevel?.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center dark:text-white">
                      {s.testedAt
                        ? new Date(s.testedAt).toLocaleDateString("vi-VN")
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <FooterSection />
    </div>
  );
}
