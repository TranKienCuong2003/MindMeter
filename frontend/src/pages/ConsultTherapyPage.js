import React, { useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import DashboardHeader from "../components/DashboardHeader";
import FooterSection from "../components/FooterSection";
import { ThemeContext } from "../App";
import {
  getCurrentUser,
  getCurrentToken,
  clearAnonymousData,
} from "../services/anonymousService";
import { FaUserMd } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const EMAIL = "trankiencuong30072003@gmail.com";
const PHONE = "0369702376";

const ConsultTherapyPage = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = React.useContext(ThemeContext);
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
    document.title =
      i18n.language === "vi"
        ? t("consult.pageTitle") + " | MindMeter"
        : t("consult.pageTitle") + " | MindMeter";
  }, [i18n.language, t]);

  const bullets = t("consult.bullets", { returnObjects: true });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardHeader
        logoIcon={
          <FaUserMd className="text-blue-500 dark:text-blue-300 text-2xl" />
        }
        logoText={t("consult.pageTitle")}
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
        <div className="max-w-3xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800 dark:text-blue-300 mb-6 text-center">
            {t("consult.title")}
          </h1>
          <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 mb-6 text-center">
            {t("consult.intro")}
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-3 mb-6">
            {Array.isArray(bullets) &&
              bullets.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
          <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-6 text-center mb-6">
            <p className="text-base md:text-lg text-blue-900 dark:text-blue-200 font-semibold mb-2">
              {t("consult.contactTitle")}
            </p>
            <p className="text-gray-800 dark:text-gray-200">
              <Trans
                i18nKey="consult.contactDesc"
                values={{ email: EMAIL, phone: PHONE }}
                components={{
                  1: (
                    <a
                      href={`mailto:${EMAIL}`}
                      className="text-blue-700 dark:text-blue-300 underline"
                    />
                  ),
                  3: (
                    <a
                      href={`tel:${PHONE}`}
                      className="text-blue-700 dark:text-blue-300 underline"
                    />
                  ),
                }}
              />
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {t("consult.note")}
          </p>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default ConsultTherapyPage;
