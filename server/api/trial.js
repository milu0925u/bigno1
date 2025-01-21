import { connectToDatabase } from "../db";
import { User, Trial } from "./model";
import moment from "moment";



const getTrialDataRange = async (daysAgo = 0) => {
  const startOfDay = moment(new Date()).clone().subtract(daysAgo, 'days').startOf('day').toDate();
  const endOfDay = moment(new Date()).clone().subtract(daysAgo, 'days').endOf('day').toDate();
  
  const data = await Trial.find({ date: { $gte: startOfDay, $lt: endOfDay } }).sort({ value: -1 }).lean();
  return data;
};

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {

  await connectToDatabase(); // 確保資料庫連接

  try {
    if (event.req.method === "GET") {
      // 抓到目前的會員
      const users = await User.find({ verify: true }).lean();

      const todayData = await getTrialDataRange(0);
      const yesterdayData = await getTrialDataRange(1);
      const yesterdayData2 = await getTrialDataRange(2);
    
    // 首頁排行榜數據
    const userData = users.map(user => {
    const userYesterdayData = yesterdayData.find(data => data.id === user.id)
    const userYesterdayData2 = yesterdayData2.find(data => data.id === user.id)
    const pro = userYesterdayData && userYesterdayData2 ? (userYesterdayData2.ranking - userYesterdayData.ranking) : 0;
    return {...user,...userYesterdayData,pro} 
  })


    return {
      success: true,
      message: "抓取成功！",
      users:{
        homeRanking:userData,
        today:todayData,
      },
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
