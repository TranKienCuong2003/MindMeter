import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";
import { authFetch } from "../authFetch";

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState("");
  const [error, setError] = useState("");

  // Lấy user từ token (fallback)
  let user = {
    firstName: "",
    lastName: "",
    email: "",
    role: "STUDENT",
    avatar: null,
    createdAt: "",
    phone: "",
  };
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      user.email = decoded.sub || decoded.email || "";
      user.role = decoded.role || "STUDENT";
      user.firstName = decoded.firstName || "";
      user.lastName = decoded.lastName || "";
      user.phone = decoded.phone || "";
      user.createdAt = decoded.createdAt
        ? new Date(decoded.createdAt).toLocaleString()
        : "";
      if (decoded.avatar) user.avatar = decoded.avatar;
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/");
    }
  } else {
    navigate("/");
  }
  const [profile, setProfile] = useState(user);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Lấy dữ liệu mới nhất từ backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await authFetch("/api/student/profile");
        if (!res.ok) throw new Error("Failed to fetch student profile");
        const data = await res.json();
        const updatedProfile = {
          ...user,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          email: data.email || user.email,
          role: data.role || user.role,
          createdAt: data.createdAt
            ? new Date(data.createdAt).toLocaleString()
            : user.createdAt,
          avatar: data.avatarUrl || user.avatar,
        };
        setProfile(updatedProfile);
        setForm({
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
          phone: updatedProfile.phone,
        });
      } catch (err) {
        setError(t("fetchStudentError") || "Lỗi tải thông tin học sinh");
        setForm({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
    });
  }, [isEdit, profile]);

  useEffect(() => {
    document.title = t("studentProfileTitle") + " | MindMeter";
  }, [t]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert("");
    setError("");
    try {
      const res = await authFetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      const data = await res.json();
      setProfile((prev) => ({ ...prev, ...data }));
      setAlert(t("updateUserSuccess"));
      setIsEdit(false);
    } catch (err) {
      setError(t("updateUserFailed") || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-10 flex flex-col items-center border border-blue-100 dark:border-gray-700 min-w-[340px] max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
          <div className="text-gray-600 dark:text-gray-300 text-center">
            {t("loading")}...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-10 flex flex-col items-center border border-blue-100 dark:border-gray-700 min-w-[340px] max-w-md w-full mx-4">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt="avatar"
            className="w-24 h-24 rounded-full border-2 border-indigo-400 dark:border-indigo-600 shadow mb-4"
          />
        ) : (
          <FaUserCircle className="w-24 h-24 text-indigo-400 dark:text-indigo-300 bg-white dark:bg-gray-800 rounded-full border-2 border-indigo-200 dark:border-indigo-700 shadow mb-4" />
        )}
        <form className="w-full" onSubmit={handleSave}>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-gray-600 dark:text-gray-300 text-sm mb-1">
                  {t("firstNameHeader")}
                </label>
                {isEdit ? (
                  <input
                    type="text"
                    className="w-full rounded-xl px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    required
                  />
                ) : (
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {profile.firstName}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-gray-600 dark:text-gray-300 text-sm mb-1">
                  {t("lastNameHeader")}
                </label>
                {isEdit ? (
                  <input
                    type="text"
                    className="w-full rounded-xl px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    required
                  />
                ) : (
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {profile.lastName}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-300 text-sm mb-1">
                Email
              </label>
              <div className="text-lg font-semibold text-gray-800 dark:text-white">
                {profile.email}
              </div>
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-300 text-sm mb-1">
                {t("phoneHeader")}
              </label>
              {isEdit ? (
                <input
                  type="text"
                  className="w-full rounded-xl px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              ) : (
                <div className="text-lg font-semibold text-gray-800 dark:text-white">
                  {profile.phone || t("notUpdated")}
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-300 text-sm mb-1">
                {t("roleHeader")}
              </label>
              <div className="text-base text-blue-600 dark:text-blue-300 font-semibold">
                {profile.role === "STUDENT" ? t("roleStudent") : profile.role}
              </div>
            </div>
            {profile.createdAt && (
              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-sm mb-1">
                  {t("createdAtHeader")}
                </label>
                <div className="text-sm text-gray-400 dark:text-gray-400">
                  {profile.createdAt}
                </div>
              </div>
            )}
          </div>
          {error && (
            <div className="mb-4 text-red-600 dark:text-red-400 text-center font-semibold">
              {error}
            </div>
          )}
          {alert && (
            <div className="mb-4 text-green-600 dark:text-green-400 text-center font-semibold">
              {alert}
            </div>
          )}
          <div className="flex gap-4 justify-between mt-6">
            <button
              className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-indigo-600 transition flex items-center justify-center gap-2"
              type="button"
              onClick={() => navigate("/home")}
            >
              <FaArrowLeft className="text-sm" />
              {t("backToHome")}
            </button>
            <div className="flex gap-4">
              {isEdit ? (
                <>
                  <button
                    type="button"
                    className="px-6 py-2 rounded-xl font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition"
                    onClick={() => {
                      setIsEdit(false);
                      setAlert("");
                    }}
                    disabled={saving}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                    disabled={saving}
                  >
                    {saving ? t("saving") : t("update")}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="px-6 py-2 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition"
                  onClick={() => setIsEdit(true)}
                >
                  {t("edit")}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
