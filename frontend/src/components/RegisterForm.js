import React, { useState, useRef, useEffect } from "react";
import {
  FaUserPlus,
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaGoogle,
} from "react-icons/fa";
import TermsModal from "./TermsModal";
import { useTranslation, Trans } from "react-i18next";
import { authFetch } from "../authFetch";
import { ThemeContext } from "../App";

function RegisterForm({ onRegister, onSwitchForm }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showError, setShowError] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const emailRef = useRef();
  const passwordRef = useRef();
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.email) err.email = "Email không được để trống";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      err.email = "Email không hợp lệ";
    if (!form.password) err.password = "Mật khẩu không được để trống";
    else if (form.password.length < 6)
      err.password = "Mật khẩu tối thiểu 6 ký tự";
    if (!form.confirmPassword)
      err.confirmPassword = "Nhập lại mật khẩu không được để trống";
    else if (form.password !== form.confirmPassword)
      err.confirmPassword = "Mật khẩu không khớp";
    if (!agree) err.agree = "Bạn phải đồng ý với điều khoản sử dụng";
    setFieldError(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authFetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Đăng ký thất bại");
      }
      const data = await res.json();
      setSuccess(t("registerSuccess", { count: 5 }));
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            onSwitchForm && onSwitchForm("login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm đánh giá strength trả về cả level và text
  const getPasswordStrength = (pw) => {
    if (!pw) return { level: "", text: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: "weak", text: t("otpReset.weak") };
    if (score === 2) return { level: "medium", text: t("otpReset.medium") };
    if (score >= 3) return { level: "strong", text: t("otpReset.strong") };
    return { level: "", text: "" };
  };

  const requiredErrors = Object.values(fieldError).filter((e) =>
    e.includes("không được để trống")
  );

  useEffect(() => {
    if (requiredErrors.length > 0) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [requiredErrors.length]);

  useEffect(() => {
    document.title = t("registerTitle") + " | MindMeter";
  }, [t]);

  // Tạo thông báo gom lỗi
  let errorMsg = "";
  if (requiredErrors.length === 1) {
    errorMsg = requiredErrors[0];
  } else if (requiredErrors.length > 1) {
    // Lấy tên trường từ lỗi
    const fields = requiredErrors.map((e) =>
      e.split(" không được để trống")[0].trim()
    );
    const last = fields.pop();
    errorMsg = fields.length
      ? `${fields.join(", ")} và ${last} không được để trống`
      : `${last} không được để trống`;
  }

  const handleGoogleRegister = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const { theme } = React.useContext(ThemeContext);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f4f6fa] dark:bg-[#101624]">
      <div className="flex bg-white dark:bg-[#181e29] rounded-3xl shadow-lg overflow-hidden max-w-3xl w-full border border-gray-200 dark:border-[#353c4a]">
        <div
          className="hidden md:block w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              theme === "dark"
                ? "url('/src/assets/images/Auth_1.png')"
                : "url('/src/assets/images/Auth_2.png')",
          }}
        />
        <div className="w-full md:w-1/2 flex items-center">
          <form
            onSubmit={handleSubmit}
            className="w-full px-10 pt-8 pb-10"
            autoComplete="off"
          >
            {showError && errorMsg && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg shadow animate-shake">
                <FaExclamationCircle className="text-xl mr-2 text-red-500 dark:text-red-300" />
                <div className="font-semibold">{errorMsg}</div>
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg shadow">
                <div className="font-semibold">
                  {t("registerSuccess", { count: countdown })}
                </div>
              </div>
            )}
            <div className="flex flex-col items-center mb-6">
              <FaUserPlus className="text-4xl text-green-500 dark:text-[#22c55e] mb-2" />
              <h2 className="text-3xl font-extrabold text-green-700 dark:text-[#22c55e] tracking-tight">
                {t("register")}
              </h2>
            </div>
            <div className="mb-5 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-200 dark:text-gray-200 text-lg pointer-events-none">
                <FaEnvelope />
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                ref={emailRef}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                className={`peer border border-gray-300 dark:border-[#353c4a] rounded-xl w-full py-2 pl-10 pr-4 text-gray-800 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 dark:focus:ring-[#22c55e]/30 bg-gray-100 dark:bg-[#232a36] transition duration-150 text-base placeholder-gray-600 dark:placeholder-gray-300 ${
                  fieldError.email &&
                  fieldError.email.includes("không được để trống")
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-600 dark:focus:border-red-500 dark:focus:ring-red-900"
                    : ""
                }`}
                placeholder={
                  emailFocus || form.email ? t("emailPlaceholder") : ""
                }
              />
              <label
                className={`pointer-events-none absolute transition-all duration-200
                  ${
                    form.email || emailFocus
                      ? "-top-5 left-3 px-1 bg-transparent text-sm font-bold text-green-800 dark:text-[#22c55e]"
                      : "top-3 left-10 text-base text-gray-500 dark:text-gray-400"
                  }
                `}
              >
                {t("emailLabel")}
              </label>
            </div>
            <div className="mb-5 relative">
              <span className="absolute left-3 top-3 text-gray-200 dark:text-gray-200 text-base pointer-events-none">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                ref={passwordRef}
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                className={`peer border border-gray-300 dark:border-[#353c4a] rounded-xl w-full py-2 pl-10 pr-4 text-gray-800 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 dark:focus:ring-[#22c55e]/30 bg-gray-100 dark:bg-[#232a36] transition duration-150 text-base placeholder-gray-600 dark:placeholder-gray-300 ${
                  fieldError.password &&
                  fieldError.password.includes("không được để trống")
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-600 dark:focus:border-red-500 dark:focus:ring-red-900"
                    : ""
                }`}
                placeholder={
                  passwordFocus || form.password ? t("passwordPlaceholder") : ""
                }
              />
              <label
                className={`pointer-events-none absolute transition-all duration-200
                  ${
                    form.password || passwordFocus
                      ? "-top-5 left-3 px-1 bg-transparent text-sm font-bold text-green-800 dark:text-[#22c55e]"
                      : "top-3 left-10 text-base text-gray-500 dark:text-gray-400"
                  }
                `}
              >
                {t("passwordLabel")}
              </label>
              {form.password &&
                (() => {
                  const { level, text } = getPasswordStrength(form.password);
                  let color = "";
                  let icon = "";
                  let iconClass = "text-base";
                  if (level === "weak") {
                    color = "text-red-500";
                    icon = "❌";
                    iconClass = "text-lg";
                  } else if (level === "medium") {
                    color = "text-yellow-600";
                    icon = "⚠️";
                    iconClass = "text-lg";
                  } else if (level === "strong") {
                    color = "text-green-600";
                    icon = "✅";
                    iconClass = "text-lg";
                  }
                  return (
                    <div
                      className={`mt-1 text-xs font-semibold ${color} flex items-baseline gap-1`}
                    >
                      <span className={iconClass}>{icon}</span>
                      <span>
                        {t("otpReset.passwordStrength")}: {text}
                      </span>
                    </div>
                  );
                })()}
            </div>
            <div className="mb-5 relative">
              <span className="absolute left-3 top-3 text-gray-200 dark:text-gray-200 text-base pointer-events-none">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                onFocus={() => setConfirmPasswordFocus(true)}
                onBlur={() => setConfirmPasswordFocus(false)}
                className={`peer border border-gray-300 dark:border-[#353c4a] rounded-xl w-full py-2 pl-10 pr-4 text-gray-800 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 dark:focus:ring-[#22c55e]/30 bg-gray-100 dark:bg-[#232a36] transition duration-150 text-base placeholder-gray-600 dark:placeholder-gray-300 ${
                  fieldError.confirmPassword &&
                  fieldError.confirmPassword.includes("không được để trống")
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-600 dark:focus:border-red-500 dark:focus:ring-red-900"
                    : ""
                }`}
                placeholder={
                  confirmPasswordFocus || form.confirmPassword
                    ? t("confirmPasswordPlaceholder")
                    : ""
                }
              />
              <label
                className={`pointer-events-none absolute transition-all duration-200
                  ${
                    form.confirmPassword || confirmPasswordFocus
                      ? "-top-5 left-3 px-1 bg-transparent text-sm font-bold text-green-800 dark:text-[#22c55e]"
                      : "top-3 left-10 text-base text-gray-500 dark:text-gray-400"
                  }
                `}
              >
                {t("confirmPasswordLabel")}
              </label>
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="mr-2 accent-green-500 dark:accent-[#22c55e]"
                />
                <label
                  htmlFor="showPassword"
                  className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none"
                >
                  {t("showPassword")}
                </label>
              </div>
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mr-2 accent-green-500 dark:accent-[#22c55e]"
              />
              <label
                htmlFor="agree"
                className="text-sm select-none cursor-pointer text-gray-500 dark:text-gray-400"
              >
                <Trans
                  i18nKey="agreeTermsFull"
                  components={{
                    terms: (
                      <span
                        className="text-green-600 dark:text-[#22c55e] underline cursor-pointer"
                        onClick={() => setShowTerms(true)}
                      />
                    ),
                    privacy: (
                      <span
                        className="text-green-600 dark:text-[#22c55e] underline cursor-pointer"
                        onClick={() => window.open("/privacy-policy", "_blank")}
                      />
                    ),
                  }}
                />
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] dark:bg-[#22c55e] dark:hover:bg-[#16a34a] text-white font-semibold py-2 rounded-lg transition text-lg shadow"
              disabled={loading}
            >
              {loading ? t("loading") : t("register")}
            </button>
            <div className="relative my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-[#353c4a]"></div>
              <span className="mx-4 text-gray-500 dark:text-gray-400">
                {t("or")}
              </span>
              <div className="flex-grow border-t border-gray-300 dark:border-[#353c4a]"></div>
            </div>
            <div className="flex flex-col gap-3 mb-6">
              <button
                type="button"
                className="flex items-center justify-center gap-2 border border-gray-300 dark:border-[#353c4a] rounded-xl py-2 px-4 bg-white dark:bg-[#232a36] text-gray-800 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-[#232a36]/80 transition"
                onClick={handleGoogleRegister}
              >
                <FaGoogle className="text-red-500 text-lg" />
                {t("registerWithGoogle")}
              </button>
            </div>
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("haveAccount")}{" "}
              <span
                className="text-[#22c55e] dark:text-[#22c55e] font-semibold hover:underline cursor-pointer"
                onClick={() => onSwitchForm && onSwitchForm("login")}
              >
                {t("login")}
              </span>
            </div>
          </form>
        </div>
      </div>
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}

export default RegisterForm;
