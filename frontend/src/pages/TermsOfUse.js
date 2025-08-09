import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardHeader from "../components/DashboardHeader";
import FooterSection from "../components/FooterSection";
import { ThemeContext } from "../App";
import { FaFileContract } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import {
  getCurrentUser,
  getCurrentToken,
  clearAnonymousData,
} from "../services/anonymousService";

export default function TermsOfUse() {
  const { t } = useTranslation();
  const { theme, setTheme } = useContext(ThemeContext);

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
    document.title = t("terms.title") + " | MindMeter";
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardHeader
        logoIcon={
          <FaFileContract className="text-blue-500 dark:text-blue-300 text-2xl" />
        }
        logoText={t("terms.title") || "Điều Khoản Sử Dụng"}
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
        <div className="max-w-3xl w-full bg-white dark:bg-[#232a36] rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-[#232a36]">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
            {t("terms.title")}
          </h1>
          <p className="mb-4 text-gray-800 dark:text-gray-200">
            {t("terms.intro")}
          </p>
          <ol className="list-decimal ml-6 mb-4 text-gray-800 dark:text-gray-200 space-y-2">
            <li>
              <b>{t("terms.items.1.title")}</b> {t("terms.items.1.desc")}
            </li>
            <li>
              <b>{t("terms.items.2.title")}</b> {t("terms.items.2.desc")}
            </li>
            <li>
              <b>{t("terms.items.3.title")}</b> {t("terms.items.3.desc")}
            </li>
            <li>
              <b>{t("terms.items.4.title")}</b> {t("terms.items.4.desc")}
            </li>
            <li>
              <b>{t("terms.items.5.title")}</b> {t("terms.items.5.desc")}
            </li>
            <li>
              <b>{t("terms.items.6.title")}</b> {t("terms.items.6.desc")}
            </li>
            <li>
              <b>{t("terms.items.7.title")}</b> {t("terms.items.7.desc")}
            </li>
          </ol>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            {t("terms.copyright", { year: new Date().getFullYear() })}
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
