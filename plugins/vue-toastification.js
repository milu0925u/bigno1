import VueToast from "vue-toastification";
import "vue-toastification/dist/index.css"; // 必須加載 CSS
import Swal from 'sweetalert2';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('swal', Swal);
  nuxtApp.vueApp.use(VueToast, {
    position: "top-center",
    timeout: 1000,
  });
});
