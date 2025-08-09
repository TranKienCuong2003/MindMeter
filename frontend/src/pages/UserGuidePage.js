import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardHeader from "../components/DashboardHeader";
import FooterSection from "../components/FooterSection";
import { ThemeContext } from "../App";
import { FaBookOpen } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import {
  getCurrentUser,
  getCurrentToken,
  clearAnonymousData,
} from "../services/anonymousService";

export default function UserGuidePage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useContext(ThemeContext);
  const sections = t("guide.sections", { returnObjects: true });

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
    document.title = t("guide.header") + " | MindMeter";
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardHeader
        logoIcon={
          <FaBookOpen className="text-blue-500 dark:text-blue-300 text-2xl" />
        }
        logoText={t("guide.header")}
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
          <h1
            className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-indigo-300 mb-6 text-center"
            dangerouslySetInnerHTML={{ __html: t("guide.title") }}
          />
          <div className="space-y-6 text-gray-800 dark:text-gray-200 text-lg">
            {Array.isArray(sections) &&
              sections.map((section, sec) => (
                <section key={sec}>
                  <h2 className="font-bold text-xl mb-2 text-blue-700">
                    {section.title}
                  </h2>
                  <ul
                    className={
                      sec === 2
                        ? "list-decimal list-inside space-y-2"
                        : "list-disc list-inside space-y-2"
                    }
                  >
                    {Array.isArray(section.content) &&
                      section.content.map((item, idx) => (
                        <li
                          key={idx}
                          dangerouslySetInnerHTML={{ __html: item }}
                        />
                      ))}
                  </ul>
                </section>
              ))}
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
