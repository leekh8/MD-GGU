// 백엔드와 통신하기 위한 함수
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Authentication-related functions
export function register(username, email, password) {
  return axios
    .post("http://localhost:8080/api/auth/register", {
      username,
      email,
      password,
    })
    .catch((error) => {
      console.error("Registration error: ", error.response || error);
      throw error;
    });
}

export function login(username, password) {
  return axios.post(`${API_BASE_URL}/auth/login`, {
    username,
    password,
  });
}

export function logout() {
  return axios.post(`${API_BASE_URL}/auth/logout`);
}

export function getAllDocuments() {
  return axios.get(`${API_BASE_URL}/documents`);
}

export function getDocumentById(id) {
  return axios.get(`${API_BASE_URL}/documents/${id}`);
}

export function createDocument(document) {
  return axios.post(`${API_BASE_URL}/documents`, document);
}

export function updateDocument(id, document) {
  return axios.put(`${API_BASE_URL}/documents/${id}`, document);
}

export function deleteDocument(id) {
  return axios.delete(`${API_BASE_URL}/documents/${id}`);
}
