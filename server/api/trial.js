import { connectToDatabase } from "../db";
import { User, Trial } from "./model";
import moment from "moment";


// 排名
const getUserRankingData = async(users, date) => {
      // 昨日
    const startOfyesDay = new Date(moment(date).clone().subtract(1, 'days').startOf('day').toDate())
    const endOfyesDay = new Date(moment(date).clone().subtract(1, 'days').endOf('day').toDate())

    // 今日
    const startOfDay = new Date(moment(date).startOf("day").toISOString());
    const endOfDay = new Date(moment(date).endOf("day").toISOString());

    const startDateData = await Trial.find({date: { $gte: startOfDay, $lt: endOfDay }}).lean();
    const  previousDateData = await Trial.find({date: { $gte: startOfyesDay, $lt: endOfyesDay }}).lean();

  return users.map(user => {
    const userStartData = startDateData.find(data => data.id === user.id);
    const userPreviousData = previousDateData.find(data => data.id === user.id);

    const pro = userStartData && userPreviousData 
      ? (userPreviousData.ranking - userStartData.ranking) 
      : 0;

    return { ...user,...userStartData,  pro };
  });
};


// 處理 HTTP 請求
export default defineEventHandler(async (event) => {

  await connectToDatabase(); // 確保資料庫連接

  try {

    if (event.req.method === "GET") {
      const today = new Date().toISOString().split('T')[0];  
      const users = await User.find({ verify: true }).select('id username').lean();
    // 昨日
    const startOfyesDay = new Date(moment(today).clone().subtract(1, 'days').startOf('day').toDate())
    const endOfyesDay = new Date(moment(today).clone().subtract(1, 'days').endOf('day').toDate())
    const oneDayData = await Trial.find({date: { $gte: startOfyesDay, $lt: endOfyesDay }}).lean();
    // 前日
    const startOfyesDay2 = new Date(moment(today).clone().subtract(2, 'days').startOf('day').toDate())
    const endOfyesDay2 = new Date(moment(today).clone().subtract(2, 'days').endOf('day').toDate())
    let twoDayData = await Trial.find({date: { $gte: startOfyesDay2, $lt: endOfyesDay2 }}).lean();

      // 假如前日數據抓不到
      const allFalse = (Array.isArray(twoDayData) ? twoDayData : []).every(trial => !trial.value);
          if(allFalse){
            const latestTrial = await Trial.findOne({ date: { $lt:  startOfyesDay2}, value: { $exists: true, $ne: null } }).sort({ date: -1 }).lean();
            if(latestTrial){
            const lastdate = latestTrial.date
            const newstartOfyesDay = new Date(moment(lastdate).startOf("day").toISOString());
            const newendOfyesDay = new Date(moment(lastdate).endOf("day").toISOString());
            twoDayData = await Trial.find({date: { $gte: newstartOfyesDay, $lt: newendOfyesDay  }}).lean();
            }
          }

          const newoneUserData = users.map((u)=>{
            const trialData = oneDayData.find((tr)=>tr.id === u.id)
            const trialData2 = twoDayData.find((tr)=>tr.id === u.id)
            const isNewEntry = !trialData2;

            const value = trialData ? trialData.value : 0;
            const ranking =  trialData2 && trialData  ? trialData.ranking - trialData2.ranking : 0         
            let attend = false;
            if(isNewEntry && trialData && !trialData2){
              attend = true;
            }else if (trialData && trialData2 && trialData.value - trialData2.value !== 0){
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
