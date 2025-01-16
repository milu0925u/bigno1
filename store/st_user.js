import axios from "axios";
export const useUser = () => useState("user", () => null);
export const useUsers = () => useState("users", () => []);

export const fetchAllUsers = async () => {
  try {
    const response = await axios.get("/api/user");
    const users = useUsers();
    if (response.data.success) {
      users.value = response.data.users;
    } else {
      console.log(response.data.message);
    }
  } catch (error) {
    console.log(error, "錯誤");
  }
};
export const WatcherUser = (callback) => {
  const user = useUser();
  watch(
    () => user.value, // 監聽 user 的變化
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


