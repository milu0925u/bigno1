import { connectToDatabase } from "../db";
import { User, Battlefield } from "./model";

// 刪除 337以後的所有資料
// await Battlefield.deleteMany({ id: { $gte: 337 } });

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {
  await connectToDatabase(); // 確保資料庫連接


  if (event.req.method === "POST") {
    const { type, date, ids } = await readBody(event);

    if (type === "addin") {
    
      const existingRecord = await Battlefield.find({ date: date }).lean();
      const users = await User.find({ verify: true }).select("id username createDate").lean();

       // 篩出 要先加入 才能上戰場的人
       const filteredUsers = users.filter((user) => new Date(user.createDate) <= new Date(date));

       // 檢查 - 有這日期的名單
       if (existingRecord.length > 0){
        const existingUids = new Set(existingRecord.map(record => record.uid));
        const requiredUids = new Set(filteredUsers.map(user => user.id));
        const missingUids = [...requiredUids].filter(uid => !existingUids.has(uid));

     
        // 假如有重複地
        if (missingUids.length === 0) {
          return {
            success: true,
            message: "已有此名單，請進行勾選！",
          };
        }

        // 有缺人，要補進去
        // 抓到最後一筆的編號
        const newpage = await Battlefield.findOne({}).sort({ id: -1 }).lean();
        const nextId = newpage ? newpage.id + 1 : 1;

        const newRecords = missingUids.map((uid,index) => ({
          id: nextId + index,
          uid: uid,     
          attend: false,  
          date: date       
      }));
      // 批量插入到 MongoDB
      await Battlefield.insertMany(newRecords);

        //抓取此次所有玩家
        const battleusers = await Battlefield.find({ date: date });
        return {
          success: true,
          message: "新增成功！",
          users: battleusers,
        };
       }

        // 抓到最後一筆的編號
        const newpage = await Battlefield.findOne({}).sort({ id: -1 }).lean();
        const nextId = newpage ? newpage.id + 1 : 1;


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
    } else if (type === 'delete'){
      const result = await Battlefield.updateMany(
        { uid: { $in: ids }, date: new Date(date) },
        { $set: { attend: false } }
      );


      return {
        success: true,
        message: `${result.modifiedCount} 筆資料已修改成功！`,
      };
    }
  }
  
});
