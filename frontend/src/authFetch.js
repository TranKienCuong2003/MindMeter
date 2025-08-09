import {
  getCurrentToken,
  clearAnonymousData,
} from "./services/anonymousService";

export async function authFetch(url, options = {}) {
  const token = getCurrentToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("token");
    clearAnonymousData();
    window.location.href = "/login";
    return;
  }
  return res;
}
