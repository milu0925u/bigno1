import { connectToDatabase } from "../db";
import { User, Trial } from "./model";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {
  await connectToDatabase(); // 確保資料庫連接

  try {
    if (event.req.method === "POST") {
      const { id, value, date, mid, type } = await readBody(event);

      if (type === "get") {
        const users = await Trial.find({ date: date }).lean();
        return {
          success: true,
          message: "抓取成功！",
          users: users,
        };
      }

      const newValue = value * 1000;

      // 新增進試煉
      await Trial.updateOne(
        { id: id, date: date },
        {
          $set: {
            id: id,
            value: newValue,
            date: date,
            ...(mid && { reviewer: mid }),
          },
        },
        { upsert: true }
      );
      // 新增進會員
      await User.updateOne(
        { id: id },
        {
          $set: {
            trialTotal: value,
          },
        },
        { upsert: true }
      );

      return {
        success: true,
        message: "輸入成功！",
      };
    }
  } catch (e) {
    console.log(e);
  }
});
