const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let accessToken = localStorage.getItem("blagonku_access_token") || "";

export const setAccessToken = (token) => {
  accessToken = token || "";
  if (token) localStorage.setItem("blagonku_access_token", token);
  else localStorage.removeItem("blagonku_access_token");
};

const request = async (path, options = {}, retry = true) => {
  const isForm = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 401 && retry && !path.includes("/auth/refresh")) {
    const refreshed = await request("/auth/refresh", { method: "POST" }, false).catch(() => null);
    if (refreshed?.accessToken) {
      setAccessToken(refreshed.accessToken);
      return request(path, options, false);
    }
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Request failed");
  return payload;
};

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body || {}) }),
  patch: (path, body) => request(path, { method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body || {}) }),
  delete: (path) => request(path, { method: "DELETE" })
};
