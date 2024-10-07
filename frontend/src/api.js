// 프론트엔드와 백엔드 간의 통신 담당
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const BACKEND_URL =
  typeof process !== "undefined" && process.env.VITE_BACKEND_URL
    ? process.env.VITE_BACKEND_URL
    : import.meta.env.VITE_BACKEND_URL;

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // 쿠키를 포함하여 요청 보내기
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

// 쿠키에서 JWT 토큰 가져오는 함수
function getJwtTokenFromCookie() {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith("jwtToken=")) {
      return cookie.substring("jwtToken=".length, cookie.length);
    }
  }
  return null;
}

// apiClient 인스턴스에 인터셉터 추가
apiClient.interceptors.request.use(
  (config) => {
    // 쿠키에서 JWT 토큰 가져오기
    const jwtToken = getJwtTokenFromCookie();
    if (jwtToken) {
      const decodedToken = jwtDecode(jwtToken); // jwt-decode 라이브러리 사용
      if (decodedToken.exp < Date.now() / 1000) {
        // 토큰 만료
        localStorage.removeItem("token"); // 토큰 제거
        window.location.href = "/login"; // 로그인 페이지로 리다이렉트
        return Promise.reject(new Error("Token expired"));
      }
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 사용자 인증 관련 함수들
export function register(email, password) {
  return apiClient
    .post(ENDPOINTS.REGISTER, { email, password })
    .then((response) => response.data)
    .catch((error) => {
      console.error("register error:", error.response || error); // 에러 메시지 출력
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
      console.error("login error:", error.response || error); // 에러 메시지 출력
      throw error.response?.data || error;
    });
}

export function logout() {
  return apiClient
    .post(ENDPOINTS.LOGOUT)
    .then((response) => response.data)
    .catch((error) => {
      console.error("logout error:", error.response || error); // 에러 메시지 출력
      throw error.response?.data || error;
    });
}

export function getUser() {
  return apiClient
    .get(ENDPOINTS.ME)
    .then((response) => {
      if (response.success) {
        return response.data; // 사용자 정보 반환
      } else {
        throw new Error(response.data.message); // 에러 발생 시 에러 메시지와 함께 예외 throw
      }
    })
    .catch((error) => {
      console.error("getUser error:", error.response || error); // 에러 메시지 출력
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

export function getServerStatus() {
  return apiClient.get(ENDPOINTS.STATUS); // 서버 상태를 가져오는 요청
}
