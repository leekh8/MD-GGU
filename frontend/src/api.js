// 프론트엔드와 백엔드 간의 통신 담당
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // HttpOnly 쿠키(refreshToken) 전송을 위해 필요
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
  },
});

// 엔드포인트 상수
const ENDPOINTS = {
  REGISTER: "/api/v1/auth/register",
  LOGIN: "/api/v1/auth/login",
  LOGOUT: "/api/v1/auth/logout",
  ME: "/api/v1/auth/me",
  DOCUMENTS: "/api/v1/documents",
  DOCUMENT_BY_ID: "/api/v1/documents/",
  STATUS: "/status",
  REFRESH: "/api/v1/auth/refresh",
};

// 요청 인터셉터: 유효한 토큰은 그대로, 만료된 토큰은 갱신 후 헤더에 세팅
apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return config;

    try {
      const decoded = jwtDecode(accessToken);
      if (decoded.exp < Date.now() / 1000) {
        // 만료 → 갱신
        const newToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${newToken}`;
      } else {
        // 유효 → 그대로 사용
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch {
      // decode 실패 시 그대로 시도
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Access Token 갱신 (refreshToken은 HttpOnly 쿠키로 자동 전송)
const refreshAccessToken = async () => {
  const response = await apiClient.post(ENDPOINTS.REFRESH);
  const { accessToken, csrfToken } = response.data.data;
  localStorage.setItem("accessToken", accessToken);
  if (csrfToken) localStorage.setItem("csrfToken", csrfToken);
  return accessToken;
};

// 쿠키 헬퍼
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// 인증
export function register(email, password) {
  return apiClient
    .post(ENDPOINTS.REGISTER, { email, password })
    .then((res) => res.data)
    .catch((err) => { throw err.response?.data || err; });
}

export function login(email, password) {
  return apiClient
    .post(ENDPOINTS.LOGIN, { email, password })
    .then((res) => {
      const loginData = res.data.data; // ApiResponse<LoginResponse>.data
      return {
        accessToken: loginData.accessToken,
        csrfToken: loginData.csrfToken,
      };
    })
    .catch((err) => { throw err.response?.data || err; });
}

export function logout() {
  return apiClient
    .post(ENDPOINTS.LOGOUT)
    .then((res) => res.data)
    .catch((err) => { throw err.response?.data || err; });
}

export function getUser() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return Promise.resolve(null);

  return apiClient
    .get(ENDPOINTS.ME)
    .then((res) => res.data.data) // ApiResponse<User>.data
    .catch((err) => { throw err.response?.data || err; });
}

export const apiUpdateUser = async (updatedUser) => {
  const response = await apiClient.put(ENDPOINTS.ME, updatedUser);
  return response.data.data; // ApiResponse<User>.data
};

export function apiRefreshToken() {
  return apiClient.post(ENDPOINTS.REFRESH);
}

// 문서
export function getAllDocuments() {
  return apiClient.get(ENDPOINTS.DOCUMENTS).then((res) => res.data.data || res.data);
}

export function getDocumentById(id) {
  return apiClient.get(`${ENDPOINTS.DOCUMENT_BY_ID}${id}`).then((res) => res.data);
}

export function createDocument(document) {
  return apiClient.post(ENDPOINTS.DOCUMENTS, document).then((res) => res.data);
}

export function updateDocument(id, document) {
  return apiClient.put(`${ENDPOINTS.DOCUMENT_BY_ID}${id}`, document).then((res) => res.data);
}

export function deleteDocument(id) {
  return apiClient.delete(`${ENDPOINTS.DOCUMENT_BY_ID}${id}`).then((res) => res.data);
}

export function getServerStatus() {
  return apiClient.get(ENDPOINTS.STATUS).then((res) => res.data);
}

// 마크다운 최적화
export function optimizeMarkdown(content) {
  return apiClient
    .post("/api/v1/optimize", { content })
    .then((res) => res.data.data); // { summary, emojis, refs }
}

export function optimizeAndSaveDocument(documentId) {
  return apiClient
    .post(`/api/v1/optimize/${documentId}`)
    .then((res) => res.data.data);
}
