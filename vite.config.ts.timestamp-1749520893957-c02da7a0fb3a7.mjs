// vite.config.ts
import { defineConfig, loadEnv } from "file:///E:/Bolt_sandbox/gigs/v25_gigsaicreation_frontend/node_modules/vite/dist/node/index.js";
import react from "file:///E:/Bolt_sandbox/gigs/v25_gigsaicreation_frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import qiankun from "file:///E:/Bolt_sandbox/gigs/v25_gigsaicreation_frontend/node_modules/vite-plugin-qiankun/dist/index.js";
import * as cheerio from "file:///E:/Bolt_sandbox/gigs/v25_gigsaicreation_frontend/node_modules/cheerio/dist/esm/index.js";
var __vite_injected_original_dirname = "E:\\Bolt_sandbox\\gigs\\v25_gigsaicreation_frontend";
var removeReactRefreshScript = () => {
  return {
    name: "remove-react-refresh",
    transformIndexHtml(html) {
      const $ = cheerio.load(html);
      $('script[src="/@react-refresh"]').remove();
      return $.html();
    }
  };
};
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "https://gigsai.harx.ai/",
    plugins: [
      react({
        jsxRuntime: "classic"
      }),
      qiankun("app6", {
        useDevMode: true
      }),
      removeReactRefreshScript()
      // Add the script removal plugin
    ],
    define: {
      "import.meta.env": env
    },
    server: {
      port: 5179,
      cors: true,
      hmr: false,
      fs: {
        strict: true
        // Ensure static assets are correctly resolved
      }
    },
    build: {
      target: "esnext",
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          format: "umd",
          name: "app6",
          entryFileNames: "index.js",
          // Fixed name for the JS entry file
          chunkFileNames: "chunk-[name].js",
          // Fixed name for chunks
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith(".css")) {
              return "index.css";
            }
            return "[name].[ext]";
          }
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxCb2x0X3NhbmRib3hcXFxcZ2lnc1xcXFx2MjVfZ2lnc2FpY3JlYXRpb25fZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXEJvbHRfc2FuZGJveFxcXFxnaWdzXFxcXHYyNV9naWdzYWljcmVhdGlvbl9mcm9udGVuZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovQm9sdF9zYW5kYm94L2dpZ3MvdjI1X2dpZ3NhaWNyZWF0aW9uX2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgcWlhbmt1biBmcm9tICd2aXRlLXBsdWdpbi1xaWFua3VuJztcclxuaW1wb3J0ICogYXMgY2hlZXJpbyBmcm9tICdjaGVlcmlvJztcclxuXHJcbi8vIFBsdWdpbiB0byByZW1vdmUgUmVhY3QgUmVmcmVzaCBwcmVhbWJsZVxyXG5jb25zdCByZW1vdmVSZWFjdFJlZnJlc2hTY3JpcHQgPSAoKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdyZW1vdmUtcmVhY3QtcmVmcmVzaCcsXHJcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbDogYW55KSB7XHJcbiAgICAgIGNvbnN0ICQgPSBjaGVlcmlvLmxvYWQoaHRtbCk7XHJcbiAgICAgICQoJ3NjcmlwdFtzcmM9XCIvQHJlYWN0LXJlZnJlc2hcIl0nKS5yZW1vdmUoKTtcclxuICAgICAgcmV0dXJuICQuaHRtbCgpO1xyXG4gICAgfSxcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYmFzZTogJ2h0dHBzOi8vZ2lnc2FpLmhhcnguYWkvJyxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgcmVhY3Qoe1xyXG4gICAgICAgIGpzeFJ1bnRpbWU6ICdjbGFzc2ljJyxcclxuICAgICAgfSksXHJcbiAgICAgIHFpYW5rdW4oJ2FwcDYnLCB7XHJcbiAgICAgICAgdXNlRGV2TW9kZTogdHJ1ZSxcclxuICAgICAgfSksXHJcbiAgICAgIHJlbW92ZVJlYWN0UmVmcmVzaFNjcmlwdCgpLCAvLyBBZGQgdGhlIHNjcmlwdCByZW1vdmFsIHBsdWdpblxyXG4gICAgXSxcclxuXHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgJ2ltcG9ydC5tZXRhLmVudic6IGVudixcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogNTE3OSxcclxuICAgICAgY29yczogdHJ1ZSxcclxuICAgICAgaG1yOiBmYWxzZSxcclxuICAgICAgZnM6IHtcclxuICAgICAgICBzdHJpY3Q6IHRydWUsIC8vIEVuc3VyZSBzdGF0aWMgYXNzZXRzIGFyZSBjb3JyZWN0bHkgcmVzb2x2ZWRcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICB0YXJnZXQ6ICdlc25leHQnLFxyXG4gICAgICBjc3NDb2RlU3BsaXQ6IGZhbHNlLFxyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICBmb3JtYXQ6ICd1bWQnLFxyXG4gICAgICAgICAgbmFtZTogJ2FwcDYnLFxyXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdpbmRleC5qcycsIC8vIEZpeGVkIG5hbWUgZm9yIHRoZSBKUyBlbnRyeSBmaWxlXHJcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2NodW5rLVtuYW1lXS5qcycsIC8vIEZpeGVkIG5hbWUgZm9yIGNodW5rc1xyXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcclxuICAgICAgICAgICAgLy8gRW5zdXJlIENTUyBmaWxlcyBhcmUgY29uc2lzdGVudGx5IG5hbWVkXHJcbiAgICAgICAgICAgIGlmIChhc3NldEluZm8ubmFtZS5lbmRzV2l0aCgnLmNzcycpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICdpbmRleC5jc3MnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAnW25hbWVdLltleHRdJzsgLy8gRGVmYXVsdCBmb3Igb3RoZXIgYXNzZXQgdHlwZXNcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH07XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBVLFNBQVMsY0FBYyxlQUFlO0FBQ2hYLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxhQUFhO0FBQ3BCLFlBQVksYUFBYTtBQUp6QixJQUFNLG1DQUFtQztBQU96QyxJQUFNLDJCQUEyQixNQUFNO0FBQ3JDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLG1CQUFtQixNQUFXO0FBQzVCLFlBQU0sSUFBWSxhQUFLLElBQUk7QUFDM0IsUUFBRSwrQkFBK0IsRUFBRSxPQUFPO0FBQzFDLGFBQU8sRUFBRSxLQUFLO0FBQUEsSUFDaEI7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFFM0MsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLFFBQ0osWUFBWTtBQUFBLE1BQ2QsQ0FBQztBQUFBLE1BQ0QsUUFBUSxRQUFRO0FBQUEsUUFDZCxZQUFZO0FBQUEsTUFDZCxDQUFDO0FBQUEsTUFDRCx5QkFBeUI7QUFBQTtBQUFBLElBQzNCO0FBQUEsSUFFQSxRQUFRO0FBQUEsTUFDTixtQkFBbUI7QUFBQSxJQUNyQjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLE1BQ0wsSUFBSTtBQUFBLFFBQ0YsUUFBUTtBQUFBO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLGNBQWM7QUFBQSxNQUNkLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLE1BQU07QUFBQSxVQUNOLGdCQUFnQjtBQUFBO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUE7QUFBQSxVQUNoQixnQkFBZ0IsQ0FBQyxjQUFjO0FBRTdCLGdCQUFJLFVBQVUsS0FBSyxTQUFTLE1BQU0sR0FBRztBQUNuQyxxQkFBTztBQUFBLFlBQ1Q7QUFDQSxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxNQUNwQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
