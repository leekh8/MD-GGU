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

# 🛑 **Vite 는 `import.meta.env.VITE_*` 를 빌드 시점에 번들에 박는다.**
#    런타임 환경변수로는 들어가지 않는다.
#
#    전에는 운영에서 개발 서버가 돌아서 컨테이너가 뜰 때 값을 읽었고, 그래서
#    이 성질이 가려져 있었다. 빌드로 옮기자마자 `baseURL` 이 undefined 가
#    됐다 (2026-11-11 실측: 배포된 번들에서 백엔드 주소 **0건**). 화면은
#    그대로 뜨고 API 만 조용히 죽는다.
#
#    Render 는 대시보드 환경변수를 build arg 로 넣어 준다. 공식 문서:
#    "automatically translates those values to Docker build arguments that are
#    available during your image's build process" / "Render injects your
#    service's environment variables as build args with the same keys and
#    values." 다만 **ARG 선언이 있어야** 받는다.
#
# 🛑 비밀은 이 길로 보내지 않는다. 공식 문서가 "do not reference any build
#    arguments that contain sensitive values" 라고 적어 뒀다. 아래 둘은 어차피
#    브라우저 번들에 그대로 박히는 공개 주소라 괜찮다. 비밀이 필요해지면
#    secret file 과 `--mount=type=secret` 쪽이다.
ARG VITE_BACKEND_URL
ARG VITE_PYTHON_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_PYTHON_URL=$VITE_PYTHON_URL

# 🛑 **비면 빌드를 멈춘다.** 비어도 빌드는 통과하고 화면도 뜨기 때문에,
#    막지 않으면 「배포는 성공했는데 아무것도 안 되는」 상태가 조용히 나간다.
#    11-11 에 실제로 그렇게 한 번 나갔다.
RUN test -n "$VITE_BACKEND_URL" || { \
      echo "VITE_BACKEND_URL 이 비었다. Vite 는 이 값을 빌드 때 번들에 박는다."; \
      echo "Render 라면 대시보드에 값을 넣고 **Save, rebuild, and deploy** 로"; \
      echo "다시 빌드한다. 'Save and deploy' 는 기존 빌드를 그대로 재배포해서"; \
      echo "번들이 안 바뀐다 (공식 문서의 두 단추 차이다)."; \
      exit 1; }

# 🛑 빌드 산출물에 index.html 이 들어가야 한다. vite.config 의
#    `build.rollupOptions.input` 이 `./src/index.jsx` 를 가리키고 있었는데,
#    입력이 JS 면 Vite 가 HTML 을 처리하지 않아 자산 이름이 HTML 에
#    꽂히지 않는다. 지금은 `index.html` 을 입력으로 둔다.
RUN npm run build && test -f dist/index.html

# 🛑 **주소가 번들에 실제로 박혔는지 센다.** 위 `test -n` 은 arg 가 왔는지만
#    보고, 이것은 Vite 가 그것을 정말 심었는지 본다. 둘은 다른 질문이다 -
#    변수 이름을 바꾸거나 치환이 빗나가면 arg 는 있는데 번들은 비어 있다.
RUN grep -rFq "$VITE_BACKEND_URL" dist/assets/ \
    || { echo "번들에 VITE_BACKEND_URL 이 안 박혔다. 변수 이름과 쓰는 자리를 본다."; exit 1; }

# ------------------------------------------------------------- 2. 내보내기
FROM nginx:alpine
# 기본 설정을 치운다. 그대로 두면 80 포트 기본 사이트가 같이 떠서
# 어느 쪽이 응답했는지 가리기 어려워진다.
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
