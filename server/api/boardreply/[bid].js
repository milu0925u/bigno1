import { connectToDatabase } from "../../db";
import { BoardReply,User } from "../model";
import moment from "moment";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {
  await connectToDatabase(); // 確保資料庫連接
  const bid = getRouterParam(event, 'bid')

  if (event.req.method === "GET") {
     const boards = await BoardReply.find({ bid }).lean();
    if ( boards.length > 0){

      const formattedBoards = boards.map(b => ({
        ...b,
        createdate: moment(b.createdate).format('YYYY-MM-DD'),
        updatedate: b.updatedate ? moment(b.updatedate).format('YYYY-MM-DD') : null,
        hiddendate: b.hiddendate ? moment(b.hiddendate).format('YYYY-MM-DD') : null
      }))
      .sort((a, b) => b.brid - a.brid);
      return {
        success: true,
        message: '取得成功',
        data:formattedBoards,
      };


    }
  }

  if (event.req.method === "POST") {
    const { type,brid,uid,content,updatedate,hiddendate} = await readBody(event);
    const findVerifyUser = await User.findOne({id:uid,verify:true});

    if(!findVerifyUser){
      return {
        success: false,
        message: '您目前未審核通過，無法使用此功能！',
      };
    }


    if(type==='add'){
          // 抓到最後一筆編號
    let lastNum = await BoardReply.findOne().sort({ brid: -1 }).limit(1);
    const bnewid = lastNum ? Number(lastNum.brid) + 1 : 1;
    // 抓到今天日期
    const today = new Date().toISOString().split('T')[0]
    const newBoard = new BoardReply({
      brid:bnewid,
      bid:bid,
      uid:uid,
      content:content,
      createdate: today ,
      });
      await newBoard.save();
    return {
      success: true,
      message: '留言成功！',
      data:{brid:bnewid,uid:uid,content:content,createdate:today},
    };
    }else if(type==='delete'){
      const hiddenBoardReply = await BoardReply.findOneAndUpdate(
        { brid: brid },
        { 
          $set: { 
            hiddendate: new Date()
          }
        },
        { new: true } 
      );
    
        return {
          success: true,
          message: '刪除成功！',
          data:hiddenBoardReply,
        };
    }
}});
