import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const AnonymousBanner = ({ onUpgradeClick }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    // Lưu vào localStorage để không hiển thị lại trong session này
    localStorage.setItem("anonymousBannerDismissed", "true");
  };

  const handleUpgrade = () => {
    onUpgradeClick();
  };

  // Kiểm tra xem banner đã được dismiss chưa
  if (
    !isVisible ||
    localStorage.getItem("anonymousBannerDismissed") === "true"
  ) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {t("anonymous.banner.title")}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  {t("anonymous.banner.description")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUpgrade}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
              >
                {t("anonymous.banner.upgrade")}
              </button>
              <button
                onClick={handleDismiss}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-xs font-medium px-2 py-1.5 rounded-md transition-colors"
              >
                {t("anonymous.banner.dismiss")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousBanner;
