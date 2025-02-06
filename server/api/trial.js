import { connectToDatabase } from "../db";
import { User, Trial } from "./model";
import moment from "moment";

// 依照日期搜尋 Trail 有沒有值
const getTrialDataByDate = async (dateString) => {
  const startOfDay = moment(dateString, "YYYY-MM-DD").startOf("day").toDate();
  const endOfDay = moment(dateString, "YYYY-MM-DD").endOf("day").toDate();
  
  const data = await Trial.find({ date: { $gte: startOfDay, $lt: endOfDay } }).sort({ value: -1 }).lean();
  return data;
};

// 排名
const getUserRankingData = (users, startDateData, previousDateData) => {
  return users.map(user => {
    const userStartData = startDateData.find(data => data.id === user.id);
    const userPreviousData = previousDateData.find(data => data.id === user.id);

    const pro = userStartData && userPreviousData 
      ? (userPreviousData.ranking - userStartData.ranking) 
      : 0;

    return { ...user, ...userStartData, pro };
  });
};

 // 判斷是否存在昨天的數據，若不存在則處理從最後一筆資料往前推的數據
 const getYesterdayData = async (date) => {
  let data = await getTrialDataByDate(date);
  if (data.length === 0) {
    // 抓取最後一筆資料
    const lastData = await Trial.findOne().sort({ date: -1 }).limit(1).lean();
    const lastDataDate = moment(lastData.date).format("YYYY-MM-DD"); // 轉換為 YYYY-MM-DD 格式 昨日
    const beforeyesterday = new Date(lastDataDate);
    beforeyesterday.setDate(beforeyesterday.getDate() - 1);  // 前日

    // 繼續抓取數據
    data = await getTrialDataByDate(lastDataDate);
    return { data, beforeyesterday };
  }
  return { data, beforeyesterday: null };
};

// 比對 userData 的每個 ID 的 value 是否有變化 (試煉參加與否)
const compareParticipation = (userData, yesterdayData, beforeyesterdayData) => {
  const participationStats = {
    yesp: 0,
    nop: 0
  };

  // 遍歷 userData，並比較今天與前一天的 value
  userData.forEach(user => {
    // 找出今天的 user 資料
    const todayData = yesterdayData.find(data => data.id === user.id);
    // 找出前一天的 user 資料
    const prevData = beforeyesterdayData ? beforeyesterdayData.find(data => data.id === user.id) : null;

    if (todayData && prevData) {
      // 比對今天與前一天的 value
      if (todayData.value > prevData.value) {
        participationStats.yesp += 1; // 有參加
      } else {
        participationStats.nop += 1; // 沒有參加
      }
    } else {
      // 如果今天或前一天的數據找不到，視為沒有參加
      participationStats.nop += 1;
    }
  });

  return participationStats;
};

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {

  await connectToDatabase(); // 確保資料庫連接

  try {
    if (event.req.method === "GET") {
      // 抓到目前的會員
      const users = await User.find({ verify: true }).lean();
   
      // 今天日期
      const now = new Date().toISOString().split("T")[0];  // 2025-01-01
      // 昨天日期
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);  // 2024-12-31


      // 取得昨天的數據及前日數據
    const { data: yesterdayData, beforeyesterday } = await getYesterdayData(yesterdayDate);

    let beforeyesterdayData = [];
    if (beforeyesterday) {
      beforeyesterdayData = await getTrialDataByDate(beforeyesterday);  // 前日數據
    }

    const userData = getUserRankingData(users, yesterdayData, beforeyesterdayData);

    const participationStats = compareParticipation(userData, yesterdayData, beforeyesterdayData);
    
    return {
      success: true,
      message: "抓取成功！",
      users: userData, 
      ynsers: participationStats,
    };
  };

    if (event.req.method === "POST") {
      const { id, value, date, mid, type ,newdate,radio} = await readBody(event);

      if (type === 'add'){
          const startOfDay = new Date(moment(newdate ? newdate : date).startOf("day").toISOString());
          const endOfDay = new Date(moment(newdate ? newdate : date).endOf("day").toISOString());

          // 新增進試煉
          await Trial.updateOne(
            { id: id, date: { $gte: startOfDay, $lt: endOfDay }},
            {
              $set: {
                id: id,
                value:radio == 'M' ? value*1000 : value,
                date: newdate ? newdate : date,
                ...(mid && { reviewer: mid }),
                ranking:null,
              },
            },
            { upsert: true }
          );
          
          const newTrialRank = await Trial.find({ date: { $gte: startOfDay, $lt: endOfDay } }).sort({ value: -1, id: 1  }).lean();

          const bulkOps = newTrialRank.map((user, index) => {
            
            return{
            updateOne: {
              filter: { _id: user._id}, // 根據 id 找到對應的使用者
              update: {
                $set: {
                  ranking: index + 1, // 排名從 1 開始
                },
              },
            },
          }});

          await Trial.bulkWrite(bulkOps);
      return {
        success: true,
        message: "輸入成功！",
      };
      }
    };

    // 排名沒更新時使用
    if (event.req.method === "PATCH") {
      const { targetDate} = await readBody(event);
      const startOfDay = moment(targetDate).startOf('day').toDate();
      const endOfDay = moment(targetDate).endOf('day').toDate();
    const newTrialRank = await Trial.find({ date: { $gte: startOfDay, $lt: endOfDay } }).sort({ value: -1 , _id: 1  }).lean();

    const bulkOps = newTrialRank.map((user, index) => {
      return {
      updateOne: {
        filter: { _id: user._id}, 
        update: {
          $set: {
            ranking: index+1,
          },
        },
      },
    }});

    await Trial.bulkWrite(bulkOps);
  };
  } catch (e) {
    console.log(error, "執行錯誤，請前往修改代碼");
  }
});
