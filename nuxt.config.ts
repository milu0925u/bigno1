export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  runtimeConfig: {
    mongoUri: process.env.MONGO_URI || "",
  },
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },
  vite: {
    css: {
      preprocessorMaxWorkers: true, // number of CPUs minus 1
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
