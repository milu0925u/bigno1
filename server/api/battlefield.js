import { connectToDatabase } from "../db";
import { User, Battlefield } from "./model";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {
  await connectToDatabase(); // 確保資料庫連接

  if (event.req.method === "POST") {
    const { type, date, ids } = await readBody(event);

    if (type === "addin") {

      // 先檢查是否已有名單
      const existingRecord = await Battlefield.findOne({ date: date });

      if (!existingRecord) {
        // 抓到最後一筆的編號
        const newpage = await Battlefield.findOne({}).sort({ id: -1 }).lean();
        const nextId = newpage ? newpage.id + 1 : 1;

        // 抓到目前驗證成功的成員們
        const users = await User.find({ verify: true })
          .select("id username createDate")
          .lean();

        // 篩出 要先加入 才能上戰場的人
        const filteredUsers = users.filter(
          (user) => new Date(user.createDate) <= new Date(date)
        );

        // 目前的會員全部新增進去
        const bulkOperations = filteredUsers.map((user, index) => ({
          insertOne: {
            document: {
              id: nextId + index,
              uid: user.id,
              attend: false,
              date: date,
            },
          },
        }));
        // 一次性加入
        await Battlefield.bulkWrite(bulkOperations);

        //抓取此次所有玩家
        const battleusers = await Battlefield.find({ date: date });

        return {
          success: true,
          message: "新增成功！",
          users: battleusers,
        };
      }
    } else if (type === "get") {
      const users = await Battlefield.find({ date: date }).lean();
      return {
        success: true,
        message: "讀取成功！",
        users: users,
      };
    } else if (type === "chosen") {

      
      const result = await Battlefield.updateMany(
        { uid: { $in: ids }, date: new Date(date) },
        { $set: { attend: true } }
      );

      return {
        success: true,
        message: `${result.modifiedCount} 筆資料已更新成功！`,
      };
    }
  }
});
