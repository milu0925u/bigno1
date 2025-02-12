

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
  const user = useState("user");
  // 不是會員不可使用
  if (!user.value || user.value.verify === false || user.value.position !== "管理員") {
    return navigateTo("/");
  } }
});
