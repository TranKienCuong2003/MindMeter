import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch,
  FaTrash,
  FaEye,
  FaFileExcel,
  FaFileWord,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import TestDetailModal from "../components/TestDetailModal";
import { authFetch } from "../authFetch";

function exportToExcel(data, t) {
  const header = [
    t("emailHeader"),
    t("studentNameHeader"),
    t("testedAtHeader"),
    t("severityHeader"),
    t("scoreHeader"),
    t("diagnosisHeader"),
  ];
  const rows = data.map((r) => [
    r.email,
    r.studentName,
    r.testedAt ? new Date(r.testedAt).toLocaleString("vi-VN") : "",
    t(r.severityLevel?.toLowerCase() || ""),
    r.totalScore,
    r.diagnosis,
  ]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws["!cols"] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 22 },
    { wch: 16 },
    { wch: 10 },
    { wch: 30 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SurveyResults");
  XLSX.writeFile(wb, "survey_results.xlsx");
}

function exportToWord(data, t) {
  let html = `<table border='1' cellpadding='5' style='border-collapse:collapse;'>`;
  html += `<tr>`;
  html += `<th>${t("emailHeader")}</th>`;
  html += `<th>${t("studentNameHeader")}</th>`;
  html += `<th>${t("testedAtHeader")}</th>`;
  html += `<th>${t("severityHeader")}</th>`;
  html += `<th>${t("scoreHeader")}</th>`;
  html += `<th>${t("diagnosisHeader")}</th>`;
  html += `</tr>`;
  data.forEach((r) => {
    html += `<tr>`;
    html += `<td>${r.email || ""}</td>`;
    html += `<td>${r.studentName || ""}</td>`;
    html += `<td>${
      r.testedAt ? new Date(r.testedAt).toLocaleString("vi-VN") : ""
    }</td>`;
    html += `<td>${t(r.severityLevel?.toLowerCase() || "")}</td>`;
    html += `<td>${r.totalScore || ""}</td>`;
    html += `<td>${r.diagnosis || ""}</td>`;
    html += `</tr>`;
  });
  html += `</table>`;
  const blob = new Blob(
    [`<html><head><meta charset='utf-8'></head><body>${html}</body></html>`],
    { type: "application/msword" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "survey_results.doc";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

function getPagination(current, total) {
  const delta = 1; // số trang lân cận
  const range = [];
  for (
    let i = Math.max(0, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }
  if (range[0] > 1) range.unshift("...");
  if (range[0] !== 0) range.unshift(0);
  if (range[range.length - 1] < total - 2) range.push("...");
  if (range[range.length - 1] !== total - 1) range.push(total - 1);
  return range;
}

function Pagination({ currentPage, totalPages, setCurrentPage }) {
  if (totalPages <= 1) return null;
  const pages = getPagination(currentPage, totalPages);
  return (
    <div className="flex gap-2 justify-center mt-8">
      {/* Nút prev */}
      <button
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow transition
          ${
            currentPage === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
              : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-400 dark:bg-gray-800 dark:text-blue-300 dark:border-gray-600"
          }
        `}
        onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
        disabled={currentPage === 0}
        aria-label="Trang trước"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 15l-5-5 5-5" />
        </svg>
      </button>
      {/* Số trang với dấu ... */}
      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={idx}
            className="w-10 h-10 flex items-center justify-center text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={idx}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow transition
              ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-900 border border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              }
            `}
            onClick={() => setCurrentPage(page)}
          >
            {page + 1}
          </button>
        )
      )}
      {/* Nút next */}
      <button
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow transition
          ${
            currentPage === totalPages - 1 || totalPages === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
              : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-400 dark:bg-gray-800 dark:text-blue-300 dark:border-gray-600"
          }
        `}
        onClick={() =>
          currentPage < totalPages - 1 && setCurrentPage(currentPage + 1)
        }
        disabled={currentPage === totalPages - 1 || totalPages === 0}
        aria-label="Trang sau"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 5l5 5-5 5" />
        </svg>
      </button>
    </div>
  );
}

const SEVERITY_OPTIONS = [
  { value: "ALL", labelKey: "allLevels" },
  { value: "SEVERE", labelKey: "severe" },
  { value: "MODERATE", labelKey: "moderate" },
  { value: "MILD", labelKey: "mild" },
  { value: "MINIMAL", labelKey: "minimal" },
];

export default function AdminTestResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [viewTest, setViewTest] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    document.title = t("testList") + " | MindMeter";
    const fetchResults = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await authFetch("/api/admin/test-results");
        if (!res.ok) throw new Error(t("loadTestListError"));
        const data = await res.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [t]);

  useEffect(() => {
    setCurrentPage(0);
  }, [search, filterSeverity]);

  useEffect(() => {
    // Đọc query param 'severity' để focus filter nếu có
    const params = new URLSearchParams(location.search);
    const severity = params.get("severity");
    if (["SEVERE", "MODERATE", "MILD", "MINIMAL", "ALL"].includes(severity)) {
      setFilterSeverity(severity);
    }
  }, [location.search]);

  const filteredResults = results.filter((r) => {
    const s = search.toLowerCase();
    const matchText =
      (r.email && r.email.toLowerCase().includes(s)) ||
      (r.studentName && r.studentName.toLowerCase().includes(s)) ||
      (r.diagnosis && r.diagnosis.toLowerCase().includes(s));
    const matchSeverity =
      filterSeverity === "ALL" || r.severityLevel === filterSeverity;
    return matchText && matchSeverity;
  });

  const paginatedResults = filteredResults.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  const totalPages = Math.ceil(filteredResults.length / pageSize);

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDeleteTest"))) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await authFetch(`/api/admin/test-results/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(t("deleteTestError"));
      setResults((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 w-full dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-300 text-center">
        {t("testList")}
      </h1>
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <button
          className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow transition min-w-[140px] h-[48px] dark:bg-red-700 dark:hover:bg-red-800"
          onClick={() => navigate("/admin/dashboard")}
        >
          <svg
            className="text-lg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 19L8 12L15 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("back")}
        </button>
        {/* Center search, right-align export buttons */}
        <div className="flex-1 flex items-center justify-center min-w-[220px]">
          <input
            type="text"
            className="w-full max-w-xl px-6 py-3 rounded-full shadow border outline-none focus:ring-2 focus:ring-blue-400 text-base dark:bg-gray-800 dark:text-white dark:border-gray-700"
            placeholder={t("searchTest")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 justify-end">
          <button
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition min-w-[140px] h-[48px] dark:bg-green-700 dark:hover:bg-green-800"
            onClick={() => exportToExcel(filteredResults, t)}
          >
            <FaFileExcel className="text-lg" />
            {t("exportExcel")}
          </button>
          <button
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition min-w-[140px] h-[48px] dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={() => exportToWord(filteredResults, t)}
          >
            <FaFileWord className="text-lg" />
            {t("exportToWord")}
          </button>
        </div>
      </div>
      {/* Filter mức độ nằm dưới, căn trái */}
      <div className="flex gap-4 mb-6 justify-start flex-wrap">
        {SEVERITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`px-6 py-2 rounded-full font-bold text-base shadow transition-all border-2 border-transparent
              ${
                filterSeverity === opt.value
                  ? opt.value === "SEVERE"
                    ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-white"
                    : opt.value === "MODERATE"
                    ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-white"
                    : opt.value === "MILD"
                    ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-white"
                    : opt.value === "MINIMAL"
                    ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-white"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white"
              }`}
            onClick={() => setFilterSeverity(opt.value)}
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center font-semibold text-lg">
          {error}
        </div>
      )}
      <div className="flex justify-center w-full">
        <div className="max-w-7xl w-full mx-auto rounded-2xl shadow-lg border border-blue-200 bg-white overflow-hidden">
          <div className="overflow-x-auto w-full">
            {loading ? (
              <div className="text-center py-10 text-gray-500 text-lg">
                {t("loading")}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-lg">
                {t("noSurveyData")}
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl">
                  <thead className="bg-blue-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-4 text-left text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                        {t("emailHeader")}
                      </th>
                      <th className="px-4 py-4 text-left text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                        {t("studentNameHeader")}
                      </th>
                      <th className="px-4 py-4 text-center text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                        {t("testedAtHeader")}
                      </th>
                      <th className="px-4 py-4 text-center text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                        {t("severityHeader")}
                      </th>
                      <th className="px-4 py-4 text-center text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                        {t("scoreHeader")}
                      </th>
                      <th className="px-4 py-4 text-center text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                        {t("diagnosisHeader")}
                      </th>
                      <th className="px-4 py-4 text-center text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                        {t("actionHeader")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {paginatedResults.map((r) => (
                      <tr
                        key={r.id}
                        className="bg-white even:bg-blue-50 dark:bg-gray-800 dark:even:bg-gray-900 align-middle hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm align-middle break-words max-w-[180px] truncate whitespace-nowrap overflow-hidden dark:text-white">
                          {r.email}
                        </td>
                        <td className="px-4 py-4 text-sm align-middle max-w-[120px] truncate whitespace-nowrap overflow-hidden dark:text-white">
                          {r.studentName}
                        </td>
                        <td className="px-4 py-4 text-center align-middle max-w-[120px] truncate whitespace-nowrap overflow-hidden dark:text-white">
                          {r.testedAt
                            ? new Date(r.testedAt).toLocaleString(
                                i18n.language === "vi" ? "vi-VN" : "en-US"
                              )
                            : ""}
                        </td>
                        <td className="px-4 py-4 text-center align-middle max-w-[140px] overflow-hidden dark:text-white">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-bold shadow-sm border whitespace-normal break-words w-full
                              ${
                                r.severityLevel === "SEVERE"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : r.severityLevel === "MILD"
                                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                  : r.severityLevel === "MINIMAL"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-blue-100 text-blue-700 border-blue-200"
                              }
                            `}
                          >
                            {t(r.severityLevel?.toLowerCase() || "")}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center align-middle max-w-[60px] truncate whitespace-nowrap overflow-hidden dark:text-white">
                          {r.totalScore}
                        </td>
                        <td className="px-4 py-4 text-center align-middle max-w-[180px] truncate whitespace-nowrap overflow-hidden dark:text-white">
                          {r.diagnosis}
                        </td>
                        <td className="px-4 py-4 text-center align-middle">
                          <div className="flex gap-2 justify-center items-center h-full">
                            <button
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-full flex items-center gap-2 font-bold shadow-sm transition-all text-base"
                              title={t("viewDetails")}
                              onClick={() => setViewTest(r)}
                            >
                              <FaEye />
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-full flex items-center gap-2 font-bold shadow-sm transition-all text-base disabled:opacity-60"
                              title={t("delete")}
                              onClick={() => handleDelete(r.id)}
                              disabled={deletingId === r.id}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Move Pagination outside the table container */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
      <TestDetailModal
        open={!!viewTest}
        onClose={() => setViewTest(null)}
        initialTest={viewTest}
        adminMode={true}
      />
    </div>
  );
}
