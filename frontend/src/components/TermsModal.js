import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function TermsModal({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fade-in border border-green-200 dark:border-green-700">
        <h2 className="text-3xl font-bold mb-6 text-green-700 dark:text-green-400 text-center tracking-wide">
          {t("terms.title")}
        </h2>
        <div className="max-h-96 overflow-y-auto text-gray-700 dark:text-gray-200 text-base leading-relaxed pr-2 custom-scrollbar">
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {t("terms.introTitle")}
              </span>
              <p className="mt-1">{t("terms.intro")}</p>
            </li>
            <li>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {t("terms.userRightsTitle")}
              </span>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>{t("terms.userRights.0")}</li>
                <li>{t("terms.userRights.1")}</li>
                <li>{t("terms.userRights.2")}</li>
                <li>{t("terms.userRights.3")}</li>
                <li>{t("terms.userRights.4")}</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {t("terms.platformRightsTitle")}
              </span>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>{t("terms.platformRights.0")}</li>
                <li>{t("terms.platformRights.1")}</li>
                <li>{t("terms.platformRights.2")}</li>
                <li>{t("terms.platformRights.3")}</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {t("terms.privacyTitle")}
              </span>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>{t("terms.privacy.0")}</li>
                <li>{t("terms.privacy.1")}</li>
                <li>{t("terms.privacy.2")}</li>
                <li>
                  {t("terms.privacy.3")}{" "}
                  <button
                    type="button"
                    className="underline text-green-600 dark:text-green-400 cursor-pointer ml-1 hover:text-green-800 dark:hover:text-green-300 bg-transparent border-none p-0 outline-none"
                    onClick={() => {
                      onClose && onClose();
                      navigate("/privacy-policy");
                    }}
                  >
                    {t("terms.privacyPolicy")}
                  </button>
                  .
                </li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {t("terms.responsibilityTitle")}
              </span>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>{t("terms.responsibility.0")}</li>
                <li>{t("terms.responsibility.1")}</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {t("terms.intellectualTitle")}
              </span>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>{t("terms.intellectual.0")}</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {t("terms.changesTitle")}
              </span>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>{t("terms.changes.0")}</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {t("terms.contactTitle")}
              </span>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>{t("terms.contact.0")}</li>
                <li>{t("terms.contact.1")}</li>
                <li>{t("terms.contact.2")}</li>
              </ul>
            </li>
          </ol>
        </div>
        <button
          className="mt-8 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition"
          onClick={onClose}
        >
          {t("understand")}
        </button>
      </div>
    </div>
  );
}
