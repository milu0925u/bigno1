import { connectToDatabase } from "../../db";
import { Board, BoardImg } from "../model";
import moment from "moment";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {
  await connectToDatabase();

  const bid = getRouterParam(event, 'bid')

  if (event.req.method === "GET") {
    const oneboard = await Board.findOne({ bid: bid }).lean()
    const boardimg =  await BoardImg.find({ bid: bid}).lean();

    oneboard.content = oneboard.content.map(item => {
      if (item.insert.image) {
        const match = item.insert.image.match(/^img(\d+)$/); // 匹配 "imgXX"
        if (match) {
          const iid = parseInt(match[1], 10); // 轉換成數字
         
          const matchedImg = boardimg.find(img => {
            return img.iidx == `img${iid}`
          });
          
          if (matchedImg) {
            return { ...item, insert: { image: matchedImg.url } }; // 替換成 base64
          }
        }
      }
      return item; // 沒匹配到則保持不變
    });

    const formattedBoard = {
      ...oneboard,
      createdate: moment(oneboard.createdate).format('YYYY-MM-DD'),
      updatedate: oneboard.updatedate ? moment(oneboard.updatedate).format('YYYY-MM-DD') : null,
      hiddendate: oneboard.hiddendate ? moment(oneboard.hiddendate).format('YYYY-MM-DD') : null,
  }
    return { success: true, message:'讀取成功！',data:formattedBoard }
  } 

  if (event.req.method === "POST"){
      console.log('opst, [bid]');
    }
})