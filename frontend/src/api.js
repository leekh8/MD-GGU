// 프론트엔드와 백엔드 간의 통신 담당
import axios from "axios";

const BACKEND_URL =
  typeof process !== "undefined" && process.env.VITE_BACKEND_URL
    ? process.env.VITE_BACKEND_URL
    : import.meta.env.VITE_BACKEND_URL;

const apiClient = axios.create({
  baseURL: BACKEND_URL,
});

// 엔드포인트 상수 정의
const ENDPOINTS = {
  REGISTER: "/api/v1/auth/register",
  LOGIN: "/api/v1/auth/login",
  LOGOUT: "/api/v1/auth/logout",
  ME: "/api/v1/auth/me",
  DOCUMENTS: "/api/v1/documents",
  DOCUMENT_BY_ID: "/api/v1/documents/", // 동적 ID 추가 필요
  STATUS: "/status",
};

// 사용자 인증 관련 함수들
export function register(email, password) {
  return apiClient
    .post(ENDPOINTS.REGISTER, { email, password })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Registration error: ", error.response || error);
      throw error.response?.data || error;
    });
}

export function login(email, password) {
  return apiClient
    .post(ENDPOINTS.LOGIN, {
      email,
      password,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Login error: ", error.response || error);
      throw error.response?.data || error;
    });
}

export function logout() {
  return apiClient
    .post(ENDPOINTS.LOGOUT)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Logout error: ", error.response || error);
      throw error.response?.data || error;
    });
}

export function getUser() {
  return apiClient
    .get(ENDPOINTS.ME)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Get user error: ", error.response || error);
      throw error.response?.data || error;
    });
}

// 문서 관련 함수들
export function getAllDocuments() {
  return apiClient.get(ENDPOINTS.DOCUMENTS);
}

export function getDocumentById(id) {
  return apiClient.get(`${ENDPOINTS.DOCUMENT_BY_ID}/${id}`);
}

export function createDocument(document) {
  return apiClient.post(ENDPOINTS.DOCUMENTS, document);
}

export function updateDocument(id, document) {
  return apiClient.put(`${ENDPOINTS.DOCUMENT_BY_ID}/${id}`, document);
}

export function deleteDocument(id) {
  return apiClient.delete(`${ENDPOINTS.DOCUMENT_BY_ID}/${id}`);
}
