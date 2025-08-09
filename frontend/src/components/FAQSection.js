import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function FAQSection() {
  const { t } = useTranslation();
  const faqs = t("faq.list", { returnObjects: true });
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-2">
        {t("faq.title")}
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-10 max-w-5xl mx-auto leading-relaxed text-base break-words tracking-normal">
        {t("faq.desc")}
      </p>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
        {/* Left: Illustration */}
        <div className="flex-1 flex justify-center items-center md:justify-start mb-8 md:mb-0 mt-8 md:mt-12">
          <img
            src="/src/assets/images/Cau_hoi_thuong_gap_2.png"
            alt={t("faq.imgAlt")}
            className="w-[500px] h-[500px] md:w-[650px] md:h-[650px] object-contain"
          />
        </div>
        {/* Right: Accordion FAQ */}
        <div className="flex-1 w-full max-w-2xl">
          {faqs.map((faq, idx) => (
            <div key={idx} className="mb-2">
              <button
                className={`w-full flex justify-between items-center rounded-xl px-6 py-4 text-left text-sm md:text-base font-semibold focus:outline-none transition-all duration-200 border-2 shadow-sm
                  ${
                    openIdx === idx
                      ? "border-blue-700 bg-white text-blue-700 dark:bg-gray-900 dark:text-white"
                      : "border-gray-200 bg-white text-gray-900 hover:border-blue-400 dark:bg-gray-900 dark:text-white"
                  }
                `}
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                <span
                  className={`font-bold ${
                    openIdx === idx
                      ? "text-blue-700 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {faq.q}
                </span>
                <span
                  className={`ml-4 transition-transform duration-200 flex items-center ${
                    openIdx === idx
                      ? "text-blue-700 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-300"
                  } ${openIdx === idx ? "rotate-180" : ""}`}
                >
                  <svg
                    width="28"
                    height="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
              {openIdx === idx && (
                <div className="bg-white dark:bg-gray-900 rounded-xl px-6 py-5 text-gray-900 dark:text-white text-sm md:text-base border-2 border-blue-100 dark:border-gray-700 shadow-lg mt-2 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
