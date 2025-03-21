import axios from "axios";

// 抓取所有成員資料
export const fetchAllUsers = async (retries = 3, delay = 1000) => {
    const users = useState("users");
  try {
    const response = await axios.get("/api/user");
    if (response.data.success) {
      users.value = response.data.users;
      localStorage.setItem("users", JSON.stringify(response.data.users));
    } 
  } catch (error) {
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
// 監聽成員資料變化
export const WatcherUser = (callback) => {
  const user = useState("user");
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

// 請求數據
export const fetchChartData = async () => {
  const trail = useState("trail");
  const battle = useState("battle");

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  try {
    const response = await axios.post("/api/search", { date: today });
    if (response.data.success) {

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


