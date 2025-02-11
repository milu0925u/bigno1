import { connectToDatabase } from "../../db";
import { Board } from "../model";
import moment from "moment";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {
  await connectToDatabase();

  const bbid = getRouterParam(event, 'bid')
  const bid = event.context.params.bid;

  if (event.req.method === "GET") {
    const oneboard = await Board.findOne({ bid: bid }).lean()
    const formattedBoard = {
      ...oneboard,
      createdate: moment(oneboard.createdate).format('YYYY-MM-DD'),
      updatedate: oneboard.updatedate ? moment(oneboard.updatedate).format('YYYY-MM-DD') : null,
      hiddendate: oneboard.hiddendate ? moment(oneboard.hiddendate).format('YYYY-MM-DD') : null,
  };

    return { success: true, message:'讀取成功！',data:formattedBoard }
  } 

  if (event.req.method === "POST"){
      console.log('opst, [bid]');
    }
})