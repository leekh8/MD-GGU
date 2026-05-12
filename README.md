# MD-GGU 📝

마크다운 문서를 작성·관리하고 AI 기반으로 요약·이모지·참고링크를 자동 생성하는 풀스택 웹 애플리케이션입니다.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com)

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **마크다운 에디터** | 실시간 미리보기, WYSIWYG 툴바, 단축키(Ctrl+B/I/K…), 자동 저장 |
| **AI 최적화** | TF 기반 추출 요약 · 키워드→이모지 추천 · 참고링크 추출 (비로그인 사용 가능) |
| **문서 관리** | 작성한 문서 저장·수정·삭제, 최신순/이름순 정렬 |
| **에디터 연동** | 문서 상세에서 에디터로 불러와 수정 후 업데이트 |
| **JWT 인증** | Access Token(localStorage) + Refresh Token(HttpOnly Cookie), 자동 갱신 |
| **다국어** | 한국어 / English 전환 (i18next) |
| **다크모드** | 시스템 설정 독립 토글, localStorage 유지 |
| **닉네임 생성** | Python Flask 서비스 — Markov Chain / Deep Learning 방식 |

---

## 기술 스택

### Frontend
- **React 18** + Vite 5 + React Router v6
- **Tailwind CSS 3** (다크모드 class 방식)
- react-markdown · remark-gfm · rehype-katex
- i18next · react-i18next
- Axios (인터셉터 기반 JWT 자동 갱신)
- Heroicons

### Backend (Spring Boot)
- **Spring Boot 3** · Spring Security (Stateless JWT)
- **PostgreSQL** (JPA / Hibernate)
- springdoc-openapi (Swagger UI: `/swagger-ui/index.html`)
- JWT (Access 30분 + Refresh 7일)

### Python Service (Flask)
- 닉네임 생성: Markov Chain · LSTM 기반 Deep Learning
- `/generate_nickname` 엔드포인트

### Infra
- **Docker Compose** (nginx · frontend · backend)
- Nginx 리버스 프록시

---

## 아키텍처

```
Browser
  │
  ▼
Nginx (:80)
  ├── /          → React SPA (:3000)
  └── /api/**    → Spring Boot (:8080)
                      └── /api/v1/optimize → Spring 내부 처리
                      └── DB: PostgreSQL (:5432)

Python Flask (:5000)  ← MyPage 닉네임 생성 시 직접 호출
```

---

## 빠른 시작

### 사전 요구사항
- Docker & Docker Compose
- (로컬 개발) Node.js 20+, JDK 17+, Python 3.10+, PostgreSQL 16

### 1. 환경변수 설정

```bash
# 프로젝트 루트
cp .env.example .env

# 프론트엔드
cp frontend/.env.example frontend/.env

# Spring Boot
cp backend/mdggu-backend/.env.example backend/mdggu-backend/.env
```

각 파일을 열어 값을 채워주세요.

### 2. Docker Compose로 실행

```bash
docker-compose up --build
```

접속: http://localhost

### 3. 로컬 개발 환경

**Frontend**
```bash
cd frontend
npm install
npm run start      # http://localhost:5173
```

**Backend**
```bash
cd backend/mdggu-backend
./gradlew bootRun
# http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui/index.html
```

**Python Service**
```bash
cd backend/python-service
pip install -r requirements.txt
python app.py      # http://localhost:5000
```

---

## 환경변수 요약

| 위치 | 변수 | 설명 |
|------|------|------|
| `frontend/.env` | `VITE_BACKEND_URL` | Spring Boot 서버 주소 |
| `frontend/.env` | `VITE_PYTHON_URL` | Python Flask 서버 주소 |
| `application.properties` | `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL |
| `application.properties` | `SPRING_DATASOURCE_USERNAME` | DB 사용자명 |
| `application.properties` | `SPRING_DATASOURCE_PASSWORD` | DB 비밀번호 |
| `application.properties` | `jwt.secret` | JWT 서명 키 (256bit 이상) |
| `application.properties` | `jwt.access-token-expiration` | Access Token 만료(ms) |
| `application.properties` | `jwt.refresh-token-expiration` | Refresh Token 만료(ms) |
| `application.properties` | `frontend.url` | CORS 허용 프론트엔드 URL |
| `application.properties` | `python.url` | CORS 허용 Python 서비스 URL |

---

## API 문서

서버 실행 후 Swagger UI에서 전체 API 확인 가능:

```
http://localhost:8080/swagger-ui/index.html
```

주요 엔드포인트:

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| POST | `/api/v1/auth/register` | ❌ | 회원가입 |
| POST | `/api/v1/auth/login` | ❌ | 로그인 |
| POST | `/api/v1/auth/refresh` | ❌ | 토큰 갱신 |
| GET | `/api/v1/auth/me` | ✅ | 내 정보 |
| GET | `/api/v1/documents` | ✅ | 문서 목록 |
| POST | `/api/v1/documents` | ✅ | 문서 생성 |
| PUT | `/api/v1/documents/{id}` | ✅ | 문서 수정 |
| DELETE | `/api/v1/documents/{id}` | ✅ | 문서 삭제 |
| POST | `/api/v1/optimize` | ❌ | 마크다운 최적화 |
| POST | `/api/v1/optimize/{id}` | ✅ | 문서 최적화 후 저장 |

---

## 에디터 단축키

| 단축키 | 기능 |
|--------|------|
| `Ctrl + B` | 굵게 |
| `Ctrl + I` | 이탤릭 |
| `Ctrl + K` | 링크 삽입 |
| `Ctrl + H` | 제목 |
| `Ctrl + Shift + M` | 코드 블록 |
| `Ctrl + S` | 문서로 저장 |
| `Ctrl + Z` | 실행 취소 |
| `Alt + H` | 단축키 가이드 |

---

## 프로젝트 구조

```
MD-GGU/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/        # Editor, Header, DocumentList 등
│   │   ├── pages/             # LoginPage, SignupPage, MyPage 등
│   │   ├── api.js             # Axios 클라이언트 + 인터셉터
│   │   └── styles.css         # Tailwind + 공통 컴포넌트
│   └── public/locales/        # i18n 번역 파일 (ko, en)
│
├── backend/
│   ├── mdggu-backend/         # Spring Boot 3
│   │   └── src/main/java/com/mdggu/
│   │       ├── config/        # Security, JWT, Swagger
│   │       ├── controller/    # Auth, Document, Optimize
│   │       ├── service/       # 비즈니스 로직
│   │       └── model/         # JPA Entity
│   └── python-service/        # Flask 닉네임 생성 서비스
│
├── nginx/                     # Nginx 설정
├── docker-compose.yml
└── README.md
```

---

## 라이선스

MIT License
