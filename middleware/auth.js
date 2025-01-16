import axios from "axios";
export default defineNuxtRouteMiddleware(async(to, from) => {
  checkUser()
});



// 確認身分
export const checkUser = async () => {

  if (!user.value && !cookieUser.value) {
    return
  }

  const user = useState("user");
  const cookieUser = useCookie("ipx");

  if (!user.value && cookieUser.value) {
    const decodedUser = JSON.parse(decodeURIComponent(cookieUser.value));
    
    try {
      const response = await axios.post(`/api/user`, { type: 'verify', id: decodedUser.id });
      if (response.data.success) {
        console.log(response.data.users,'WWWW');
        user.value = response.data.users; 
      } else {
        console.log('沒有抓到捏');
      }
    } catch (error) {
      console.error("驗證使用者時發生錯誤", error);
    }
  }
};