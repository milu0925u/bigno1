import axios from "axios";
export default defineNuxtRouteMiddleware(async(to, from) => {

  checkUser()

});




// 確認身分
export const checkUser = async () => {
  const user = useState("user");
  const cookieUser = useCookie("ipx");
  if (!user.value && !cookieUser.value) {
    return navigateTo("/login");
  }
  if (cookieUser.value) {
    const decodedUser = JSON.parse(decodeURIComponent(cookieUser.value));

    console.log(decodedUser,'decodedUser');
    
    try {
      const response = await axios.post(`/api/user`, { type: 'verify', id: decodedUser.id });

      if (response.data.success) {
        user.value = response.data.users; 
      } else {
        console.log('沒有抓到捏');
        
      }
    } catch (error) {
      console.error("驗證使用者時發生錯誤", error);
      return navigateTo("/login");  
    }
  }
};