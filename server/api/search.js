import { connectToDatabase } from "../db";
import { User, Trial, Dayoff, Battlefield } from "./model";
import moment from "moment";



async function getMonthlyUnsubmittedTrials(month) {
  // 获取该月的开始和结束日期
  const startOfMonth = moment(month, "YYYY-MM").startOf("month").toDate();
  const endOfMonth = moment(month, "YYYY-MM").endOf("month").toDate();

  // 获取该月所有的试炼数据
  const allTrials = await Trial.find({
    date: { $gte: startOfMonth, $lte: endOfMonth },
  }).lean();

  // 将数据按日期分组
  const trialsByDate = allTrials.reduce((acc, trial) => {
    const trialDate = moment(trial.date).startOf("day").format("YYYY-MM-DD");
    if (!acc[trialDate]) acc[trialDate] = [];
    acc[trialDate].push(trial);
    return acc;
  }, {});

  // 获取该月的所有日期
  const allDates = Object.keys(trialsByDate).sort();

  // 存储用户的未出席记录
  const unsubmittedCounts = {};

  // 按日期逐天计算
  for (let i = 1; i < allDates.length; i++) {
    const today = allDates[i];
    const yesterday = allDates[i - 1];

    const todayTrials = trialsByDate[today] || [];
    const yesterdayTrialsMap = (trialsByDate[yesterday] || []).reduce((map, trial) => {
      map[trial.id] = trial.value;
      return map;
    }, {});

    // 比较今天和昨天的值
    todayTrials.forEach((trial) => {
      const yesterdayValue = yesterdayTrialsMap[trial.id] || null;
      const hasChanged = yesterdayValue !== null && yesterdayValue !== trial.value;

      if (!hasChanged) {
        if (!unsubmittedCounts[trial.id]) {
          unsubmittedCounts[trial.id] = 0;
        }
        unsubmittedCounts[trial.id] += 1; // 统计未出席次数
      }
    });
  }

  // 将未出席次数按用户排序
  const sortedUnsubmitted = Object.entries(unsubmittedCounts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);

  return sortedUnsubmitted;
}


// 處理 HTTP 請求
export default defineEventHandler(async (event) => {

  await connectToDatabase(); // 確保資料庫連接

  if (event.req.method === "GET") {
    let dayoffsdata=[];
    let battlesdata=[];

   
    const countday = await Dayoff.countDocuments({ verify: true });
    if (countday > 0) {
    // 請假最多前五名
    dayoffsdata = await Dayoff.aggregate([{   
        $match: {
          verify: true,  // 只選擇請假有通過的
        },
      $group: {// 分組統計請假次數
        _id: "$uid",   // 根據uid
        count: { $sum: 1 }, // 計算次數
      }},
    {$sort: { count: -1 }}, // 根據次數排序
    {
      $limit: 5 //只需要返回五個
    }])
    }

    const countbat = await Battlefield.countDocuments({ attend: false });
    if (countbat > 0) {
      // 未出席最多前五名
      battlesdata = await Battlefield.aggregate([
        { 
          $match: { attend: false }
        },
        { 
          $group: { 
            _id: "$uid", 
            count: { $sum: 1 }
          }
        },
        { 
          $sort: { count: -1 }
        },
        { 
          $limit: 5
        }
      ]);
    }
    
    return {
      success: true,
      message: "取得結果",
      data: {
       dayoffperson:dayoffsdata,
       battleperson:battlesdata,
      },
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

  if (event.req.method === "PATCH") {

    const { date } = await readBody(event);

    const trialsdata = getMonthlyUnsubmittedTrials(date);

    return {
      success: true,
      message: "取得結果",
      data: {
       trialperson:trialsdata,
      },
    };
  }
 
});


