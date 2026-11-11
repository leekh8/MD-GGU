# 🛑 **전에는 운영에서 개발 서버가 돌고 있었다** (2026-11-11 실측).
#
#    `CMD ["npm", "start"]` 였고 package.json 의 `start` 는 `vite` 다. 즉
#    배포된 컨테이너가 Vite 개발 서버였다. 공개 주소가 내려 주는 HTML 에
#    `/@vite/client` 와 `/@react-refresh` 가 박혀 있었고, `/@vite/client` 가
#    HTTP 200 으로 응답했다. 번들도 압축도 없이 `./src/index.jsx` 를 그대로
#    물려 주고 있었다.
#
#    누가 vite.config 의 `server.allowedHosts` 에 `mdggu-front.onrender.com`
#    을 더해 둔 것이 그 자취다. 그 설정은 **개발 서버에만** 쓰이는 것이라,
#    운영에서 그것을 고쳐야 했다는 것 자체가 개발 서버가 돌고 있었다는 뜻이다.
#
#    같이 켜져 있던 `server.fs.strict: false` 는 프로젝트 밖 파일까지 내보내는
#    설정이다. 공개된 개발 서버에 그것이 걸려 있으면 파일이 새는 길이 된다.
#    그 둘을 vite.config 에서 뺐다.
#
#    그래서 빌드와 서빙을 가른다. 아래 1단계가 빌드하고 2단계는 정적 파일만
#    내보낸다. 2단계 이미지에는 node 도 소스도 들어가지 않는다.

# ----------------------------------------------------------------- 1. 빌드
FROM node:22-alpine AS build
WORKDIR /app

# 🛑 package 파일만 먼저 넣는다. 소스가 바뀌어도 의존성 층은 캐시가 산다
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# 🛑 빌드 산출물에 index.html 이 들어가야 한다. vite.config 의
#    `build.rollupOptions.input` 이 `./src/index.jsx` 를 가리키고 있었는데,
#    입력이 JS 면 Vite 가 HTML 을 처리하지 않아 자산 이름이 HTML 에
#    꽂히지 않는다. 지금은 `index.html` 을 입력으로 둔다.
RUN npm run build && test -f dist/index.html

# ------------------------------------------------------------- 2. 내보내기
FROM nginx:alpine
# 기본 설정을 치운다. 그대로 두면 80 포트 기본 사이트가 같이 떠서
# 어느 쪽이 응답했는지 가리기 어려워진다.
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
