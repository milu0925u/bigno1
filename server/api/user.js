import { connectToDatabase} from "../db";
import { User,Trial } from "./model";
import moment from "moment";
import jwt from 'jsonwebtoken'

// 用來處理HTTP請求
export default defineEventHandler(async (event) => {

  await connectToDatabase(); //確保與資料庫建立連接
  try {
    //資料庫中查詢
    if (event.req.method === "GET") {
          // 所有會員 (含未審核、離開)
    const users = await User.find().select("-password").lean(); //lean()轉為純js用法

    users.forEach((user) => {
      if (user.createDate) {
        user.createDate = moment(user.createDate).format("YYYY-MM-DD");
      }
      if (user.leaveDate) {
        user.leaveDate = moment(user.leaveDate).format("YYYY-MM-DD");
      }
      return user;
    });

      return {
        success: true,
        message: "取得成員資料成功",
        users: users,
      };
    }

    if (event.req.method === "POST") {

      // 客戶端的資料取出
      const {
        position,
        verify,
        leaveDate,
        createDate,
        username,
        password,
        job,
        lineName,
        lineID,
        type,
        id,
        trialTotal
      } = await readBody(event);

      //資料庫中查詢
      const users = await User.findOne({ username });

      if (type === "login") {
        
        // 檢查用戶是否存在
        if (!users) {
          return { success: false, message: "沒有這個成員" };
        }

        // 用戶存在、檢查密碼
        if (users.password !== password) {
          return { success: false, message: "密碼錯誤" };
        }
        // 設定 Cookie
        const cookieOptions = {
          httpOnly: false,
          maxAge: 60 * 60 * 24,
         sameSite: 'Lax',
          secure: true
        };

        
        const secret = 'no1pigg'; // 設定密鑰
        const jwtTokenPayload = {id: users.id}
        const jwtToken = jwt.sign(jwtTokenPayload, secret, { expiresIn: '1h' });

        // 儲存用戶資訊到 Cookie
        setCookie(event,"ipx", jwtToken, {...cookieOptions})

        return {
          success: true,
          message: "登入成功",
          user: {
            id: users.id,
            username: users.username,
            position: users.position,
            job: users.job,
            createDate: moment(users.createDate).format("YYYY-MM-DD"),
            verify: users.verify,
          },
        };
      } else if (type === "signup") {
        // 檢查用戶是否存在
        if (users) {
          return { success: false, message: "你已經註冊過！" };
        }

        // 最後一名的流水編號
        let lastUser = await User.findOne().sort({ id: -1 }).limit(1);
        const id = Number(lastUser.id) + 1;

        const newUser = new User({
          id,
          username,
          job,
          lineName,
          lineID,
          password,
          verify: false,
          position: "一般成員",
          createDate: new Date().toISOString().split("T")[0],
          leaveDate: null,
        });
        await newUser.save();
        return { success: true, message: "註冊成功" };
      } else if (type === "update") {

  
        const updateData = {}; //需要更新的項目內容
        if (lineID) {
          updateData.lineID = lineID;
        }
        if (lineName) {
          updateData.lineName = lineName;
        }
        if (job) {
          updateData.job = job;
        }
        if (username) {
          updateData.username = username;
        }
        if (createDate) {
          updateData.createDate = createDate;
        }
        if (leaveDate) {
          updateData.leaveDate = leaveDate;
        }
        if (trialTotal) {
          updateData.trialTotal = trialTotal;
        }
        if (password) {
          updateData.password = password;
        }
        if (verify) {
          updateData.verify = JSON.parse(verify);
          if (leaveDate) {
            updateData.verify = null;
          }
        }
        if (position) {
          updateData.position = position;
        }


        // 更新會員資料 - 多項目
        await User.updateMany(
          { id: parseInt(id) },
          { $set: updateData } // 更新提供的欄位
        );

        return {
          success: true,
          message: "更新成功！",
        };
      } else if (type === "verifyuser") {

  
        await User.updateMany({ id: id }, { $set: { verify: true } });
        return {
          success: true,
          message: "審核成功！",
        };
      } else if (type === 'verify'){
        const users = await User.findOne({ id });

        return {
          success: true,
          message: "登入成功",
          user: {
            id: users.id,
            username: users.username,
            position: users.position,
            job: users.job,
            createDate: moment(users.createDate).format("YYYY-MM-DD"),
            verify: users.verify,
          },
        };
      }
    }

    if (event.req.method === "PATCH"){
      // 會員觀看成長數據
      const {uid} = await readBody(event);
    
      //  const startOfMonth = moment(month, "YYYY-MM").startOf("month").toDate();
      //  const endOfMonth = moment(month, "YYYY-MM").endOf("month").toDate();
     
       const allTrials = await Trial.find({id:uid}).lean();
    
       return {
        success: true,
        message: "取得成功！",
        label:['2025-1-1','2025-1-2','2025-1-3'],
        data:[100,50,20]
      };
    }
  } catch (e) {
    return {
      success: false,
      message: "伺服器錯誤！",
    };
  }
});
