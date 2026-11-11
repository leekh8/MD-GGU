import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const port = parseInt(process.env.VITE_PORT) || 3000;

export default defineConfig({
  publicDir: path.resolve(__dirname, "public"), // public 폴더 경로를 명시적으로 지정
  plugins: [react()],
  // 🛑 이 묶음은 **개발 서버에만** 쓰인다. 운영은 Dockerfile 2단계의 nginx 가
  //    빌드 산출물을 내보낸다. 2026-11-11 까지는 운영에서 이 개발 서버가
  //    돌고 있었다 (자취와 까닭은 Dockerfile 주석).
  server: {
    port: port,
    // `open: true` 를 뺐다. 컨테이너 안에는 열 브라우저가 없다
    host: true,
    // `allowedHosts` 에 onrender 주소가 있던 것이 운영에서 개발 서버가
    // 돌았다는 자취다. 그 설정은 개발 서버에만 쓰인다. 지금은 로컬만 둔다
    allowedHosts: ["localhost", "127.0.0.1"],
    watch: {
      usePolling: true,
    },
    // 🛑 `fs: { strict: false }` 를 뺐다. 프로젝트 **밖** 파일까지 내보내는
    //    설정이라, 개발 서버가 공개 주소에 떠 있던 동안 파일이 새는 길이었다.
    //    프로젝트 밖 파일을 물려야 할 일이 생기면 `fs.allow` 로 **그 경로만**
    //    연다. 통째로 열지 않는다.
    //
    // `historyApiFallback` 도 뺐다. **vite 옵션이 아니라** 아무 일도 하지
    //    않았다 (CRA 시절 이름이다). SPA 되돌림은 개발에서는 vite 가 기본으로
    //    하고, 운영에서는 nginx.conf 의 `try_files` 가 한다.
  },
  build: {
    rollupOptions: {
      // 🛑 입력은 **HTML** 이어야 한다. `./src/index.jsx` 로 두면 Vite 가
      //    index.html 을 처리하지 않아서, 해시가 박힌 자산 이름이 HTML 에
      //    꽂히지 않는다. 빌드는 통과하고 화면만 비어 있는 꼴이 된다.
      input: "./index.html",
    },
    esbuild: {
      loader: {
        ".js": "jsx",
        ".jsx": "jsx",
        ".ts": "tsx",
        ".tsx": "tsx",
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
        ".jsx": "jsx",
        ".ts": "tsx",
        ".tsx": "tsx",
      },
    },
  },
});
