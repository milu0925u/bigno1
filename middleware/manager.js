import { useUser } from "~/store/st_user";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
  const user = useUser();
  if (!user.value) {
    return navigateTo("/");
  } else if (!user.value || user.value.position !== "管理員") {
    return navigateTo("/");
  } else if (user.value.id && user.value.position !== "管理員") {
    return navigateTo("/");
  }}
});
