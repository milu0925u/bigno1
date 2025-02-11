export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  build: {
    transpile: ['axios', 'moment'], 
  },
  runtimeConfig: {
    mongoUri: process.env.MONGO_URI || "",
  },
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },
  vite: {
    css: {
      preprocessorMaxWorkers: true, // number of CPUs minus 1
    },
    optimizeDeps: {
      include: ['vue-toastification'], // 確保 Vite 會將此依賴包含進去
    },
   
  },
  css: [
    "@/assets/css/global.scss",
    "@fortawesome/fontawesome-free/css/all.css",
  ],
  plugins: [
    "~/plugins/vue-toastification.js", // 註冊 VueToast 插件
  ],
  nitro: {
    preset: 'vercel', // 使用 Vercel 
  },

});
