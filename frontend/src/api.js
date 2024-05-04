// 백엔드와 통신하기 위한 함수
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/documents";

export function getAllDocuments() {
  return axios.get(API_BASE_URL);
}

export function getDocumentById(id) {
  return axios.get(`${API_BASE_URL}/${id}`);
}

export function createDocument(document) {
  return axios.post(API_BASE_URL, document);
}

export function updateDocument(id, document) {
  return axios.put(`${API_BASE_URL}/${id}`, document);
}

export function deleteDocument(id) {
  return axios.delete(`${API_BASE_URL}/${id}`);
}
