import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import TestDetailModal from "../components/TestDetailModal";
import SendAdviceModal from "../components/SendAdviceModal";
import { authFetch } from "../authFetch";
import DashboardHeader from "../components/DashboardHeader";
import FooterSection from "../components/FooterSection";
import { FaUserGraduate } from "react-icons/fa";
import { ThemeContext } from "../App";
import { jwtDecode } from "jwt-decode";

const PAGE_SIZE = 5;
const severityOptions = [
  { value: "ALL", labelKey: "all" },
  { value: "MINIMAL", labelKey: "minimal" },
  { value: "MILD", labelKey: "mild" },
  { value: "MODERATE", labelKey: "moderate" },
  { value: "SEVERE", labelKey: "severe" },
];

const getSeverityColor = (severityLevel) => {
  switch (severityLevel) {
    case "SEVERE":
      return "bg-red-100 text-red-800";
    case "MODERATE":
      return "bg-yellow-100 text-yellow-800";
    case "MILD":
      return "bg-blue-100 text-blue-800";
    case "MINIMAL":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getSeverityLabel = (severityLevel, t) => {
  switch (severityLevel) {
    case "SEVERE":
      return t("severe");
    case "MODERATE":
      return t("moderate");
    case "MILD":
      return t("mild");
    case "MINIMAL":
      return t("minimal");
    default:
      return severityLevel;
  }
};

function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function getPagination(current, total) {
  const delta = 1; // số trang lân cận
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 0; i < total; i++) {
    if (
      i === 0 ||
      i === total - 1 ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l !== undefined) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

export default function ExpertStudentsPage({ handleLogout: propHandleLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [openAdviceModal, setOpenAdviceModal] = useState(false);
  const [adviceStudent, setAdviceStudent] = useState(null);
  const [adviceTestId, setAdviceTestId] = useState(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialFilter = (params.get("filter") || "ALL").toUpperCase();
  const [filter, setFilter] = useState(initialFilter);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await authFetch("/api/admin/test-results");
        if (!res.ok) throw new Error(t("fetchStudentError"));
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [t]);

  useEffect(() => {
    document.title = t("studentTestListTitle");
  }, [t]);

  useEffect(() => {
    setFilterSeverity(filter);
  }, [filter]);

  // Lọc và tìm kiếm nâng cao
  const filtered = students.filter((test) => {
    if (filterSeverity !== "ALL" && test.severityLevel !== filterSeverity)
      return false;
    if (search) {
      const s = removeVietnameseTones(search.toLowerCase());
      const fullName = removeVietnameseTones(
        `${test.studentName || ""} ${test.email || ""}`.toLowerCase()
      );
      const diagnosis = removeVietnameseTones(
        (test.diagnosis || "").toLowerCase()
      );
      if (!fullName.includes(s) && !diagnosis.includes(s)) return false;
    }
    return true;
  });

  // Phân trang
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [filterSeverity, search]);

  const handleLogout =
    propHandleLogout ||
    (() => {
      localStorage.removeItem("token");
      navigate("/login");
    });

  const handleExportExcel = () => {
    const dataToExport = filtered.map((test) => [
      test.studentName,
      test.email,
      test.totalScore,
      test.diagnosis,
      getSeverityLabel(test.severityLevel, t),
      test.testedAt ? new Date(test.testedAt).toLocaleDateString("vi-VN") : "",
    ]);
    const header = [
      "Học sinh/Sinh viên",
      t("emailHeader"),
      t("scoreHeader"),
      t("diagnosisHeader"),
      t("severityHeader"),
      "Ngày khảo sát",
    ];
    const ws = XLSX.utils.aoa_to_sheet([header, ...dataToExport]);
    ws["!cols"] = [
      { wch: 22 },
      { wch: 30 },
      { wch: 10 },
      { wch: 20 },
      { wch: 14 },
      { wch: 16 },
    ];
    ws["!freeze"] = { xSplit: 0, ySplit: 1 };
    ws["!autofilter"] = {
      ref: XLSX.utils.encode_range({
        s: { c: 0, r: 0 },
        e: { c: header.length - 1, r: filtered.length },
      }),
    };
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HocSinhSinhVienKhaoSat");
    XLSX.writeFile(wb, "Danh_sach_hoc_sinh_sinh_vien_khao_sat.xlsx");
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    navigate(`/expert/students?filter=${newFilter}`);
  };

  // Pagination component giống UserManagementPage
  const Pagination = () => {
    if (totalPages <= 1) return null;
    const pages = getPagination(currentPage, totalPages);
    return (
      <div className="flex gap-2 justify-center mt-8">
        {/* Nút prev */}
        <button
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow transition
            ${
              currentPage === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-400 dark:bg-gray-800 dark:text-blue-400 dark:border-gray-700 dark:hover:bg-gray-700"
            }
          `}
          onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
          aria-label={t("prevPage")}
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
                    ? "bg-blue-600 text-white dark:bg-blue-400 dark:text-gray-900"
                    : "bg-gray-200 text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
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
                ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-400 dark:bg-gray-800 dark:text-blue-400 dark:border-gray-700 dark:hover:bg-gray-700"
            }
          `}
          onClick={() =>
            currentPage < totalPages - 1 && setCurrentPage(currentPage + 1)
          }
          disabled={currentPage === totalPages - 1 || totalPages === 0}
          aria-label={t("nextPage")}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 5l5 5-5 5" />
          </svg>
        </button>
      </div>
    );
  };

  const { theme, setTheme } = React.useContext(ThemeContext);

  if (loading)
    return <div className="p-8 text-center">{t("loadingStudentList")}</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  // Lấy user từ token giống các trang khác
  let user = { name: "", avatar: null, email: "", role: "" };
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      user.name = (
        (decoded.firstName || "") +
        (decoded.lastName ? " " + decoded.lastName : "")
      ).trim();
      user.email = decoded.sub || decoded.email || "";
      if (!user.name) user.name = user.email || "Expert";
      if (decoded.avatar) user.avatar = decoded.avatar;
      if (decoded.role) user.role = decoded.role;
    } catch {}
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-blue-100 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <DashboardHeader
        logoIcon={
          <FaUserGraduate className="text-indigo-500 dark:text-indigo-300 text-3xl" />
        }
        logoText={
          <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 dark:from-indigo-300 dark:via-blue-300 dark:to-purple-400 bg-clip-text text-transparent tracking-wide">
            {t("studentTestListTitle") ||
              "Danh sách học sinh/sinh viên đã khảo sát"}
          </span>
        }
        user={user}
        theme={theme}
        setTheme={setTheme}
        onProfile={() => navigate("/expert/profile")}
        onLogout={handleLogout}
      />
      <div className="flex-grow flex flex-col py-10 overflow-x-hidden">
        <h1 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-200 text-center">
          {t("studentTestListTitle")}
        </h1>
        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <button
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow transition min-w-[140px] h-[48px]"
            onClick={() => navigate("/expert/dashboard")}
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
          <div className="flex-1 flex items-center justify-center min-w-[220px]">
            <input
              type="text"
              className="w-full max-w-xl px-6 py-3 rounded-full shadow border outline-none focus:ring-2 focus:ring-blue-400 text-base bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
              placeholder={t("searchStudentTest")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition min-w-[140px] h-[48px]"
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
                d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="12 2 12 12 16 8 12 12 8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("exportExcel")}
          </button>
        </div>
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div className="flex gap-4 mb-6">
            {severityOptions.map((r) => (
              <button
                key={r.value}
                className={`px-6 py-2 rounded-full font-bold text-base shadow transition-all border-2 border-transparent
                  ${
                    filterSeverity === r.value
                      ? r.value === "ALL"
                        ? "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : r.value === "SEVERE"
                        ? "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : r.value === "MODERATE"
                        ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : r.value === "MILD"
                        ? "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  }
                `}
                onClick={() => handleFilterChange(r.value)}
              >
                {t(r.labelKey)}
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                  {r.value === "ALL"
                    ? students.length
                    : students.filter((s) => s.severityLevel === r.value)
                        .length}
                </span>
              </button>
            ))}
          </div>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-center font-semibold text-lg">
            {error}
          </div>
        )}
        <div className="flex justify-center w-full">
          <div className="max-w-7xl w-full mx-auto rounded-2xl shadow-lg border border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="overflow-x-auto w-full">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-lg">
                  {t("noStudentTestFound")}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                  <colgroup>
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "20%" }} />
                  </colgroup>
                  <thead className="bg-blue-50 dark:bg-blue-900">
                    <tr>
                      <th className="px-4 py-4 text-left text-base font-extrabold text-blue-800 dark:text-blue-200 uppercase tracking-wider border-b-2 border-blue-200 dark:border-blue-700">
                        {t("studentNameSurveyHeader")}
                      </th>
                      <th className="px-4 py-4 text-left text-base font-extrabold text-blue-800 dark:text-blue-200 uppercase tracking-wider border-b-2 border-blue-200 dark:border-blue-700">
                        {t("emailHeader")}
                      </th>
                      <th className="px-4 py-4 text-center text-base font-extrabold text-blue-800 dark:text-blue-200 uppercase tracking-wider border-b-2 border-blue-200 dark:border-blue-700">
                        {t("scoreHeader")}
                      </th>
                      <th className="px-4 py-4 text-center text-base font-extrabold text-blue-800 dark:text-blue-200 uppercase tracking-wider border-b-2 border-blue-200 dark:border-blue-700">
                        {t("diagnosisHeader")}
                      </th>
                      <th className="px-4 py-4 text-center text-base font-extrabold text-blue-800 dark:text-blue-200 uppercase tracking-wider border-b-2 border-blue-200 dark:border-blue-700">
                        {t("severityHeader")}
                      </th>
                      <th className="px-4 py-4 text-center text-base font-extrabold text-blue-800 dark:text-blue-200 uppercase tracking-wider border-b-2 border-blue-200 dark:border-blue-700">
                        {t("surveyedAtHeader")}
                      </th>
                      <th className="px-4 py-4 text-center text-base font-extrabold text-blue-800 dark:text-blue-200 uppercase tracking-wider border-b-2 border-blue-200 dark:border-blue-700">
                        {t("actionHeader")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginated.map((test) => (
                      <tr key={test.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {test.studentName}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {test.email}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                          {test.totalScore}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                          {test.diagnosis}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              test.severityLevel === "SEVERE"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : test.severityLevel === "MODERATE"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : test.severityLevel === "MILD"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : test.severityLevel === "MINIMAL"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {getSeverityLabel(test.severityLevel, t)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                          {test.testedAt
                            ? new Date(test.testedAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : ""}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-400 mr-3"
                            onClick={() => {
                              setSelectedTest(test);
                              setOpenModal(true);
                            }}
                          >
                            {t("viewDetails")}
                          </button>
                          <button
                            className="text-green-600 dark:text-green-300 hover:text-green-900 dark:hover:text-green-400"
                            onClick={() => {
                              console.log("test object:", test);
                              setAdviceStudent({
                                id: test.userId, // Sử dụng trực tiếp userId từ backend
                                name: test.studentName,
                                email: test.email,
                                totalScore: test.totalScore,
                                severityLevel: test.severityLevel,
                                diagnosis: test.diagnosis,
                              });
                              setAdviceTestId(test.id);
                              setOpenAdviceModal(true);
                            }}
                          >
                            {t("sendAdvice")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        {/* Phân trang */}
        <Pagination />
        {/* Modal chi tiết bài khảo sát dùng chung với admin */}
        <TestDetailModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          initialTest={selectedTest}
        />
        <SendAdviceModal
          open={openAdviceModal}
          onClose={() => setOpenAdviceModal(false)}
          student={adviceStudent}
          testResultId={adviceTestId}
        />
      </div>
      <FooterSection />
    </div>
  );
}
