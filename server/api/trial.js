import { connectToDatabase } from "../db";
import { User, Trial } from "./model";
import moment from "moment";


// 處理 HTTP 請求
export default defineEventHandler(async (event) => {

  await connectToDatabase(); // 確保資料庫連接

  try {
    if (event.req.method === "GET") {
      // 抓到目前的會員
      const users = await User.find({ verify: true }).lean();

    // 前一天數據
    const yesterdayStart = moment(new Date()).clone().subtract(1, "day").startOf("day").toDate();
    const yesterdayEnd = moment(new Date()).clone().subtract(1, "day").endOf("day").toDate();

     // 前二天數據
     const yesterdayStart2 = moment(new Date()).clone().subtract(2, "day").startOf("day").toDate();
     const yesterdayEnd2= moment(new Date()).clone().subtract(2, "day").endOf("day").toDate();
 

    // 查詢前一天的數據
    const yesterdayData = await Trial.find({ date: { $gte: yesterdayStart, $lt: yesterdayEnd } }).sort({ value: -1 }).lean();
    const yesterdayData2 = await Trial.find({ date: { $gte: yesterdayStart2, $lt: yesterdayEnd2 } }).sort({ value: -1 }).lean();
  

    // 將前一天的數據依照 id 插入對應的用戶資料中
    const userData = users.map(user => {
    // 查找對應的前一天數據
    const userYesterdayData = yesterdayData.find(data => data.id === user.id)
    const userYesterdayData2 = yesterdayData2.find(data => data.id === user.id)
    return {...user,...userYesterdayData,pro:userYesterdayData2.ranking - userYesterdayData.ranking} 
  }).sort((a, b) => b.value - a.value);
  
  // 抓取今天的資料 (這裡假設你已經有今日的數據 `todayData`，可以從資料庫或其他地方取得)
  const todayStart = moment(new Date()).clone().startOf("day").toDate();
  const todayEnd = moment(new Date()).clone().endOf("day").toDate();
  // 查詢今天的數據
  const todayData = await Trial.find({ date: { $gte: todayStart, $lt: todayEnd } }).lean();
  // 沒有新資料的會員
  const missinguserData = users.map(user => {
    // 查找今天的數據是否存在
    const userTodayData = todayData.find(data => data.id === user.id);

    // 如果今天沒有資料，則將資料加進去
    if (!userTodayData) {
      return { ...user, userTodayData };  // 將今天的數據加入
    } 
  }).sort((a, b) => b.value - a.value);

    return {
      success: true,
      message: "抓取成功！",
      users:{all:userData,
        missing:missinguserData},
    };
    };

    if (event.req.method === "POST") {
      const { id, value, date, mid, type ,newdate} = await readBody(event);
      if (type === 'add'){
          const startOfDay = new Date(moment(newdate ? newdate : date).startOf("day").toISOString());
          const endOfDay = new Date(moment(newdate ? newdate : date).endOf("day").toISOString());

          // 新增進試煉
          await Trial.updateOne(
            { id: id, date: { $gte: startOfDay, $lt: endOfDay }},
            {
              $set: {
                id: id,
                value:value,
                date: newdate ? newdate : date,
                ...(mid && { reviewer: mid }),
                ranking:null,
              },
            },
            { upsert: true }
          );


          const newTrialRank = await Trial.find({ date: { $gte: startOfDay, $lt: endOfDay } }).sort({ value: -1, id: 1  }).lean();
 
          
          const bulkOps = newTrialRank.map((user, index) => ({
            updateOne: {
              filter: { id: user.id}, // 根據 id 找到對應的使用者
              update: {
                $set: {
                  ranking: index + 1, // 排名從 1 開始
                },
              },
            },
          }));

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
    console.log(e);
  }
});
