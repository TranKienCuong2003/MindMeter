import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardHeader from "../components/DashboardHeader";
import FooterSection from "../components/FooterSection";
import { ThemeContext } from "../App";
import { FaExclamationTriangle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import {
  getCurrentUser,
  getCurrentToken,
  clearAnonymousData,
} from "../services/anonymousService";

export default function Disclaimer() {
  const { t } = useTranslation();
  const { theme, setTheme } = useContext(ThemeContext);
  const items = t("disclaimer.items", { returnObjects: true });

  // Đồng bộ logic lấy user như trang Home
  let user = null;
  let u = getCurrentUser();
  const token = getCurrentToken();
  if (u) {
    if (u.anonymous === true || u.role === "ANONYMOUS" || u.email === null) {
      u = {
        ...u,
        name: u.name || "Người dùng Ẩn danh",
        anonymous: true,
        role: u.role || "STUDENT",
      };
    }
    user = u;
  } else if (token) {
    try {
      const decoded = jwtDecode(token);
      let userObj = {};
      userObj.name = (
        (decoded.firstName || "") +
        (decoded.lastName ? " " + decoded.lastName : "")
      ).trim();
      userObj.email = decoded.sub || decoded.email || "";
      if (!userObj.name) userObj.name = userObj.email || "Student";
      if (decoded.avatar) userObj.avatar = decoded.avatar;
      if (decoded.role) userObj.role = decoded.role;
      if (decoded.anonymous) userObj.anonymous = true;
      if (userObj.anonymous && !userObj.role) userObj.role = "STUDENT";
      if (userObj.anonymous && !userObj.name)
        userObj.name = "Người dùng Ẩn danh";
      user = userObj;
    } catch {}
  }

  useEffect(() => {
    document.title = t("disclaimer.title") + " | MindMeter";
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardHeader
        logoIcon={
          <FaExclamationTriangle className="text-yellow-500 dark:text-yellow-300 text-2xl" />
        }
        logoText={t("disclaimer.title") || "Disclaimer"}
        user={user}
        theme={theme}
        setTheme={setTheme}
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          clearAnonymousData();
          window.location.href = "/login";
        }}
        onProfile={() => {
          if (!user) return;
          if (user.role === "ADMIN") {
            window.location.href = "/admin/profile";
          } else if (user.role === "EXPERT") {
            window.location.href = "/expert/profile";
          } else {
            window.location.href = "/student/profile";
          }
        }}
      />
      <main className="flex-grow flex flex-col items-center justify-center pt-28 pb-8 px-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 w-full">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-indigo-300 mb-6 text-center">
            {t("disclaimer.title")}
          </h1>
          <div className="text-gray-800 dark:text-gray-200 text-lg space-y-6">
            <p>{t("disclaimer.intro")}</p>
            <ol className="list-decimal list-inside space-y-2">
              {Array.isArray(items) &&
                items.map((item, idx) => (
                  <li key={idx}>
                    <b>{item.bold}</b>
                    {item.text}
                  </li>
                ))}
            </ol>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("disclaimer.copyright", { year: new Date().getFullYear() })}
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
