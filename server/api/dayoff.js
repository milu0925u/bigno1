import { connectToDatabase } from "../db";
import moment from "moment";
import { Dayoff } from "./model";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const token = cookies.auth;
  await connectToDatabase(); // 確保資料庫連接
  try {

    if (!token) {
      return { success:false, message: "成員身分認證失敗" }
    }

    const dayoff = await Dayoff.find();

    dayoff.forEach((dd) => {
      if (dd.date) {
        dd.date = moment(dd.date).format("YYYY-MM-DD");
      }
      if (dd.createDate) {
        dd.createDate = moment(dd.createDate).format("YYYY-MM-DD");
      }
      return dd;
    });

    if (event.req.method === "GET") {
      return {
        success: true,
        message: "取得成員資料成功",
        dayoff: dayoff,
      };
    }

    if (event.req.method === "POST") {
      const { id, reason, date, type, reviewer_id } = await readBody(event);

      const newpage = await Dayoff.findOne({}).sort({ id: -1 }).lean();
      const nextId = newpage ? newpage.id + 1 : 1;
      // 新增請假紀錄
      if (type === "add") {
        await Dayoff.updateMany(
          { uid: id, date: date },
          {
            $set: {
              id: nextId,
              uid: id,
              reason: reason,
              date: date,
              verify: false,
              createDate: new Date(),
            },
          },
          { upsert: true } // 如果不存在，則新增
        );
        return {
          success: true,
          message: "請假成功，待審核。",
        };
      }
      // 審核請假紀錄
      else if (type === "verify") {
        await Dayoff.updateOne(
          { id: id },
          {
            $set: {
              verify: true,
              reviewer: reviewer_id,
            },
          }
        );
        return {
          success: true,
          message: "審核通過",
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      message: "請假請求失敗",
    };
  }
});
