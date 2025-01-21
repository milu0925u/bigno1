import { connectToDatabase } from "../db";
import { User, Trial, Dayoff, Battlefield } from "./model";
import moment from "moment";




// 處理 HTTP 請求
export default defineEventHandler(async (event) => {

  await connectToDatabase(); // 確保資料庫連接

  if (event.req.method === "GET") {
    // 正式人員
    const userdata = await User.find({ verify: true }).lean();

    // 請假最多前五名
    const dayoffsdata = await Dayoff.aggregate({   
        $match: {
          verify: true,  // 只選擇請假有通過的
        },
      $group: {// 分組統計請假次數
        uid: "$uid",   // 根據uid
        count: { $sum: 1 }, // 計算次數
      }},
    {$sort: { count: -1 }}, // 根據次數排序
    {
      $limit: 5 //只需要返回五個
    }).lean();

    // 戰場未出席最多前五名
    const battlesdata = await Battlefield.aggregate({  
      $match: {
        attend: false,  
      }, 
    $group: {// 分組統計請假次數
      id: "$id",   // 根據id
      count: { $sum: 1 }, // 計算次數
    }},
  {$sort: { count: -1 }}, // 根據次數排序
  {
    $limit: 5 //只需要返回五個
  }).lean();



    // 缺席前五名
    const trialsdata = await  Trial.aggregate({  
      $match: {
        attend: false,  
      }, 
    $group: {// 分組統計請假次數
      id: "$id",   // 根據id
      count: { $sum: 1 }, // 計算次數
    }},
  {$sort: { count: -1 }}, // 根據次數排序
  {
    $limit: 5 //只需要返回五個
  }).lean();


    return {
      success: true,
      message: "取得結果",
      data: {
       dayoffperson:dayoffsdata,
       battleperson:battlesdata,
      },
    };
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


