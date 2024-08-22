// 프론트엔드와 백엔드 간의 통신 담당
import axios from "axios";

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL;

// 사용자 인증 관련 함수들
export function register(email, password) {
  return axios
    .post(`${BACKEND_URL}/api/v1/auth/register`, {
      email,
      password,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Registration error: ", error.response || error);
      throw error.response?.data || error;
    });
}

export function login(email, password) {
  return axios
    .post(`${BACKEND_URL}/api/v1/auth/login`, {
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
  return axios
    .post(`${BACKEND_URL}/api/v1/auth/logout`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Logout error: ", error.response || error);
      throw error.response?.data || error;
    });
}

export function getUser() {
  return axios
    .get(`${BACKEND_URL}/api/v1/auth/me`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Get user error: ", error.response || error);
      throw error.response?.data || error;
    });
}

// 문서 관련 함수들
export function getAllDocuments() {
  return axios.get(`${BACKEND_URL}/api/v1/documents`);
}

export function getDocumentById(id) {
  return axios.get(`${BACKEND_URL}/api/v1/documents/${id}`);
}

export function createDocument(document) {
  return axios.post(`${BACKEND_URL}/api/v1/documents`, document);
}

export function updateDocument(id, document) {
  return axios.put(`${BACKEND_URL}/api/v1/documents/${id}`, document);
}

export function deleteDocument(id) {
  return axios.delete(`${BACKEND_URL}/api/v1/documents/${id}`);
}
