import { connectToDatabase } from "../../db";
import { Board, BoardImg } from "../model";
import moment from "moment";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {
  await connectToDatabase(); // 確保資料庫連接

  try{

  if (event.req.method === "GET") {
    const boards = await Board.find().sort({ createdate: -1 }).lean();
    const formattedBoards = boards.map(b => ({
      ...b,
      createdate: moment(b.createdate).format('YYYY-MM-DD'),
      updatedate: b.updatedate ? moment(b.updatedate).format('YYYY-MM-DD') : null,
      hiddendate: b.hiddendate ? moment(b.hiddendate).format('YYYY-MM-DD') : null
    }))



    return {
      success: true,
      message: '取得成功',
      data:formattedBoards,
    };
  }

  if (event.req.method === "POST") {
    const { uid,title,jsondata,bid,type,state} = await readBody(event);


    if (type === "addboard"){
    // 抓到最後一筆編號
    let lastNum = await Board.findOne().sort({ bid: -1 }).limit(1);
    const bnewid = lastNum ? Number(lastNum.bid) + 1 : 1;
   
    // 抓到今天日期
    const today = new Date().toISOString().split('T')[0]
    const newBoard = new Board({
      bid:bnewid,
      uid:uid,
      title:title,
      content:jsondata,
      createdate: today ,
    });
    await newBoard.save();
      return {
        success: true,
        message: '發布成功！',
      };
    }else if (type === "addboardimg"){
      // 抓到最後一筆編號
let lastNum = await Board.findOne().sort({ bid: -1 }).limit(1);

const newBoard = new BoardImg({
  bid:Number(lastNum.bid),
  iidx:jsondata.index,
  url:jsondata.url,
});

await newBoard.save();
return {
  success: true,
  message: '圖片儲存成功！',
};
}else if (type === "statechange"){
      if (!state){
        await  Board.updateOne(
          { bid: bid }, 
          { $set: { hiddendate: null } } 
      );
      }else {
        const now = new Date().toISOString().split("T")[0] 
        await  Board.updateOne(
          { bid: bid }, 
          { $set: { hiddendate:  now } } 
      );
      }
    return {
      success: true,
      message: '變更成功！',
    };
   }else if (type ==="updateboard"){
      const updatedBoard = await Board.findOneAndUpdate(
        { bid: bid },
        { 
          $set: { 
            uid: uid,
            title: title,
            content: jsondata,
            updatedate: new Date()
          }
        },
        { new: true } 
      );
    
        return {
          success: true,
          message: '更新成功！',
          data:updatedBoard,
        };
    }else if (type ==="updateboardimg"){
      await BoardImg.deleteMany({ bid });

      const newBoard = new BoardImg({
        bid:bid,
        iidx:jsondata.index,
        url:jsondata.url,
      });
      await newBoard.save();

        return {
          success: true,
          message: '更新成功！'
        };
    }
  };

}catch(error){
  console.log(error);
  
  return {
    success: false,
    message: '請求失敗',
  };
}
});
