import { connectToDatabase } from "../db";
import { User, Trial, Dayoff, Battlefield } from "./model";
import moment from "moment";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {

  await connectToDatabase(); // 確保資料庫連接


  if (event.req.method === "GET") {

    const battle = await Battlefield.find({}, {  uid: 1, attend: 1, date: 1 }).lean();

    // Set 取得不重複的日期
    const uniqueDates = [...new Set(battle.map(b => b.date.toISOString().split("T")[0]))];

      // Set 取得不重複的ID
    const uids = [...new Set(battle.map(b => b.uid))]; 

    // 一次查詢所有 verify = true 的用戶
const users = await User.find({ id: { $in: uids }, verify: true }).lean();
const verifiedUids = new Set(users.map(user => user.id)); // 用 Set() 加快查詢速度

const BattleX = uids.map(uid => {
  const attendances = uniqueDates.map(date => {
    const found = battle.find(b => b.uid === uid && moment(b.date).format("YYYY-MM-DD") === date);
    return verifiedUids.has(uid) ? (found ? found.attend : 'nodata') : 'leave';
  });

  return { uid, attendance: attendances };
});

// 過濾掉 'leave' 的用戶
const newBattle = BattleX.filter(v => !v.attendance.includes('leave'));

return {
  success: true,
  message: "取得結果",
  data: { days: uniqueDates, data: newBattle },
};

  }

  if (event.req.method === "POST") {

    const { date } = await readBody(event);

    console.log(date,'date');
    
    // 昨日
    // const startOfyesDay = new Date(moment(date).clone().subtract(1, 'days').startOf('day').toDate())
    // const endOfyesDay = new Date(moment(date).clone().subtract(1, 'days').endOf('day').toDate())

    // 今日
    const startOfDay = new Date(moment(date).startOf("day").toISOString());
    const endOfDay = new Date(moment(date).endOf("day").toISOString());

    const battlesdata = await Battlefield.find({date: { $gte: startOfDay, $lt: endOfDay }}).lean();
    const dayoffsdata = await Dayoff.find({date: { $gte: startOfDay, $lt: endOfDay },verify: true}).lean();
    // 戰場出席/未出席 (有請假要扣除)
    const trueBattleData = battlesdata.filter((item) => item.attend === true && !dayoffsdata.some((dayoff) => dayoff.uid === item.uid));
    const falseBattleData = battlesdata.filter((item) => item.attend === false && !dayoffsdata.some((dayoff) => dayoff.uid === item.uid));


    // const trialsdata = await Trial.find({date: { $gte: startOfDay, $lt: endOfDay }}).lean();
    // let trialsyesdata = await Trial.find({date: { $gte: startOfyesDay, $lt: endOfyesDay }}).lean();

    // 假如昨日的是空陣列
    // const allFalse = trialsyesdata.every(trial => !trial.value); 
    // if(allFalse){
    //   const latestTrial = await Trial.findOne({ date: { $lt: startOfDay }, value: { $exists: true, $ne: null } }).sort({ date: -1 }).lean();
    //   const lastdate = latestTrial.date
      
    //   const newstartOfyesDay = new Date(moment(lastdate).startOf("day").toISOString());
    //   const newendOfyesDay = new Date(moment(lastdate).endOf("day").toISOString());
      
    //   trialsyesdata = await Trial.find({date: { $gte: newstartOfyesDay, $lt: newendOfyesDay  }}).lean();
    // }

    // const trialsyesMap = trialsyesdata.reduce((map, trial) => {
    //   map[trial.id] = trial.value; 
    //   return map;
    // }, {});
    // const trialResults = trialsdata.map(trial => {
    //   const isNewEntry = !trialsyesMap.hasOwnProperty(trial.id);  // 新人
    //   const yesterdayValue =  isNewEntry ? null : trialsyesMap[trial.id] || 0;
    //   const hasChanged = trial.value - yesterdayValue > 0;
    //   return {
    //     id: trial.id,
    //     todayValue: trial.value,
    //     yesterdayValue,
    //     hasChanged,
    //   };
    // });

    // const users = await User.find({verify:true}).lean(); 

    // const usersResults = users.map(u => {
      // const existingTrial = trialResults.some(tr => tr.id === u.id);
      
    //   if (!existingTrial) {
    //     return {
    //       id: u.id,
    //       todayValue: null, 
    //       yesterdayValue: null,
    //       hasChanged: false,  
    //     };
    //   }
    //   return null; 
    // }).filter(item => item !== null);
    
    // const newtrialResults = [...trialResults, ...usersResults];
    

  //  let unsubmitted = newtrialResults.filter(trial => !trial.hasChanged); // 昨日是空值 或 沒打
  //  let submitted = newtrialResults.filter(trial => trial.hasChanged); // 昨日是有值

  

    return {
      success: true,
      message: "取得搜尋結果",
      data: {
        // trianY: submitted,
        // trianN: unsubmitted,
        battleY: trueBattleData,
        battleN: falseBattleData,
        dayoff: dayoffsdata,
      },
    };
  }

 
});


