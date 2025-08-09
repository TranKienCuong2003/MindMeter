import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const AnonymousTestModal = ({
  isOpen,
  onClose,
  onAnonymousStart,
  onLoginStart,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleAnonymousStart = async () => {
    setIsLoading(true);
    try {
      await onAnonymousStart();
    } catch (error) {
      console.error("Error creating anonymous account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginStart = () => {
    onLoginStart();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("anonymous.modal.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t("anonymous.modal.description")}
          </p>
        </div>

        <div className="space-y-4">
          {/* Anonymous Test Option */}
          <div className="border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("anonymous.modal.anonymous.title")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t("anonymous.modal.anonymous.description")}
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                  <li>• {t("anonymous.modal.anonymous.benefit1")}</li>
                  <li>• {t("anonymous.modal.anonymous.benefit2")}</li>
                  <li>• {t("anonymous.modal.anonymous.benefit3")}</li>
                </ul>
              </div>
            </div>
            <button
              onClick={handleAnonymousStart}
              disabled={isLoading}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("anonymous.modal.creating")}
                </div>
              ) : (
                t("anonymous.modal.anonymous.button")
              )}
            </button>
          </div>

          {/* Login Option */}
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("anonymous.modal.login.title")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t("anonymous.modal.login.description")}
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                  <li>• {t("anonymous.modal.login.benefit1")}</li>
                  <li>• {t("anonymous.modal.login.benefit2")}</li>
                  <li>• {t("anonymous.modal.login.benefit3")}</li>
                </ul>
              </div>
            </div>
            <button
              onClick={handleLoginStart}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {t("anonymous.modal.login.button")}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
          >
            {t("anonymous.modal.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnonymousTestModal;
