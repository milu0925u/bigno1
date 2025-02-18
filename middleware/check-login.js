import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { fetchAllUsers } from '~/store/st_user';
export default defineNuxtRouteMiddleware(async (to, from) => {
    const ipx = useCookie("ipx").value;

    if (process.client) {
      const lastUpdate = localStorage.getItem("updatetime");
      const today = new Date().toISOString().split("T")[0];
      const users = useState("users"); // 讀取 users 儲存在 state 中
      // 查看所有會員資料是否已經存在，保持資料一致性
      if (lastUpdate !== today || !lastUpdate) {
        fetchAllUsers();
        // 如果他們同一天，那就不用抓新資料
        // 如果他們不同就要先蟲抓一次資料
      }

      const cachedUsers = localStorage.getItem("users");
      if (cachedUsers) {
        users.value = JSON.parse(cachedUsers);
      }else{
        try {
          const response = await axios.get("/api/user");
          if (response.data.success) {
            users.value = response.data.users;
            localStorage.setItem("users", JSON.stringify(response.data.users));
            localStorage.setItem("updatetime", new Date().toISOString().split("T")[0])

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

