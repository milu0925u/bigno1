import { connectToDatabase } from "../db";
import { User,Board } from "./model";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {
  await connectToDatabase(); // 確保資料庫連接
  if (event.req.method === "POST") {
    const { uid,jsondata } = await readBody(event);

    // 抓到最後一筆編號
    let lastNum = await Board.findOne().sort({ bid: -1 }).limit(1);
    const bid = Number(lastNum.id) + 1;
    // 抓到今天日期
    const today = new Date().toISOString().split('T')[0]

    const newBoard = new Board({
      bid:bid,
      uid:uid,
      content:jsondata,
      createdate: today ,

    });
    await newBoard.save();
    
    
   
      return {
        success: true,
        message: '發布成功！',
      };
    }
});
