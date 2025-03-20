

export default defineNuxtRouteMiddleware((to, from) => {
  console.log('驗證機制進入....');
  
  if (process.client) {
  const user = useState("user");
  // 不是會員不可使用
  if (!user.value || user.value.verify === false || user.value.position !== "管理員") {
  console.log('驗證身分失敗....');

    return navigateTo("/");
  } }
});
