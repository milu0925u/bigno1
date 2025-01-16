import axios from "axios";
export default defineNuxtRouteMiddleware(async(to, from) => {
  if (process.client) {
    await checkUser();  
  }
});



// 確認身分
export const checkUser = async() => {
  const user = useState("user");
  const cookieUser = useCookie("ipx");
  console.log('驗證身分.........');
  console.log('抓取cookie', cookieUser); 
  
  if (!user.value && !cookieUser.value) {
  console.log('驗證失敗');
    return
  }


  console.log('驗證成功');
console.log('抓取cookie', cookieUser );
  if (!user.value && cookieUser.value) {
    const decodedUser = JSON.parse(decodeURIComponent(cookieUser.value));
    try {
      const response =  axios.post(`/api/user`, { type: 'verify', id: decodedUser.id });
      if (response.data.success) {
        console.log(response.data.users,'結果有存嗎');
        user.value = response.data.users; 
      } else {
        console.log('沒有抓到捏');
      }
    } catch (error) {
      console.error("驗證使用者時發生錯誤", error);
    }
  }
};