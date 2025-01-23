import { connectToDatabase } from "../db";
import { Trial,Dayoff,Battlefield } from "./model";
import moment from "moment";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {
  await connectToDatabase(); // 確保資料庫連接

  try {
    if (event.req.method === "GET") {

        // 戰場
        const nearestDateResult = await Battlefield.aggregate([
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$date" }, // 将日期格式化为 YYYY-MM-DD
                        },
                        count: { $sum: 1 }, // 统计每个日期的条目数（可选）
                    },
                },
                {
                    $addFields: {
                        absDiff: { $abs: { $subtract: [new Date(), { $dateFromString: { dateString: "$_id" } }] } },
                    },
                },
                { $sort: { absDiff: 1 } }, // 按日期差距排序
                { $limit: 1 }, // 取最接近的日期
            ]);
    
        if (!nearestDateResult || nearestDateResult.length === 0) {
            return []; 
        }

        const nearestDate = nearestDateResult[0]._id;
    
        const data = await Battlefield.find({
            date: {
                $gte: moment(nearestDate).startOf("day").toDate(),
                $lt: moment(nearestDate).endOf("day").toDate(),
            },
        }).lean();

        // 請假人
        const dayoff_user = await Dayoff.find({verify:true,date: {
                $gte: moment(nearestDate).startOf("day").toDate(),
                $lt: moment(nearestDate).endOf("day").toDate(),
            }});
            const dayoff_user_ids = dayoff_user.map(user => user.uid);


        const join_user = data.filter(dd => dd.attend)
        const no_join_user = data.filter(dd => !dd.attend)
        const filtered_no_join_user = no_join_user.filter(user => !dayoff_user_ids.includes(user.uid)); 
        
        const datas  = [join_user.length,filtered_no_join_user.length,dayoff_user.length]
        
            // 試煉

            const startOfDay = moment(new Date()).clone().subtract(1, 'days').startOf('day').toDate();
              const endOfDay = moment(new Date()).clone().subtract(1, 'days').endOf('day').toDate();

            const newTrialRank = await Trial.find({ date: { $gte: startOfDay, $lt: endOfDay } }).sort({ value: -1, id: 1  }).lean();
        
        
        
        
        
        return {
            success: true,
            message: "抓取成功！",
            data:datas,
          }
    }
  } catch (e) {
    console.log(error, "執行錯誤，請前往修改代碼");
  }
});
