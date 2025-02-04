import { connectToDatabase } from "../db";
import { User,Board } from "./model";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {
  await connectToDatabase(); // 確保資料庫連接
  if (event.req.method === "POST") {
   
      return {
        success: true,
      };
    }
});
