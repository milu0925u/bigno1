import axios from "axios";
export const useUser = () => useState("user", () => null);
export const useUsers = () => useState("users", () => []);


export const fetchAllUsers = async (retries = 3, delay = 1000) => {
  try {
    const response = await axios.get("/api/user");
    const users = useUsers();
    if (response.data.success) {
      users.value = response.data.users;
      localStorage.setItem("users", JSON.stringify(response.data.users));
    } 
  } catch (error) {
    console.log(error, "抓取所有成員資料失敗，請重新抓取！");
    const cachedUsers = localStorage.getItem("users");
    if (cachedUsers) {
      console.log("從 localStorage 加載用戶數據");
      users.value = JSON.parse(cachedUsers);
    }
    if (error.response && error.response.status === 503) {
      console.log(`正在重試... 剩餘次數: ${retries}`);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay)); // 延遲一段時間
        return fetchAllUsers(retries - 1, delay); // 重新調用函數，減少重試次數
      } else {
        console.log("重試次數已達上限，請稍後再試！");
      }
    }
  }
};




export const WatcherUser = (callback) => {
  const user = useUser();
  watch(
    () => user.value, 
    (newUser, oldUser) => {
      if (callback && typeof callback === "function") {
        callback(newUser, oldUser);
      }
    },
    { immediate: true } // 確保初始執行
  );
};

export const useTrail = () => useState("trail", () => []);
export const useBattle = () => useState("battle", () => []);

// 請求數據
export const fetchChartData = async () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const trail = useTrail("trail");
  const battle = useBattle("battle");
  try {
    const response = await axios.post("/api/search", { date: today });
    if (response.data.success) {
      trail.value = [
        response.data.data.trailY.length,
        response.data.data.trailN.length,
      ];
      battle.value = [
        response.data.data.battleY.length,
        response.data.data.battleN.length,
        response.data.data.dayoff.length,
      ];
    }
  } catch (error) {
    console.error(error, "API request failed");
  }
};


