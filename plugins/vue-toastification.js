import VueToast from "vue-toastification";
import "vue-toastification/dist/index.css"; // 必須加載 CSS

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueToast, {
    position: "top-center",
    timeout: 1000,
  });
});
