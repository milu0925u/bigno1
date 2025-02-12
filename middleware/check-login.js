import { jwtDecode } from 'jwt-decode';

export default defineNuxtRouteMiddleware(async (to, from) => {
    const ipx = useCookie("ipx").value;
    if (process.client) {
      const users = useState("users"); // 讀取 users 儲存在 state 中
      // 查看所有會員資料是否已經存在，保持資料一致性
      const cachedUsers = localStorage.getItem("users");
      if (cachedUsers) {
        users.value = JSON.parse(cachedUsers);
      }else{
        try {
          const response = await axios.get("/api/user");
          if (response.data.success) {
            users.value = response.data.users;
            localStorage.setItem("users", JSON.stringify(response.data.users));
          } 
        } catch (error) {
          console.error("獲取用戶資料失敗", error);
        }
      }

      // 查看目前有沒有已登入的使用者
      if (!ipx) {
        console.log('尚未登錄');
      }else{
        try {
          const decodedipx = jwtDecode(ipx);
          const users = useState("users"); 
          const user = useState("user"); 
    
          if(decodedipx){
            user.value = users.value.find((user) => user.id === decodedipx.id);
          }
        } catch (error) {
          console.error("解碼失敗", error);
        }
      }
   }});