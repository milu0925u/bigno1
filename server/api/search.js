import { connectToDatabase } from "../db";
import { User, Trial, Dayoff, Battlefield } from "./model";
import moment from "moment";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {

  await connectToDatabase(); // 確保資料庫連接


  if (event.req.method === "GET") {
    try{
    const BattleX = [];
    const battle = await Battlefield.find({}, {  uid: 1, attend: 1, date: 1 }).lean();

    // Set 取得不重複的日期
    const uniqueDates = [...new Set(battle.map(b => b.date.toISOString().split("T")[0]))];

      // Set 取得不重複的ID
    const uids = [...new Set(battle.map(b => b.uid))]; 

    for (const uid of uids) {
      const attendances = await Promise.all(uniqueDates.map(async (date) => {
  
        const found = battle.find(b => b.uid === uid && moment(b.date).format("YYYY-MM-DD") === date);
    
        const user = await User.findOne({ id: uid, verify: true }); 
    
        if (!user) {
          return 'leave';  
        }

    
        return found ? found.attend : 'nodata';   
      }));
    
      BattleX.push({ uid, attendance: attendances });
    }
    const newBattle = BattleX.filter(v => !v.attendance.some(att => att === 'leave'));

    return {
      success: true,
      message: "取得結果",
      data: {
       days:uniqueDates,
       data:newBattle,
      },
    }
    }catch(error){
      return {
        success: false,
        message: "取得結果失敗",
        error,
      }
    }

  }

  if (event.req.method === "POST") {

    const { date } = await readBody(event);
    // 昨日
    const startOfyesDay = new Date(moment(date).clone().subtract(1, 'days').startOf('day').toDate())
    const endOfyesDay = new Date(moment(date).clone().subtract(1, 'days').endOf('day').toDate())
    // 今日
    const startOfDay = new Date(moment(date).startOf("day").toISOString());
    const endOfDay = new Date(moment(date).endOf("day").toISOString());

    const userdata = await User.find({ verify: true }).lean();
    const battlesdata = await Battlefield.find({date: { $gte: startOfDay, $lt: endOfDay }}).lean();
    const dayoffsdata = await Dayoff.find({date: { $gte: startOfDay, $lt: endOfDay },verify: true}).lean();
    // 戰場出席/未出席 (有請假要扣除)
    const trueBattleData = battlesdata.filter((item) => item.attend === true && !dayoffsdata.some((dayoff) => dayoff.uid === item.uid));
    const falseBattleData = battlesdata.filter((item) => item.attend === false && !dayoffsdata.some((dayoff) => dayoff.uid === item.uid));


    const trialsdata = await Trial.find({date: { $gte: startOfDay, $lt: endOfDay }}).lean();
    const trialsyesdata = await Trial.find({date: { $gte: startOfyesDay, $lt: endOfyesDay }}).lean();

    const trialsyesMap = trialsyesdata.reduce((map, trial) => {
      map[trial.id] = trial.value; 
      return map;
    }, {});
    const trialResults = trialsdata.map(trial => {
      const yesterdayValue = trialsyesMap[trial.id] || null;
      const hasChanged = yesterdayValue !== null && yesterdayValue !== trial.value;
      return {
        id: trial.id,
        todayValue: trial.value,
        yesterdayValue,
        hasChanged, 
      };
    });
    const unsubmitted = trialResults.filter(trial => !trial.hasChanged);
const submitted = trialResults.filter(trial => trial.hasChanged); 



    return {
      success: true,
      message: "取得搜尋結果",
      data: {
        trianY: submitted,
        trianN: unsubmitted,
        battleY: trueBattleData,
        battleN: falseBattleData,
        dayoff: dayoffsdata,
      },
    };
  }

 
});


