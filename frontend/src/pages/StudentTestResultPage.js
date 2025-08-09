import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaCheckCircle } from "react-icons/fa";
import { isAnonymousUser, getCurrentUser } from "../services/anonymousService";
import AnonymousBanner from "../components/AnonymousBanner";
import UpgradeAnonymousModal from "../components/UpgradeAnonymousModal";
import {
  upgradeAnonymousAccount,
  clearAnonymousData,
} from "../services/anonymousService";

const severityColors = {
  MINIMAL:
    "text-green-600 border-green-400 bg-green-50 dark:text-green-300 dark:border-green-500 dark:bg-green-900",
  MILD: "text-yellow-600 border-yellow-400 bg-yellow-50 dark:text-yellow-200 dark:border-yellow-500 dark:bg-yellow-900",
  MODERATE:
    "text-orange-600 border-orange-400 bg-orange-50 dark:text-orange-300 dark:border-orange-500 dark:bg-orange-900",
  SEVERE:
    "text-red-600 border-red-400 bg-red-50 dark:text-red-300 dark:border-red-500 dark:bg-red-900",
};

// Sử dụng i18n cho mức độ

const StudentTestResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const result = location.state?.result;
  const testType = location.state?.testType;
  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

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

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-900">
        <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl dark:shadow-none p-10 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {t("studentTestResultPage.notFound")}
          </h2>
          <button
            onClick={() => navigate("/student/test-history")}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition"
          >
            {t("studentTestResultPage.viewHistory")}
          </button>
        </div>
      </div>
    );
  }

  const severity = result.severityLevel || result.severity || "";
  const severityClass =
    severityColors[severity] || "text-gray-700 border-gray-300 bg-gray-50";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-900 py-8 px-2">
      {/* Anonymous Banner - chỉ hiển thị cho user ẩn danh */}
      {isAnonymousUser(currentUser) && (
        <AnonymousBanner onUpgradeClick={handleUpgradeClick} />
      )}

      <div className="bg-white dark:bg-gray-800 shadow-2xl dark:shadow-none rounded-3xl p-10 w-full max-w-lg flex flex-col items-center animate-fade-in">
        <FaCheckCircle className="text-5xl text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          {t("studentTestResultPage.resultTitle")}
        </h1>
        <div className="w-full space-y-3 text-lg">
          <div>
            <span className="font-semibold dark:text-gray-100">
              {t("studentTestResultPage.testType")}
            </span>{" "}
            <span className="text-blue-600 font-medium dark:text-blue-400">
              {testType || "-"}
            </span>
          </div>
          <div>
            <span className="font-semibold dark:text-gray-100">
              {t("studentTestResultPage.diagnosis")}
            </span>{" "}
            <span className="font-medium dark:text-gray-200">
              {result.diagnosis}
            </span>
          </div>
          <div>
            <span className="font-semibold dark:text-gray-100">
              {t("studentTestResultPage.score")}
            </span>{" "}
            <span className="font-medium dark:text-gray-200">
              {result.totalScore}
            </span>
          </div>
          <div>
            <span className="font-semibold dark:text-gray-100">
              {t("studentTestResultPage.severity")}
            </span>{" "}
            <span
              className={`font-bold border rounded px-2 py-1 ml-1 ${severityClass}`}
            >
              {t(`studentTestResultPage.severityVi.${severity}`) || severity}
            </span>
          </div>
          <div>
            <span className="font-semibold dark:text-gray-100">
              {t("studentTestResultPage.recommendation")}
            </span>
            <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 dark:border-blue-500 p-3 mt-1 rounded text-base dark:text-gray-100">
              {result.recommendation}
            </div>
          </div>
          <div>
            <span className="font-semibold dark:text-gray-100">
              {t("studentTestResultPage.testedAt")}
            </span>{" "}
            <span className="text-gray-500 dark:text-gray-400">
              {result.testedAt
                ? new Date(result.testedAt).toLocaleString()
                : "-"}
            </span>
          </div>
        </div>
        <div className="flex gap-4 mt-8 w-full flex-col sm:flex-row">
          {currentUser && !isAnonymousUser(currentUser) && (
            <button
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold shadow hover:scale-105 transition"
              onClick={() => navigate("/student/test-history")}
            >
              {t("studentTestResultPage.viewHistory")}
            </button>
          )}
          <button
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            onClick={() => navigate("/")}
          >
            {t("studentTestResultPage.backHome")}
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeAnonymousModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgrade={handleUpgradeAccount}
        userId={currentUser?.id}
      />
    </div>
  );
};

export default StudentTestResultPage;
