import { connectToDatabase } from "../db";
import { User, Trial } from "./model";
import moment from "moment";


  // 定義回溯函數
  const findLatestTrialDate = async (date) => {
    const latestTrial = await Trial.findOne({
      date: { $lt: date },
      value: { $exists: true, $ne: null }
    }).sort({ date: -1 }).lean();
    return latestTrial ? latestTrial.date : null;
  };



// 處理 HTTP 請求
export default defineEventHandler(async (event) => {

  await connectToDatabase(); // 確保資料庫連接

  try {

    if (event.req.method === "GET") {
      const today = new Date().toISOString().split('T')[0];  
      const users = await User.find({ verify: true }).select('id username').lean();
   // 取得當天的資料
  let startOfToday = new Date(moment(today).startOf("day").toISOString());
  let endOfToday = new Date(moment(today).endOf("day").toISOString());
  let oneDayData = await Trial.find({ date: { $gte: startOfToday, $lt: endOfToday } }).lean();

  // 如果當日資料為空，回溯到最近有數據的日期
  if (!oneDayData.length) {
    const lastDate = await findLatestTrialDate(today);
    if (lastDate) {
      startOfToday = new Date(moment(lastDate).startOf("day").toISOString());
      endOfToday = new Date(moment(lastDate).endOf("day").toISOString());
      oneDayData = await Trial.find({ date: { $gte: startOfToday, $lt: endOfToday } }).lean();
    }
  }

  // 取得前一天的資料
  let startOfPrevDay = new Date(moment(startOfToday).clone().subtract(1, "days").startOf("day").toISOString());
  let endOfPrevDay = new Date(moment(startOfToday).clone().subtract(1, "days").endOf("day").toISOString());
  let twoDayData = await Trial.find({ date: { $gte: startOfPrevDay, $lt: endOfPrevDay } }).lean();

  // 如果前日資料為空，再回溯最近一次有數據的日期
  if (!twoDayData.length) {
    const lastPrevDate = await findLatestTrialDate(startOfPrevDay);
    if (lastPrevDate) {
      startOfPrevDay = new Date(moment(lastPrevDate).startOf("day").toISOString());
      endOfPrevDay = new Date(moment(lastPrevDate).endOf("day").toISOString());
      twoDayData = await Trial.find({ date: { $gte: startOfPrevDay, $lt: endOfPrevDay } }).lean();
    }
  }

  const newoneUserData = users.map((u) => {
    const trialData = oneDayData.find((tr) => tr.id === u.id);
    const trialData2 = twoDayData.find((tr) => tr.id === u.id);
    const isNewEntry = !trialData2;

    const value = trialData ? trialData.value : 0;
    const ranking = trialData2 && trialData ? trialData.ranking - trialData2.ranking : 0;
    let attend = false;

    if (isNewEntry && trialData && !trialData2) {
      attend = true;
    } else if (trialData && trialData2 && trialData.value - trialData2.value !== 0) {
      attend = true;
    }

            return {
              id:u.id,
              username:u.username,
              value:value,
              attend:attend,
              ranking:ranking
            }
          })

      return {
            success: true,
            message: "抓取成功！",
            users: newoneUserData,
          };
    }

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
