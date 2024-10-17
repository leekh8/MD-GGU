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
  xsrfCookieName: "jwtToken", // 서버에서 설정한 쿠키 이름과 일치해야 함
  xsrfHeaderName: "X-XSRF-TOKEN", // 기본값 사용
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
  },
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
  REFRESH: "/refresh",
};

// API 요청 시 Access Token 만료 여부 확인 및 갱신
apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        if (decodedToken.exp < Date.now() / 1000) {
          // Access Token 만료됨
          const newAccessToken = await refreshAccessToken(); // 새로운 Access Token 발급
          config.headers.Authorization = `Bearer ${newAccessToken}`; // 헤더 업데이트
          const newCsrfToken = localStorage.getItem("csrfToken"); // 갱신된 CSRF Token 가져오기
          config.headers["X-CSRF-TOKEN"] = newCsrfToken; // CSRF Token 헤더 업데이트
        }
      } catch (error) {
        console.error("Error refreshing access token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 쿠키에서 JWT 토큰 가져오는 함수
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// 사용자 인증 관련 함수들
export function register(email, password) {
  return apiClient
    .post(ENDPOINTS.REGISTER, { email, password })
    .then((response) => response.data)
    .catch((error) => {
      console.error("API - Error in register:", error.response || error); // 에러 메시지 출력
      throw error.response?.data || error;
    });
}

export function login(email, password) {
  return apiClient
    .post(ENDPOINTS.LOGIN, {
      email,
      password,
    })
    .then((response) => {
      const { data } = response; // 응답 데이터 추출
      const { accessToken } = data; // Access Token 추출

      // 응답 헤더에서 refreshToken과 csrfToken 추출
      const refreshToken = getCookie("refreshToken");
      const csrfToken = response.headers["x-csrf-token"];

      // Access Token, Refresh Token, CSRF Token 확인
      console.log("API - accessToken in login #1:", accessToken);
      console.log("API - refreshToken in login #1:", refreshToken);
      console.log("API - csrfToken in login #1:", csrfToken);

      // 응답 데이터에 refreshToken과 csrfToken 추가
      data.refreshToken = refreshToken;
      data.csrfToken = csrfToken;

      console.log("API - accessToken in login #3:", accessToken);
      console.log("API - refreshToken in login #3:", refreshToken);
      console.log("API - csrfToken in login #3:", csrfToken);

      return data; // 수정된 응답 데이터 반환
    })
    .catch((error) => {
      console.error("API - Error in login:", error.response || error); // 에러 메시지 출력
      if (error.response && error.response.data) {
        // error.response가 있고 data 속성이 있는지 확인
        throw error.response.data;
      } else {
        throw error; // error.response가 없으면 원래 에러 throw
      }
    });
}

export function logout() {
  return apiClient
    .post(ENDPOINTS.LOGOUT)
    .then((response) => response.data)
    .catch((error) => {
      console.error("API - Error in logout:", error.response || error); // 에러 메시지 출력
      throw error.response?.data || error;
    });
}

export function getUser(config = {}) {
  const accessToken = localStorage.getItem("accessToken"); // localStorage에서 Access Token 가져오기
  const csrfToken = localStorage.getItem("csrfToken"); // localStorage에서 CSRF Token 가져오기

  if (accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
      "X-CSRF-TOKEN": csrfToken, // CSRF Token 헤더에 추가
    };

    return apiClient
      .get(ENDPOINTS.ME, config)
      .then((response) => {
        if (response.success) {
          return response.data; // 사용자 정보 반환
        } else {
          throw new Error(response.message); // 에러 발생 시 에러 메시지와 함께 예외 throw
        }
      })
      .catch((error) => {
        console.error("API - Error in getUser:", error.response || error); // 에러 메시지 출력
        throw error.response?.data || error;
      });
  }
}

export const apiUpdateUser = async (updatedUser) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const csrfToken = localStorage.getItem("csrfToken");

    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-CSRF-TOKEN": csrfToken,
      },
    };

    const response = await apiClient.put(ENDPOINTS.ME, updatedUser, config);
    return response.data;
  } catch (error) {
    console.error("API - Error in updateUser:", error.response || error);
    throw error.response?.data || error;
  }
};

// Access Token 갱신 함수
const refreshAccessToken = async () => {
  try {
    const response = await apiRefreshToken(); // Refresh Token을 사용하여 Access Token 갱신 API 호출
    if (response.success) {
      const { accessToken, csrfToken } = response.data; // response.data에서 csrfToken 추출
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("csrfToken", csrfToken); // csrfToken 값만 저장
      return accessToken;
    } else {
      // Refresh Token이 유효하지 않은 경우 로그아웃 처리
      logout();
      throw new Error("Refresh token invalid");
    }
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    throw error;
  }
};

export function apiRefreshToken() {
  const refreshToken = localStorage.getItem("refreshToken"); // localStorage에서 Refresh Token 가져오기
  return apiClient.post(ENDPOINTS.REFRESH, { refreshToken }); // Refresh Token을 요청 본문에 포함
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
