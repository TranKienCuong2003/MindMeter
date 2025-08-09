import React, { useContext } from "react";
import DashboardHeader from "../components/DashboardHeader";
import FooterSection from "../components/FooterSection";
import { useTranslation } from "react-i18next";
import { FaBrain } from "react-icons/fa";
import { getCurrentUser } from "../services/anonymousService";
import { ThemeContext } from "../App";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function PricingPage() {
  const { t, i18n } = useTranslation();
  const user = getCurrentUser();
  const { theme, setTheme } = useContext(ThemeContext);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.title = t("pricing.title") + " | MindMeter";
    // Hiển thị thông báo nếu có ?success=true trên URL
    const params = new URLSearchParams(location.search);
    if (params.get("success") === "true") {
      setShowSuccess(true);
      // Xoá param khỏi URL sau khi hiển thị
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [t, location]);

  // Khi nâng cấp thành công, fetch lại profile để cập nhật plan mới nhất
  useEffect(() => {
    if (showSuccess && user && user.role === "STUDENT") {
      const token = localStorage.getItem("token");
      fetch("/api/student/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem("user", JSON.stringify(data));
          window.location.reload();
        });
    }
  }, [showSuccess, user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("anonymousToken");
    window.location.href = "/login";
  };

  const handleBuyPlan = async (plan) => {
    setLoadingPlan(plan);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/payment/create-checkout-session",
        { plan },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        alert("Không lấy được link thanh toán. Vui lòng thử lại!");
      }
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Lỗi tạo phiên thanh toán. Vui lòng thử lại!"
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  if (!user || user.role !== "STUDENT") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <DashboardHeader
          logoIcon={
            <FaBrain className="w-8 h-8 text-indigo-500 dark:text-indigo-300" />
          }
          logoText="MindMeter Student"
          user={user}
          i18n={i18n}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 mt-32 text-center max-w-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              {t("pricing.noAccessTitle")}
            </h2>
            <p className="text-gray-700 dark:text-gray-200 mb-2">
              {t("pricing.noAccessDesc")}
            </p>
            <button
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
              onClick={() => (window.location.href = "/login")}
            >
              {t("login")}
            </button>
          </div>
        </div>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <DashboardHeader
        logoIcon={
          <FaBrain className="w-8 h-8 text-indigo-500 dark:text-indigo-300" />
        }
        logoText="MindMeter Student"
        user={user}
        i18n={i18n}
        theme={theme}
        setTheme={setTheme}
        onLogout={handleLogout}
      />
      {showSuccess && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-800 px-8 py-4 rounded-xl shadow-lg text-lg font-semibold animate-fade-in">
          {t("pricing.upgradeSuccess")}
        </div>
      )}
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4 pt-32">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-blue-700 dark:text-indigo-300 mb-8">
          {t("pricing.title")}
        </h1>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-stretch">
          {/* Free Plan */}
          <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col items-center border-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {t("pricing.freeTitle")}
            </h2>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
              {t("pricing.freePrice")}
            </div>
            <div className="text-sm text-gray-500 mb-6">
              {t("pricing.perMonth")}
            </div>
            <ul className="text-gray-700 dark:text-gray-200 text-left mb-8 space-y-2 w-full max-w-xs mx-auto">
              <li>✔️ {t("pricing.free1")}</li>
              <li>✔️ {t("pricing.free2")}</li>
              <li>✔️ {t("pricing.free3")}</li>
              <li>✔️ {t("pricing.free4")}</li>
            </ul>
            <button
              className="w-full py-3 rounded-lg bg-gray-300 text-gray-500 font-semibold cursor-not-allowed"
              disabled
            >
              {user.plan === "FREE" || !user.plan
                ? t("pricing.currentPlan")
                : t("pricing.upgradeFree")}
            </button>
          </div>
          {/* Plus Plan */}
          <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center border-4 border-green-400 dark:border-green-600 scale-105">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {t("pricing.plusTitle")}
            </h2>
            <div className="text-3xl font-extrabold text-green-600 dark:text-green-400 mb-2">
              {t("pricing.plusPrice")}
            </div>
            <div className="text-sm text-gray-500 mb-6">
              {t("pricing.perMonth")}
            </div>
            <ul className="text-gray-700 dark:text-gray-200 text-left mb-8 space-y-2 w-full max-w-xs mx-auto">
              <li>✔️ {t("pricing.plus1")}</li>
              <li>✔️ {t("pricing.plus2")}</li>
              <li>✔️ {t("pricing.plus3")}</li>
              <li>✔️ {t("pricing.plus4")}</li>
              <li>✔️ {t("pricing.plus5")}</li>
            </ul>
            <button
              className={`w-full py-3 rounded-lg font-semibold transition ${
                user.plan === "PLUS"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
              onClick={() => handleBuyPlan("plus")}
              disabled={loadingPlan !== null || user.plan === "PLUS"}
            >
              {loadingPlan === "plus"
                ? t("pricing.loading")
                : user.plan === "PLUS"
                ? t("pricing.currentPlan")
                : t("pricing.upgradePlus")}
            </button>
          </div>
          {/* Pro Plan */}
          <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col items-center border-2 border-purple-400 dark:border-purple-600">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {t("pricing.proTitle")}
            </h2>
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mb-2">
              {t("pricing.proPrice")}
            </div>
            <div className="text-sm text-gray-500 mb-6">
              {t("pricing.perMonth")}
            </div>
            <ul className="text-gray-700 dark:text-gray-200 text-left mb-8 space-y-2 w-full max-w-xs mx-auto">
              <li>✔️ {t("pricing.pro1")}</li>
              <li>✔️ {t("pricing.pro2")}</li>
              <li>✔️ {t("pricing.pro3")}</li>
              <li>✔️ {t("pricing.pro4")}</li>
            </ul>
            <button
              className={`w-full py-3 rounded-lg font-semibold transition ${
                user.plan === "PRO"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
              onClick={() => handleBuyPlan("pro")}
              disabled={loadingPlan !== null || user.plan === "PRO"}
            >
              {loadingPlan === "pro"
                ? t("pricing.loading")
                : user.plan === "PRO"
                ? t("pricing.currentPlan")
                : t("pricing.upgradePro")}
            </button>
          </div>
        </div>
        <div className="mt-10 text-center text-gray-500 dark:text-gray-400 text-sm max-w-2xl mx-auto">
          {t("pricing.demoNote")}
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
