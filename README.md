# MD-GGU 📝

마크다운 문서를 작성·관리하고, 규칙 기반(TF 빈도·정규식)으로 요약·이모지·참고링크를 자동 추출하는 풀스택 웹 애플리케이션입니다.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com)

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **마크다운 에디터** | 실시간 미리보기, WYSIWYG 툴바, 단축키(Ctrl+B/I/K…), 자동 저장(툴바·붙여넣기 편집 포함), KaTeX 수식($…$), 단어·글자 수 |
| **규칙 기반 최적화** | TF 기반 추출 요약 · 키워드→이모지 추천 · 참고링크 추출 (비로그인 사용 가능) |
| **문서 관리** | 작성한 문서 저장·수정·삭제, 최신순/이름순 정렬 |
| **에디터 연동** | 문서 상세에서 에디터로 불러와 수정 후 업데이트 |
| **JWT 인증** | Access Token(localStorage) + Refresh Token(HttpOnly Cookie), 자동 갱신 |
| **다국어** | 한국어 / English 전환 (i18next) |
| **다크모드** | 시스템 설정 독립 토글, localStorage 유지 |
| **닉네임 생성** | Python Flask 서비스 — Markov Chain 방식 (Deep Learning 모델은 실험적, 토크나이저 미포함) |

---

## 기술 스택

### Frontend
- **React 18** + Vite 5 + React Router v6
- **Tailwind CSS 3** (다크모드 class 방식)
- react-markdown · remark-gfm · remark-math · rehype-katex (KaTeX 수식)
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

## 배포 (프론트엔드)

> 🛑 **2026-11-11 까지 운영에서 Vite 개발 서버가 돌고 있었다.**
>
> `frontend/Dockerfile` 이 `CMD ["npm", "start"]` 였고 `start` 는 `vite`,
> 곧 개발 서버다. 공개 주소가 내려 주는 HTML 에 `/@vite/client` 와
> `/@react-refresh` 가 박혀 있었고 `/@vite/client` 가 HTTP 200 으로
> 응답했다. 번들도 압축도 없이 `./src/index.jsx` 를 그대로 물려 줬다.
>
> `vite.config.js` 의 `server.allowedHosts` 에 onrender 주소가 들어 있던 것이
> 그 자취다. 그 설정은 **개발 서버에만** 쓰이는 것이라, 운영에서 그것을
> 고쳐야 했다는 것 자체가 개발 서버가 돌고 있었다는 뜻이다.
>
> 같이 켜져 있던 `server.fs.strict: false` 는 **프로젝트 밖 파일까지**
> 내보내는 설정이다. 공개된 개발 서버에 그것이 걸려 있으면 파일이 새는 길이
> 된다. 그 둘을 뺐다.

지금은 빌드와 서빙이 갈려 있다. `frontend/Dockerfile` 1단계가 `vite build` 로
`dist/` 를 만들고, 2단계 nginx 가 그것만 3000 포트로 내보낸다. 2단계 이미지에는
node 도 소스도 들어가지 않는다.

### Render 쪽에서 확인할 것

저장소에 `render.yaml` 이 없어서 서비스 설정이 콘솔에 있다. **어느 방식으로
띄우는지에 따라 할 일이 다르다.**

| Render 설정 | 할 일 |
|---|---|
| Docker (Dockerfile 사용) | 할 일 없음. 다시 배포하면 위 Dockerfile 이 먹는다 |
| Node 환경 (Build, Start 명령) | Start 명령이 `npm start` 면 **개발 서버가 계속 돈다.** 아래로 바꾼다 |

Node 환경이면:

```
Build Command  npm install --legacy-peer-deps && npm run build
Start Command  npm run serve -- --host 0.0.0.0 --port $PORT
```

⚠️ `npm run serve` 는 `vite preview` 다. 개발 서버보다는 낫지만 Vite 문서가
운영용으로 만든 것이 아니라고 적어 둔 것이라 **임시 방편**이다. Docker 쪽으로
돌리는 것이 맞고, 그러면 위 nginx 2단계가 그대로 쓰인다.

🛑 점검은 설정 화면이 아니라 **내려오는 HTML 본문**으로 한다.

```bash
# 개발 서버면 이 셋이 HTML 에 박혀 있다. 전부 0 이어야 한다
curl -s https://mdggu-front.onrender.com/ | grep -c "@vite/client"
curl -s https://mdggu-front.onrender.com/ | grep -c "react-refresh"
curl -s https://mdggu-front.onrender.com/ | grep -c "src/index.jsx"

# 운영 빌드면 해시가 박힌 자산을 가리킨다. 1 이상이어야 한다
curl -s https://mdggu-front.onrender.com/ | grep -coE "assets/[A-Za-z0-9._-]+"
```

🛑 **상태 코드로 가리면 안 된다.** `/@vite/client` 가 404 인지 보는 것은 틀린
점검이다. nginx 의 SPA 되돌림(`try_files ... /index.html`)이 **없는 경로마다
index.html 을 200 으로** 주기 때문에, 개발 서버를 내린 뒤에도 그 경로는 계속
200 이다. 실제로 2026-11-11 에 그렇게 적어 뒀다가 바로잡았다. 가짜 경로 셋을
넣어 보면 전부 `200 text/html` 로 같이 나온다.

### 글꼴

`styles.css` 와 `tailwind.config.js` 가 Pretendard 를 지정해 두고 **로드하는
곳이 한 곳도 없었다**(실측 grep 0건). 모든 방문자가 OS 기본 글꼴을 보고 있었다.
지금은 `index.html` 이 동적 서브셋 CSS 를 걸어 쓰는 글자 묶음만 받는다.

🛑 **가변 판 CSS 는 글꼴 이름을 `Pretendard Variable` 로 등록한다**(비가변 판은
`Pretendard`). 링크만 걸고 선언을 안 고치면 같은 꼴로 또 안 먹는다. 그래서 두
선언 자리에 이름을 둘 다 적어 뒀고, **한쪽만 고치면 `font-sans` 를 쓴 자리와
body 가 다른 글꼴로 갈린다.**

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
