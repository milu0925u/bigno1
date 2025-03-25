import { connectToDatabase} from "../db";
import { Prizes,Awardees } from "./model";
import moment from "moment";
// 用來處理HTTP請求
export default defineEventHandler(async (event) => {

  await connectToDatabase(); //確保與資料庫建立連接
  try{
    if (event.req.method === "GET") {

      const prizes = await Prizes.find().lean();
  
        return {
          success: true,
          message: "取得獎項成功",
          data: prizes,
        };
      }

    if (event.req.method === "POST") {
    const {pname,repeat,content,limit} = await readBody(event)

    if (!pname || !content) return{ success: false, message: "缺少資料" };

    // 最後一名的流水編號
    let lastPrizes = await Prizes.findOne().sort({ pid: -1 }).limit(1);
    const pid = lastPrizes  ? Number(lastPrizes.pid) + 1 : 1;

      let today = new Date();
      today = moment(today).format("YYYY-MM-DD");

    let data = {pid:pid,pname:pname,repeat:repeat,content:content,createdate:today}
    if (repeat){
      data = {...data,limit:limit}
    }
    const newPrizes = new Prizes(data);
    await newPrizes.save();
    return { success: true, message: "新增獎項成功" };
    };

    if (event.req.method === "DELETE") {
      const {pid} = getQuery(event); 
      
      const awarder = await Awardees.findOne({pid:pid});
      
      if(awarder) return { success: false, message: "已有得獎者，不可刪除獎項。" };

      const deletedPrize = await Prizes.findByIdAndDelete(pid);

      return { success: true, message: "刪除獎項成功" };
    }
  } catch (error) {
    console.log(error,'error')
    return {success: false,message: "伺服器錯誤！"};
  }
});
