import React from "react";
import { useTranslation, Trans } from "react-i18next";

const tests = [
  {
    key: "DASS-21",
    img: "/src/assets/images/Bai_1.jpg",
    questions: 21,
  },
  {
    key: "DASS-42",
    img: "/src/assets/images/Bai_2.jpg",
    questions: 42,
  },
  {
    key: "RADS",
    img: "/src/assets/images/Bai_3.jpg",
    questions: 30,
  },
  {
    key: "BDI",
    img: "/src/assets/images/Bai_4.jpg",
    questions: 21,
  },
  {
    key: "EPDS",
    img: "/src/assets/images/Bai_5.jpg",
    questions: 10,
  },
  {
    key: "SAS",
    img: "/src/assets/images/Bai_6.jpg",
    questions: 20,
  },
];

export default function TestListSection({ onTakeTest }) {
  const { t } = useTranslation();
  return (
    <section id="test-list-section" className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-left">
        {t("testListSection.title")}
      </h2>
      <p className="text-gray-700 dark:text-gray-200 mb-10 text-left max-w-6xl mx-auto leading-relaxed text-base">
        <Trans i18nKey="testListSection.description" components={[<b />]} />
        <br />
        <strong>
          <Trans i18nKey="testListSection.noteTitle" />
        </strong>{" "}
        <Trans i18nKey="testListSection.note" />
      </p>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-6xl">
          {tests.map((test, idx) => (
            <div
              key={test.key}
              className="flex flex-col md:flex-row bg-white/5 rounded-2xl shadow-lg mb-10 overflow-hidden min-h-[280px] border-t-4 border-gray-200 dark:border-gray-700"
              style={{}}
            >
              {/* Image: always on top for mobile, left for desktop */}
              <div className="flex items-center justify-center w-full md:w-1/3 bg-transparent p-8 pt-6 md:pt-8">
                <img
                  src={test.img}
                  alt={test.name}
                  className="w-full h-[180px] md:h-[280px] object-contain"
                  style={{ maxHeight: 280 }}
                />
              </div>
              {/* Content: below image for mobile, right for desktop */}
              <div className="flex flex-col justify-between w-full md:w-2/3 p-6 md:p-8">
                <div>
                  <span className="inline-block mb-2 px-3 py-1 bg-blue-900/80 text-blue-200 text-xs font-semibold rounded-full">
                    {t(`testListSection.tests.${test.key}.label`)}
                  </span>
                  <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {t(`testListSection.tests.${test.key}.name`)}
                  </h2>
                  {/* Hide description on mobile, show on md+ */}
                  <p className="mb-4 text-gray-700 dark:text-gray-200 text-base font-medium hidden md:block">
                    {t(`testListSection.tests.${test.key}.description`)}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-4">
                  <ul className="flex-1 text-gray-700 dark:text-gray-200 text-sm mb-0 list-disc list-inside space-y-2 text-left">
                    <li>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {t("testListSection.questionCount")}
                      </span>{" "}
                      {test.questions} {t("testListSection.questionUnit")}
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {t("testListSection.target")}
                      </span>{" "}
                      {t(`testListSection.tests.${test.key}.target`)}
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {t("testListSection.purpose")}
                      </span>{" "}
                      {t(`testListSection.tests.${test.key}.purpose`)}
                    </li>
                  </ul>
                  <button
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow transition mt-4 sm:mt-0 sm:ml-8 self-center md:self-start"
                    onClick={() => onTakeTest(test.key)}
                  >
                    {t("testListSection.takeTest")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
