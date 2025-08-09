import React, { useState, useEffect, useState as useReactState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authFetch } from "../authFetch";
import {
  getCurrentToken,
  isUsingAnonymousAccount,
} from "../services/anonymousService";

const testTitleKeys = {
  "DASS-21": "studentTestPage.titleDASS21",
  "DASS-42": "studentTestPage.titleDASS42",
  RADS: "studentTestPage.titleRADS",
  BDI: "studentTestPage.titleBDI",
  EPDS: "studentTestPage.titleEPDS",
  SAS: "studentTestPage.titleSAS",
};

const StudentTestPage = () => {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  // Lấy theme từ localStorage (giống các trang khác)
  const [theme, setTheme] = useReactState(
    localStorage.getItem("theme") || "light"
  );
  useEffect(() => {
    const onStorage = () => setTheme(localStorage.getItem("theme") || "light");
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Lấy test type từ URL
  const searchParams = new URLSearchParams(location.search);
  const testType = searchParams.get("type");

  useEffect(() => {
    const token = getCurrentToken();
    if (!token) {
      navigate("/home"); // Chuyển về trang home để chọn test ẩn danh hoặc đăng nhập
      return;
    }
    const fetchQuestions = async () => {
      try {
        let url = "/api/depression-test/questions";
        if (testType) {
          url += `?type=${encodeURIComponent(testType)}`;
        }
        const res = await authFetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Lỗi lấy câu hỏi");
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [navigate, testType]);

  useEffect(() => {
    document.title = t("studentTestPage.pageTitle") + " | MindMeter";
  }, [t]);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert("Vui lòng trả lời tất cả câu hỏi!");
      return;
    }

    setSubmitting(true);
    try {
      const token = getCurrentToken();
      const res = await authFetch("/api/depression-test/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, value]) => ({
            questionId: parseInt(questionId),
            answerValue: value,
          })),
          testType, // gửi thêm testType
        }),
      });

      if (!res.ok) throw new Error("Lỗi gửi kết quả");
      const result = await res.json();

      // Hiển thị kết quả
      navigate("/student/test-result", {
        state: {
          result,
          testType,
        },
      });

      // Reset form
      setAnswers({});
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    // Xóa dữ liệu anonymous nếu có
    if (isUsingAnonymousAccount()) {
      localStorage.removeItem("anonymousUser");
      localStorage.removeItem("anonymousToken");
    }
    navigate("/home");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="text-xl font-semibold">
          {t("studentTestPage.loading")}
        </div>
      </div>
    );
  if (error)
    return <div className="p-8 text-red-500">{t("studentTestPage.error")}</div>;

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isAnswered = answers[currentQuestion?.id] !== undefined;

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex justify-center items-start">
      <div className="max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          {t(testTitleKeys[testType] || "studentTestPage.titleDefault")}
        </h1>
        {/* Thanh tiến trình */}
        <div className="mb-6">
          <div className="flex justify-between mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{t("studentTestPage.progress")}</span>
            <span>
              {answeredCount} / {totalQuestions}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
        {/* Hiển thị câu hỏi hiện tại */}
        {currentQuestion && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-none p-8 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold mb-6 text-center">
              <span className="text-gray-900 dark:text-white">
                {currentQuestion.questionText}
              </span>
            </div>
            <div className="space-y-4">
              {currentQuestion.options &&
                currentQuestion.options.length > 0 &&
                currentQuestion.options.map((opt) => {
                  const checked =
                    answers[currentQuestion.id] === opt.optionValue;
                  return (
                    <label
                      key={opt.id}
                      className={`block rounded-full px-4 py-3 cursor-pointer border transition mb-2 ${
                        checked
                          ? "bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-400"
                          : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={opt.optionValue}
                        checked={checked}
                        onChange={() =>
                          handleAnswer(currentQuestion.id, opt.optionValue)
                        }
                        className="hidden"
                      />
                      <span className="text-base text-gray-900 dark:text-gray-100">
                        {opt.optionText}
                      </span>
                    </label>
                  );
                })}
            </div>
          </div>
        )}
        {/* Nút điều hướng */}
        <div className="flex flex-wrap items-center mt-8 gap-4 justify-between">
          <div className="flex gap-4">
            <button
              onClick={handleBackToHome}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 text-white px-4 py-2 border border-red-600 rounded-full flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t("studentTestPage.back")}
            </button>
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="bg-yellow-300 dark:bg-yellow-600 text-gray-900 dark:text-gray-100 px-6 py-2 border border-yellow-500 rounded-full font-semibold disabled:opacity-50"
            >
              {t("studentTestPage.prev")}
            </button>
          </div>
          <div>
            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() =>
                  setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
                }
                className={`px-6 py-2 rounded font-semibold transition-colors ${
                  isAnswered
                    ? "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
                } border border-blue-600 rounded-full`}
                disabled={!isAnswered}
              >
                {t("studentTestPage.next")}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || answeredCount !== totalQuestions}
                className="bg-green-600 dark:bg-green-700 text-white px-8 py-2 border border-green-600 rounded-full font-semibold disabled:opacity-50"
              >
                {submitting
                  ? t("studentTestPage.submitting")
                  : t("studentTestPage.finish")}
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("studentTestPage.answered", {
            answered: answeredCount,
            total: totalQuestions,
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentTestPage;
