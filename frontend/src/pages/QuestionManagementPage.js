import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileExcel, FaEdit, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import { ThemeContext } from "../App";
import { useTranslation } from "react-i18next";
import { authFetch } from "../authFetch";
import Select from "react-select";
import DashboardHeader from "../components/DashboardHeader";
import FooterSection from "../components/FooterSection";
import { FaQuestionCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

export default function QuestionManagementPage({
  handleLogout: propHandleLogout,
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [modalQuestion, setModalQuestion] = useState({
    id: null,
    questionText: "",
    weight: 1,
    isActive: true,
    category: "MOOD",
    order: 1,
    options: [
      { optionText: "", optionValue: 0, order: 1 },
      { optionText: "", optionValue: 1, order: 2 },
    ],
  });
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;
  const navigate = useNavigate();
  const { theme, setTheme } = React.useContext(ThemeContext);
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Lấy user từ token giống AdminDashboardPage
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
      if (!user.name) user.name = user.email || "Admin";
      if (decoded.avatar) user.avatar = decoded.avatar;
      if (decoded.role) user.role = decoded.role;
    } catch {}
  }

  // Lấy danh sách câu hỏi
  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await authFetch("/api/admin/questions");
      if (!res.ok) throw new Error("Không thể lấy danh sách câu hỏi");
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách category động từ backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await authFetch("/api/admin/questions/categories");
        if (!res.ok) throw new Error("Không thể lấy danh sách chuẩn câu hỏi");
        const data = await res.json();
        setCategoryOptions(data.map((cat) => ({ value: cat, label: cat })));
      } catch (err) {
        setCategoryOptions([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ message: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    document.title = t("questionManagement") + " | MindMeter";
  }, [t]);

  // Hàm loại bỏ dấu tiếng Việt
  function removeVietnameseTones(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }

  // Tìm kiếm
  const filteredQuestions = questions
    .filter((q) =>
      removeVietnameseTones(q.questionText.toLowerCase()).includes(
        removeVietnameseTones(search.toLowerCase())
      )
    )
    .sort((a, b) => (a.id || 0) - (b.id || 0));

  // Phân trang
  const paginatedQuestions = filteredQuestions.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  const totalPages = Math.ceil(filteredQuestions.length / pageSize);

  // Thêm/sửa câu hỏi
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert({ message: "", type: "" });
    try {
      const token = localStorage.getItem("token");
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit
        ? `/api/admin/questions/${modalQuestion.id}`
        : "/api/admin/questions";
      const res = await authFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          questionText: modalQuestion.questionText,
          weight: modalQuestion.weight,
          isActive: modalQuestion.isActive,
          category: modalQuestion.category,
          order: Number(modalQuestion.order),
          options: modalQuestion.options.filter(
            (option) => option.optionText.trim() !== ""
          ),
        }),
      });
      if (!res.ok)
        throw new Error(isEdit ? "Cập nhật thất bại" : "Thêm thất bại");
      setShowModal(false);
      setModalQuestion({
        id: null,
        questionText: "",
        weight: 1,
        isActive: true,
        category: "MOOD",
        order: 1,
        options: [
          { optionText: "", optionValue: 0, order: 1 },
          { optionText: "", optionValue: 1, order: 2 },
        ],
      });
      setAlert({ message: t("updateQuestionSuccess"), type: "success" });
      fetchQuestions();
    } catch (err) {
      setAlert({ message: t("updateQuestionFailed"), type: "danger" });
    } finally {
      setSaving(false);
    }
  };

  // Xóa câu hỏi
  const handleDelete = async (id) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  // Hàm xóa xác nhận
  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await authFetch(`/api/admin/questions/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      setAlert({ message: t("deleteQuestionSuccess"), type: "success" });
      setConfirmDelete(false);
      setDeleteId(null);
      fetchQuestions();
    } catch (err) {
      setAlert({ message: t("deleteQuestionFailed"), type: "danger" });
    } finally {
      setDeleting(false);
    }
  };

  // Bật/tắt trạng thái
  const handleToggle = async (id) => {
    setSaving(true);
    setAlert({ message: "", type: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await authFetch(`/api/admin/questions/${id}/toggle`, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");
      setAlert({ message: "Cập nhật trạng thái thành công!", type: "success" });
      fetchQuestions();
    } catch (err) {
      setAlert({ message: err.message, type: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredQuestions.map((q) => [
      q.id,
      q.questionText,
      q.weight,
      q.category,
      q.order,
      q.isActive ? "Đang sử dụng" : "Vô hiệu hóa",
    ]);
    const header = [
      "Mã câu hỏi",
      "Nội dung câu hỏi",
      "Trọng số",
      "Loại câu hỏi",
      "Thứ tự",
      "Trạng thái",
    ];
    const ws = XLSX.utils.aoa_to_sheet([header, ...dataToExport]);
    ws["!cols"] = [
      { wch: 10 }, // Mã
      { wch: 60 }, // Nội dung
      { wch: 10 }, // Trọng số
      { wch: 18 }, // Loại
      { wch: 10 }, // Thứ tự
      { wch: 16 }, // Trạng thái
    ];
    ws["!freeze"] = { xSplit: 0, ySplit: 1 };
    ws["!autofilter"] = {
      ref: XLSX.utils.encode_range({
        s: { c: 0, r: 0 },
        e: { c: header.length - 1, r: filteredQuestions.length },
      }),
    };
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CauHoi");
    XLSX.writeFile(wb, "danh_sach_cau_hoi.xlsx");
  };

  // Hàm sinh mảng phân trang rút gọn
  function getPagination(current, total) {
    const delta = 1;
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

  const selectTheme = (theme) => ({
    ...theme,
    borderRadius: 12,
    colors: {
      ...theme.colors,
      primary25: theme.colors.primary, // Use primary color for selected option
      primary: "#2563eb", // Primary color
      neutral0: theme.colors.neutral80, // Use neutral80 for background
      neutral80: theme.colors.neutral0, // Use neutral0 for text
    },
  });

  const handleLogout =
    propHandleLogout ||
    (() => {
      localStorage.removeItem("token");
      navigate("/login");
    });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-blue-100 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <DashboardHeader
        logoIcon={
          <FaQuestionCircle className="text-indigo-500 dark:text-indigo-300 text-3xl" />
        }
        logoText={
          <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 dark:from-indigo-300 dark:via-blue-300 dark:to-purple-400 bg-clip-text text-transparent tracking-wide">
            {t("questionManagement") || "Quản lý câu hỏi"}
          </span>
        }
        user={user}
        theme={theme}
        setTheme={setTheme}
        onProfile={() => navigate("/admin/profile")}
        onLogout={handleLogout}
      />
      <div className="flex-grow flex flex-col py-10 overflow-x-hidden pt-16">
        <div className="p-8 w-full dark:bg-gray-900 min-h-screen">
          <h1 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-300 text-center">
            {t("questionManagement")}
          </h1>
          <div className="flex flex-wrap gap-4 mb-6 items-center justify-between w-full">
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
            <div className="flex-1 flex items-center justify-center min-w-[220px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchQuestion")}
                className="w-full max-w-xl px-6 py-3 rounded-full shadow border outline-none focus:ring-2 focus:ring-blue-400 text-base dark:bg-gray-800 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="flex gap-4">
              <button
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition min-w-[140px] h-[48px] dark:bg-blue-700 dark:hover:bg-blue-800"
                onClick={() => {
                  setShowModal(true);
                  setIsEdit(false);
                  setModalQuestion({
                    id: null,
                    questionText: "",
                    weight: 1,
                    isActive: true,
                    category: categoryOptions[0]?.value || "",
                    order: 1,
                    options: [
                      { optionText: "", optionValue: 0, order: 1 },
                      { optionText: "", optionValue: 1, order: 2 },
                    ],
                  });
                }}
              >
                + {t("addQuestion")}
              </button>
              <button
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition min-w-[140px] h-[48px] dark:bg-green-700 dark:hover:bg-green-800"
                onClick={handleExportExcel}
              >
                <FaFileExcel className="text-lg" />
                {t("exportExcel")}
              </button>
            </div>
          </div>
          {alert.message && (
            <div
              className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-xl shadow-lg text-base font-semibold transition-all duration-300
          ${
            alert.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
            >
              {alert.message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          {loading ? (
            <div>Đang tải câu hỏi...</div>
          ) : (
            <div className="overflow-x-auto w-full flex justify-center">
              <table className="min-w-full max-w-4xl mx-auto divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl border border-blue-200 dark:border-gray-700">
                <thead className="bg-blue-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-2 py-3 text-center text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                      {t("questionCode")}
                    </th>
                    <th className="px-3 py-3 text-left text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                      {t("questionContent")}
                    </th>
                    <th className="px-2 py-3 text-center text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                      {t("weight")}
                    </th>
                    <th className="px-2 py-3 text-center text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                      {t("questionType")}
                    </th>
                    <th className="px-2 py-3 text-center text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                      {t("order")}
                    </th>
                    <th className="px-2 py-3 text-center text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                      {t("status")}
                    </th>
                    <th className="px-2 py-3 text-center text-base font-extrabold text-blue-800 dark:text-white uppercase tracking-wider border-b-2 border-blue-200 dark:border-gray-700">
                      {t("action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {paginatedQuestions.map((q) => (
                    <tr
                      key={q.id}
                      className="bg-white even:bg-blue-50 dark:bg-gray-800 dark:even:bg-gray-900"
                    >
                      <td className="px-2 py-3 text-center font-semibold text-blue-700 dark:text-blue-200">
                        {q.id}
                      </td>
                      <td className="px-3 py-3 text-gray-800 dark:text-white break-words whitespace-pre-line">
                        {q.questionText}
                      </td>
                      <td className="px-2 py-3 text-center font-bold text-indigo-600 dark:text-indigo-200">
                        {q.weight}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-700">
                          {categoryOptions.find(
                            (opt) => opt.value === q.category
                          )?.label || ""}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center font-semibold text-blue-600 dark:text-blue-200">
                        {q.order}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-4 py-1 rounded-full text-sm font-bold text-center whitespace-nowrap shadow-sm border
                      ${
                        q.isActive
                          ? "bg-green-100 dark:bg-green-800/60 text-green-700 dark:text-green-100 border-green-200 dark:border-green-700"
                          : "bg-gray-200 dark:bg-gray-700/60 text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      }
                    `}
                        >
                          {q.isActive ? t("using") : t("inactiveStatus")}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center h-full align-middle">
                        <div className="flex gap-2 justify-center items-center h-full">
                          <button
                            className="bg-yellow-400 text-white px-6 py-2 rounded-full hover:bg-yellow-500 transition-colors flex items-center gap-2 shadow font-semibold text-base min-w-[80px]"
                            onClick={() => {
                              setShowModal(true);
                              setIsEdit(true);
                              setModalQuestion({
                                ...q,
                                options:
                                  Array.isArray(q.options) &&
                                  q.options.length > 0
                                    ? q.options.map((opt) => ({
                                        optionText:
                                          opt.optionText ||
                                          opt.content ||
                                          opt.option_text ||
                                          "",
                                        optionValue:
                                          opt.optionValue ??
                                          opt.value ??
                                          opt.option_value ??
                                          0,
                                        order: opt.order ?? 1,
                                      }))
                                    : [
                                        {
                                          optionText: "",
                                          optionValue: 0,
                                          order: 1,
                                        },
                                        {
                                          optionText: "",
                                          optionValue: 1,
                                          order: 2,
                                        },
                                      ],
                              });
                            }}
                          >
                            <FaEdit className="w-5 h-5 mr-1" />
                            {t("edit")}
                          </button>
                          <button
                            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors flex items-center gap-2 shadow font-semibold text-base min-w-[80px]"
                            onClick={() => {
                              handleDelete(q.id);
                            }}
                            disabled={deleting}
                          >
                            <FaTrash className="w-5 h-5 mr-1" />
                            {t("delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination: luôn hiển thị, kể cả khi chỉ có 1 trang */}
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
              aria-label={t("previousPage")}
            >
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 15l-5-5 5-5" />
              </svg>
            </button>
            {/* Số trang rút gọn */}
            {getPagination(currentPage, totalPages).map((page, idx) =>
              page === "..." ? (
                <span
                  key={idx}
                  className="w-10 h-10 flex items-center justify-center text-xl text-gray-400 select-none"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
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
              aria-label={t("nextPage")}
            >
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M7 5l5 5-5 5" />
              </svg>
            </button>
          </div>
          {/* Modal thêm/sửa câu hỏi */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <form
                className="bg-white dark:bg-gray-900 dark:text-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl min-w-[320px] mx-4 transition-all duration-300 flex flex-col"
                onSubmit={handleSave}
              >
                <h2 className="text-3xl font-extrabold mb-8 text-blue-600 dark:text-blue-300 text-center w-full tracking-wide">
                  {isEdit ? t("editQuestion") : t("addQuestion")}
                </h2>
                {/* Nội dung cuộn */}
                <div
                  className="flex-1 overflow-y-auto px-2 md:px-4"
                  style={{ maxHeight: "60vh" }}
                >
                  <div className="mb-8">
                    <label className="block text-gray-700 dark:text-gray-200 text-base font-medium mb-2">
                      {t("questionContent")}
                    </label>
                    <textarea
                      className="border border-gray-300 dark:border-gray-700 rounded-xl px-5 py-3 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors text-base min-h-[80px] resize-none dark:bg-gray-800 dark:text-white"
                      rows={3}
                      value={modalQuestion.questionText}
                      onChange={(e) =>
                        setModalQuestion({
                          ...modalQuestion,
                          questionText: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-200 text-base font-medium mb-2">
                        {t("weight")}
                      </label>
                      <input
                        type="number"
                        className="border border-gray-300 dark:border-gray-700 rounded-xl px-5 py-3 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors text-base dark:bg-gray-800 dark:text-white"
                        value={modalQuestion.weight}
                        min={1}
                        onChange={(e) =>
                          setModalQuestion({
                            ...modalQuestion,
                            weight: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-200 text-base font-medium mb-2">
                        {t("questionType")}
                      </label>
                      <Select
                        classNamePrefix="react-select"
                        options={categoryOptions}
                        value={
                          categoryOptions.find(
                            (opt) => opt.value === modalQuestion.category
                          ) || null
                        }
                        onChange={(opt) =>
                          setModalQuestion({
                            ...modalQuestion,
                            category: opt ? opt.value : "",
                          })
                        }
                        placeholder={t("selectStandardQuestion")}
                        isClearable={false}
                        menuPortalTarget={
                          typeof window !== "undefined"
                            ? window.document.body
                            : undefined
                        }
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            backgroundColor:
                              theme === "dark" ? "#1e293b" : "#fff",
                            borderColor: state.isFocused
                              ? "#2563eb"
                              : theme === "dark"
                              ? "#334155"
                              : "#d1d5db",
                            boxShadow: state.isFocused
                              ? "0 0 0 2px #2563eb33"
                              : undefined,
                            color: theme === "dark" ? "#fff" : "#1e293b",
                            minHeight: "48px",
                            height: "48px",
                            fontSize: "1rem",
                            alignItems: "center",
                            display: "flex",
                            lineHeight: "1.5",
                            paddingTop: 0,
                            paddingBottom: 0,
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor:
                              theme === "dark" ? "#1e293b" : "#fff",
                            color: theme === "dark" ? "#fff" : "#1e293b",
                            borderRadius: "0.75rem",
                            boxShadow: "0 8px 24px 0 rgba(0,0,0,0.15)",
                            zIndex: 9999,
                            fontSize: "1rem",
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                              ? theme === "dark"
                                ? "#2563eb"
                                : "#2563eb"
                              : state.isFocused
                              ? theme === "dark"
                                ? "#334155"
                                : "#e0e7ef"
                              : "transparent",
                            color:
                              state.isSelected || theme === "dark"
                                ? "#fff"
                                : "#1e293b",
                            cursor: "pointer",
                            padding: "12px 20px",
                            fontSize: "1rem",
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: theme === "dark" ? "#fff" : "#1e293b",
                            fontSize: "1rem",
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: theme === "dark" ? "#94a3b8" : "#64748b",
                            fontSize: "1rem",
                          }),
                          dropdownIndicator: (base, state) => ({
                            ...base,
                            color: theme === "dark" ? "#fff" : "#1e293b",
                            ":hover": { color: "#2563eb" },
                          }),
                          indicatorSeparator: (base) => ({
                            ...base,
                            backgroundColor:
                              theme === "dark" ? "#334155" : "#d1d5db",
                          }),
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        theme={selectTheme}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-200 text-base font-medium mb-2">
                        {t("order")}
                      </label>
                      <input
                        type="number"
                        className="border border-gray-300 dark:border-gray-700 rounded-xl px-5 py-3 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors text-base dark:bg-gray-800 dark:text-white"
                        value={modalQuestion.order}
                        min={1}
                        onChange={(e) =>
                          setModalQuestion({
                            ...modalQuestion,
                            order: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center mb-8">
                    <input
                      type="checkbox"
                      className="mr-2 w-5 h-5 accent-blue-600 dark:bg-gray-800 dark:border-gray-700"
                      checked={modalQuestion.isActive}
                      onChange={(e) =>
                        setModalQuestion({
                          ...modalQuestion,
                          isActive: e.target.checked,
                        })
                      }
                      id="isActive"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-base font-medium text-gray-700 dark:text-gray-200 select-none"
                    >
                      {t("using")}
                    </label>
                  </div>

                  {/* Phần nhập các lựa chọn */}
                  <div className="mb-8">
                    <label className="block text-gray-700 dark:text-gray-200 text-base font-medium mb-4">
                      {t("questionOptions")}
                    </label>
                    <div className="space-y-4">
                      {modalQuestion.options.map((option, index) => (
                        <div key={index} className="flex gap-4 items-center">
                          <div className="flex-1">
                            <input
                              type="text"
                              className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors text-base dark:bg-gray-800 dark:text-white"
                              placeholder={`${t("optionPlaceholder")} ${
                                index + 1
                              }`}
                              value={option.optionText}
                              onChange={(e) => {
                                const newOptions = [...modalQuestion.options];
                                newOptions[index].optionText = e.target.value;
                                setModalQuestion({
                                  ...modalQuestion,
                                  options: newOptions,
                                });
                              }}
                            />
                          </div>
                          <div className="w-20">
                            <input
                              type="number"
                              className="border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-3 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors text-base dark:bg-gray-800 dark:text-white"
                              placeholder={t("score")}
                              value={option.optionValue}
                              onChange={(e) => {
                                const newOptions = [...modalQuestion.options];
                                newOptions[index].optionValue = Number(
                                  e.target.value
                                );
                                setModalQuestion({
                                  ...modalQuestion,
                                  options: newOptions,
                                });
                              }}
                            />
                          </div>
                          {/* Nút xóa đáp án, chỉ hiển thị nếu còn >2 đáp án */}
                          {modalQuestion.options.length > 2 && (
                            <button
                              type="button"
                              className="ml-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                              onClick={() => {
                                const newOptions = modalQuestion.options.filter(
                                  (_, i) => i !== index
                                );
                                setModalQuestion({
                                  ...modalQuestion,
                                  options: newOptions.map((opt, idx) => ({
                                    ...opt,
                                    order: idx + 1,
                                  })),
                                });
                              }}
                              aria-label={t("delete")}
                            >
                              {t("delete")}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Nút thêm lựa chọn */}
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => {
                        setModalQuestion({
                          ...modalQuestion,
                          options: [
                            ...modalQuestion.options,
                            {
                              optionText: "",
                              optionValue: modalQuestion.options.length,
                              order: modalQuestion.options.length + 1,
                            },
                          ],
                        });
                      }}
                      disabled={modalQuestion.options.length >= 10}
                    >
                      + {t("addOption")}
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {t("questionOptionsHint")}
                    </p>
                  </div>
                </div>
                {/* Nút hành động luôn ở dưới */}
                <div className="flex justify-end gap-4 mt-6 sticky bottom-0 bg-white dark:bg-gray-900 pt-4 z-10">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                    disabled={saving}
                  >
                    {saving ? t("saving") : isEdit ? t("update") : t("addNew")}
                  </button>
                </div>
              </form>
            </div>
          )}
          {/* Modal xác nhận xóa */}
          {confirmDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-sm text-center">
                <h2 className="text-xl font-bold mb-4">{t("confirmDelete")}</h2>
                <p>{t("confirmDeleteMessage")}</p>
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold"
                    onClick={handleDeleteConfirmed}
                    disabled={deleting}
                  >
                    {deleting ? t("deleting") : t("delete")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <FooterSection />
    </div>
  );
}
