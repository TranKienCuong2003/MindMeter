import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { authFetch } from "../authFetch";

export default function TestDetailModal({
  open,
  onClose,
  initialTest,
  adminMode,
}) {
  const { t } = useTranslation();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [error, setError] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [searchName, setSearchName] = useState("");

  // Ref cho từng item
  const itemRefs = useRef({});

  useEffect(() => {
    if (open) {
      setLoading(true);
      authFetch("/api/admin/test-results")
        .then((res) => res.json())
        .then((data) => (Array.isArray(data) ? setTests(data) : setTests([])))
        .catch(() => setTests([]))
        .finally(() => setLoading(false));
    }
  }, [open, t]);

  useEffect(() => {
    if (open && initialTest && initialTest.id) {
      setSelectedTest(initialTest);
      setLoadingAnswers(true);
      const url = adminMode
        ? `/api/admin/test-results/${initialTest.id}/answers`
        : `/api/expert/test-results/${initialTest.id}/answers`;
      authFetch(url)
        .then((res) => res.json())
        .then(setAnswers)
        .catch(() => setError(t("loadTestDetailError")))
        .finally(() => setLoadingAnswers(false));
    }
  }, [open, initialTest, t, adminMode]);

  // Scroll vào mục được chọn khi selectedTest thay đổi
  useEffect(() => {
    if (selectedTest && itemRefs.current[selectedTest.id]) {
      itemRefs.current[selectedTest.id].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedTest]);

  const handleSelectTest = (test) => {
    setSelectedTest(test);
    setLoadingAnswers(true);
    authFetch(`/api/admin/test-results/${test.id}/answers`)
      .then((res) => res.json())
      .then(setAnswers)
      .catch(() => setError(t("loadTestDetailError")))
      .finally(() => setLoadingAnswers(false));
  };

  // Hàm normalize bỏ dấu, chuyển thường, loại ký tự đặc biệt
  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9\s]/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Hàm kiểm tra fuzzy match
  function fuzzyMatch(text, search) {
    if (!search) return true;
    text = normalize(text);
    search = normalize(search);
    if (text.includes(search)) return true;
    // Fuzzy: tất cả ký tự search xuất hiện theo thứ tự trong text
    let i = 0;
    for (let c of search) {
      i = text.indexOf(c, i);
      if (i === -1) return false;
      i++;
    }
    return true;
  }

  // Hàm highlight phần khớp
  function highlightMatch(text, search) {
    if (!search) return text;
    const normText = normalize(text);
    const normSearch = normalize(search);
    const idx = normText.indexOf(normSearch);
    if (idx === -1) return text;
    // Tìm vị trí thật trong text gốc
    let realIdx = 0,
      count = 0;
    for (let i = 0; i < text.length; i++) {
      if (normalize(text[i])) {
        if (count === idx) {
          realIdx = i;
          break;
        }
        count++;
      }
    }
    return (
      <>
        {text.slice(0, realIdx)}
        <span className="bg-yellow-200 dark:bg-yellow-600 text-black dark:text-white rounded px-1">
          {text.slice(realIdx, realIdx + search.length)}
        </span>
        {text.slice(realIdx + search.length)}
      </>
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600 dark:text-blue-300">
          {t("surveyDetailTitle")}
        </h2>
        {!adminMode && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm w-full max-w-xl">
              <FunnelIcon className="w-5 h-5 text-blue-500 dark:text-blue-300 mr-1" />
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-100 whitespace-nowrap">
                {t("filterByLevel")}:
              </label>
              <select
                className="border-none outline-none rounded-full px-3 py-1 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 transition"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="ALL">{t("allLevels")}</option>
                <option value="minimal">{t("minimal")}</option>
                <option value="mild">{t("mild")}</option>
                <option value="moderate">{t("moderate")}</option>
                <option value="severe">{t("severe")}</option>
              </select>
              <input
                type="text"
                className="ml-4 border-none outline-none rounded-full px-3 py-1 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 transition w-64 max-w-full"
                placeholder={t("searchByName")}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
          </div>
        )}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Danh sách bài test */}
          {!adminMode && (
            <div className="md:w-1/3 w-full border-r dark:border-gray-700 pr-2 overflow-y-auto max-h-[60vh]">
              <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-100">
                {t("surveyList")}
              </h3>
              {Array.isArray(tests) && tests.length > 0 ? (
                <ul className="space-y-2">
                  {tests
                    .filter(
                      (test) =>
                        filterLevel === "ALL" ||
                        test.severityLevel?.toLowerCase() === filterLevel
                    )
                    .filter((test) => fuzzyMatch(test.studentName, searchName))
                    .map((test) => (
                      <li
                        key={test.id}
                        ref={(el) => (itemRefs.current[test.id] = el)}
                        className={`p-2 rounded cursor-pointer transition font-medium ${
                          selectedTest && selectedTest.id === test.id
                            ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-100"
                        }`}
                        onClick={() => handleSelectTest(test)}
                      >
                        <div>
                          {highlightMatch(test.studentName, searchName)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">
                          {t("score")}: {test.totalScore} | {t("level")}:{" "}
                          {t(test.severityLevel?.toLowerCase())}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-400">
                          {t("testedAt")}:{" "}
                          {test.testedAt?.replace("T", " ").slice(0, 16)}
                        </div>
                      </li>
                    ))}
                </ul>
              ) : loading ? null : (
                <div className="text-gray-400 text-center">
                  {t("noSurveyData")}
                </div>
              )}
            </div>
          )}
          {/* Chi tiết bài test */}
          <div className={adminMode ? "w-full" : "md:w-2/3 w-full pl-2"}>
            {selectedTest ? (
              <>
                <div className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-100">
                  {selectedTest.studentName} - {t("score")}:{" "}
                  {selectedTest.totalScore} - {t("level")}:{" "}
                  {t(selectedTest.severityLevel?.toLowerCase())}
                </div>
                <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
                  {t("testedAt")}:{" "}
                  {selectedTest.testedAt?.replace("T", " ").slice(0, 16)}
                </div>
                {loadingAnswers ? (
                  <div className="text-gray-400 dark:text-gray-300 text-base font-medium py-6 text-center">
                    {t("loading")}
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {(Array.isArray(answers) ? answers : []).map((ans, idx) => (
                      <li
                        key={ans.questionId}
                        className="p-3 rounded bg-gray-100 dark:bg-gray-800"
                      >
                        <div className="font-medium text-gray-700 dark:text-gray-100 mb-1">
                          {t("question") + " " + (idx + 1)}: {ans.questionText}
                        </div>
                        <div className="text-sm mt-2 text-gray-400 dark:text-gray-300">
                          <span className="font-semibold text-gray-500 dark:text-gray-200">
                            {t("answer")}:
                          </span>
                          <span className="text-blue-500 font-bold">
                            {t("phq9Answer_" + ans.answerValue)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="text-gray-400 text-center">
                {t("selectSurveyToView")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
