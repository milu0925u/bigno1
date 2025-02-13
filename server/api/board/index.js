import { connectToDatabase } from "../../db";
import { Board } from "../model";
import moment from "moment";
import LZString from "lz-string";
import { IncomingForm } from 'formidable';

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

  // 使用formdata
  if (event.req.method === "POST") {
    const form = new IncomingForm({  maxFileSize: 8 * 1024 * 1024});
    const formData = await new Promise((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
          if (err) {
              return reject({ success: false, message: '上傳失敗', error: err });
          }
          resolve(fields); // 只有成功時才會執行
      });
    });
    const jsonString = formData.jsondata?.[0] || "";  // 取出字串
    const {type,uid,title,jsondata} = JSON.parse(jsonString); // 解析 JSON
    
    if (type === "addboard"){
    // 抓到最後一筆編號
    let lastNum = await Board.findOne().sort({ bid: -1 }).limit(1);
    const bnewid = lastNum ? Number(lastNum.bid) + 1 : 1;

    // 抓到今天日期
    const today = new Date().toISOString().split('T')[0]

    // 解析base64
   const newjson =  LZString.decompressFromBase64(jsondata)
    const newBoard = new Board({
      bid:bnewid,
      uid:uid,
      title:title,
      content:newjson,
      createdate: today ,
    });
    await newBoard.save();
      return {
        success: true,
        message: '發布成功！',
      };
    }else if (type ==="updateboard"){
      // 解析base64
      const newjson =  LZString.decompressFromBase64(jsondata)

      const updatedBoard = await Board.findOneAndUpdate(
        { bid: bid },
        { 
          $set: { 
            uid: uid,
            title: title,
            content: newjson,
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
    }
  };

  if (event.req.method === "PATCH") {
      const { uid,bid,type,state } = await readBody(event);

       if (type === "statechange"){
        if (!state){
          await  Board.updateOne({ bid: bid },  { $set: { hiddendate: null } } );
        }else {
          const now = new Date().toISOString().split("T")[0] 
          await  Board.updateOne({ bid: bid }, { $set: { hiddendate:  now } } );
        }
      return {
        success: true,
        message: '變更成功！',
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
