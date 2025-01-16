export default defineEventHandler((to, from) => {
  const user = useState("user");
  const cookieUser = useCookie("ipx");
  if (!user.value && !cookieUser.value) {
    return navigateTo("/login");
  }

  if (cookieUser.value) {
    user.value = cookieUser.value;
  }
});
