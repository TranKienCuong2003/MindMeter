import React, { useEffect, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardHeader from "../components/DashboardHeader";
import FooterSection from "../components/FooterSection";
import { ThemeContext } from "../App";
import { FaShieldAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import {
  getCurrentUser,
  getCurrentToken,
  clearAnonymousData,
} from "../services/anonymousService";

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useContext(ThemeContext);

  // Đồng bộ logic lấy user như trang Home
  const [user, setUser] = useState(() => {
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
      return u;
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
        return userObj;
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    // Lắng nghe sự kiện storage để cập nhật user khi đăng nhập/đăng xuất ở tab khác
    const handleStorage = () => {
      // Lặp lại logic đồng bộ user
      let u = getCurrentUser();
      const token = getCurrentToken();
      if (u) {
        if (
          u.anonymous === true ||
          u.role === "ANONYMOUS" ||
          u.email === null
        ) {
          u = {
            ...u,
            name: u.name || "Người dùng Ẩn danh",
            anonymous: true,
            role: u.role || "STUDENT",
          };
        }
        setUser(u);
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
          setUser(userObj);
        } catch {}
      } else {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    setUser((prev) => prev); // trigger update on mount
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    document.title = t("privacyPolicy.title") + " | MindMeter";
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6fa] dark:bg-[#181e29]">
      <DashboardHeader
        logoIcon={
          <FaShieldAlt className="text-blue-500 dark:text-blue-300 text-2xl" />
        }
        logoText={t("privacyPolicy.mainTitle") || "Chính Sách Quyền Riêng Tư"}
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
      <main className="flex-grow flex flex-col items-center justify-center pt-28 pb-8">
        <div className="w-full max-w-3xl p-8 bg-white dark:bg-[#232a36] shadow-lg dark:shadow-xl rounded-lg text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-[#232a36]">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
            {t("privacyPolicy.mainTitle")}
          </h1>
          <p className="mb-4">
            <strong className="text-green-700 dark:text-green-400">
              MindMeter
            </strong>{" "}
            {t("privacyPolicy.intro")}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2 text-blue-600">
            {t("privacyPolicy.section1.title")}
          </h2>
          <ul className="list-disc ml-8 mb-4">
            <li>
              <strong>{t("privacyPolicy.section1.personalInfo")}:</strong>{" "}
              {t("privacyPolicy.section1.personalInfoDesc")}
            </li>
            <li>
              <strong>{t("privacyPolicy.section1.loginInfo")}:</strong>{" "}
              {t("privacyPolicy.section1.loginInfoDesc")}
            </li>
            <li>
              <strong>{t("privacyPolicy.section1.socialInfo")}:</strong>{" "}
              {t("privacyPolicy.section1.socialInfoDesc")}
            </li>
            <li>
              <strong>{t("privacyPolicy.section1.technicalInfo")}:</strong>{" "}
              {t("privacyPolicy.section1.technicalInfoDesc")}
            </li>
            <li>
              <strong>{t("privacyPolicy.section1.behaviorInfo")}:</strong>{" "}
              {t("privacyPolicy.section1.behaviorInfoDesc")}
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-2 text-blue-600">
            {t("privacyPolicy.section2.title")}
          </h2>
          <ul className="list-disc ml-8 mb-4">
            <li>{t("privacyPolicy.section2.purpose1")}</li>
            <li>{t("privacyPolicy.section2.purpose2")}</li>
            <li>{t("privacyPolicy.section2.purpose3")}</li>
            <li>{t("privacyPolicy.section2.purpose4")}</li>
            <li>{t("privacyPolicy.section2.purpose5")}</li>
            <li>{t("privacyPolicy.section2.purpose6")}</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-2 text-blue-600">
            {t("privacyPolicy.section3.title")}
          </h2>
          <ul className="list-disc ml-8 mb-4">
            <li>{t("privacyPolicy.section3.sharing1")}</li>
            <li>{t("privacyPolicy.section3.sharing2")}</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-2 text-blue-600">
            {t("privacyPolicy.section4.title")}
          </h2>
          <ul className="list-disc ml-8 mb-4">
            <li>{t("privacyPolicy.section4.security1")}</li>
            <li>{t("privacyPolicy.section4.security2")}</li>
            <li>{t("privacyPolicy.section4.security3")}</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-2 text-blue-600">
            {t("privacyPolicy.section5.title")}
          </h2>
          <ul className="list-disc ml-8 mb-4">
            <li>{t("privacyPolicy.section5.rights1")}</li>
            <li>{t("privacyPolicy.section5.rights2")}</li>
            <li>{t("privacyPolicy.section5.rights3")}</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-2 text-blue-600">
            {t("privacyPolicy.section6.title")}
          </h2>
          <ul className="list-disc ml-8 mb-4">
            <li>{t("privacyPolicy.section6.storage1")}</li>
            <li>{t("privacyPolicy.section6.storage2")}</li>
            <li>{t("privacyPolicy.section6.storage3")}</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-2 text-blue-600">
            {t("privacyPolicy.section7.title")}
          </h2>
          <ul className="list-disc ml-8 mb-4">
            <li>{t("privacyPolicy.section7.cookies1")}</li>
            <li>{t("privacyPolicy.section7.cookies2")}</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-2 text-blue-600">
            {t("privacyPolicy.section8.title")}
          </h2>
          <ul className="list-disc ml-8 mb-4">
            <li>{t("privacyPolicy.section8.links")}</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-2 text-blue-600">
            {t("privacyPolicy.section9.title")}
          </h2>
          <ul className="list-disc ml-8 mb-4">
            <li>{t("privacyPolicy.section9.changes")}</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-2 text-blue-600">
            {t("privacyPolicy.section10.title")}
          </h2>
          <p className="mb-2">{t("privacyPolicy.section10.contactIntro")}</p>
          <ul className="list-disc ml-8 mb-8">
            <li>
              Email:{" "}
              <a
                href="mailto:trankiencuong30072003@gmail.com"
                className="text-blue-500 dark:text-blue-300 underline"
              >
                trankiencuong30072003@gmail.com
              </a>
            </li>
            <li>{t("privacyPolicy.section10.address")}</li>
            <li>{t("privacyPolicy.section10.hotline")}</li>
          </ul>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            &copy; {new Date().getFullYear()} MindMeter.{" "}
            {t("privacyPolicy.copyright")}
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default PrivacyPolicy;
