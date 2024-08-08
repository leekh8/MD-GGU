// 프론트엔드와 백엔드 간의 통신 담당
import axios from "axios";

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL;

// Authentication-related functions
export function register(username, email, password) {
  return axios
    .post(`${BACKEND_URL}/api/auth/register`, {
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
  return axios.post(`${BACKEND_URL}/auth/login`, {
    username,
    password,
  });
}

export function logout() {
  return axios.post(`${BACKEND_URL}/auth/logout`);
}

export function getAllDocuments() {
  return axios.get(`${BACKEND_URL}/documents`);
}

export function getDocumentById(id) {
  return axios.get(`${BACKEND_URL}/documents/${id}`);
}

export function createDocument(document) {
  return axios.post(`${BACKEND_URL}/documents`, document);
}

export function updateDocument(id, document) {
  return axios.put(`${BACKEND_URL}/documents/${id}`, document);
}

export function deleteDocument(id) {
  return axios.delete(`${BACKEND_URL}/documents/${id}`);
}
