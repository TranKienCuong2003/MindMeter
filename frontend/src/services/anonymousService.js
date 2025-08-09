import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Tạo tài khoản ẩn danh
export const createAnonymousAccount = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/anonymous/create`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error("Error creating anonymous account:", error);
    throw error;
  }
};

// Nâng cấp tài khoản ẩn danh
export const upgradeAnonymousAccount = async (userId, upgradeData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/auth/anonymous/upgrade/${userId}`,
      upgradeData
    );
    return response.data;
  } catch (error) {
    console.error("Error upgrading anonymous account:", error);
    throw error;
  }
};

// Kiểm tra xem user có phải là anonymous không
export const isAnonymousUser = (user) => {
  return user && user.anonymous === true;
};

// Lưu thông tin user ẩn danh vào localStorage
export const saveAnonymousUser = (userData) => {
  localStorage.setItem("anonymousUser", JSON.stringify(userData));
};

// Lấy thông tin user ẩn danh từ localStorage
export const getAnonymousUser = () => {
  const userData = localStorage.getItem("anonymousUser");
  if (!userData || userData === "undefined") return null;
  try {
    const user = JSON.parse(userData);
    // Bổ sung role nếu thiếu
    if (!user.role) user.role = "STUDENT";
    if (!user.name) user.name = "Người dùng Ẩn danh";
    return user;
  } catch {
    return null;
  }
};

// Xóa thông tin user ẩn danh khỏi localStorage
export const removeAnonymousUser = () => {
  localStorage.removeItem("anonymousUser");
};

// Lưu token ẩn danh
export const saveAnonymousToken = (token) => {
  localStorage.setItem("anonymousToken", token);
};

// Lấy token ẩn danh
export const getAnonymousToken = () => {
  return localStorage.getItem("anonymousToken");
};

// Xóa token ẩn danh
export const removeAnonymousToken = () => {
  localStorage.removeItem("anonymousToken");
};

// Kiểm tra xem có đang sử dụng tài khoản ẩn danh không
export const isUsingAnonymousAccount = () => {
  return getAnonymousToken() !== null;
};

// Lấy thông tin user hiện tại (anonymous hoặc logged in)
export const getCurrentUser = () => {
  // Ưu tiên user đã đăng nhập
  const loggedInUser = localStorage.getItem("user");
  if (loggedInUser && loggedInUser !== "undefined") {
    try {
      return JSON.parse(loggedInUser);
    } catch {
      return null;
    }
  }

  // Nếu không có user đăng nhập, kiểm tra anonymous user
  return getAnonymousUser();
};

// Lấy token hiện tại
export const getCurrentToken = () => {
  // Ưu tiên token đăng nhập
  const loggedInToken = localStorage.getItem("token");
  if (loggedInToken) {
    return loggedInToken;
  }

  // Nếu không có token đăng nhập, kiểm tra anonymous token
  return getAnonymousToken();
};

// Xóa tất cả thông tin anonymous
export const clearAnonymousData = () => {
  removeAnonymousUser();
  removeAnonymousToken();
};
