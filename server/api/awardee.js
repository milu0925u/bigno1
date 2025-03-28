import { connectToDatabase} from "../db";
import { Prizes,Awardees,User,Battlefield } from "./model";
import moment from "moment";

// 用來處理HTTP請求
export default defineEventHandler(async (event) => {

  await connectToDatabase(); //確保與資料庫建立連接
  try {
    if (event.req.method === "GET") {

      const awardees = await Awardees.find().lean();

      return {
        success: true,
        message: "取得得獎人成功",
        data: awardees,
      };
    }

    if (event.req.method === "POST") {
      const { pid, uid, type,select,selectedUsers} = await readBody(event);

      if (type === 'add') {
        if(!pid || !uid ) return { success: false, message: "缺少必要選擇" };
        // 檢查
        const pidPrize = await Prizes.findOne({ pid: pid }).lean();
        if (!pidPrize) return { success: false, message: "無此獎項" };

        let uidPrize = await User.findOne({ id: uid }).lean();
        if (!uidPrize) return { success: false, message: "無此成員" };
        // 查看有沒有得獎人
        const limitAwardee = await Awardees.find({pid:pid});

        // 最後一名的流水編號
        let lastAwardee = await Awardees.findOne().sort({ aid: -1 }).limit(1);
        const aid = lastAwardee ? Number(lastAwardee.aid) + 1 : 1;

        // 先檢查唯一
        if(!pidPrize.repeat && limitAwardee.length <= 0){
          const newAwardee = new Awardees({ aid: aid, pid: pid, uid: uid });
          await newAwardee.save();
          await Prizes.updateOne(
            { pid: pid },
            {
              $set: {
                hidden: true,
              },
            }
          );
          return { success: true, message: `恭喜「${uidPrize.username}」獲得${pidPrize.pname}！` };
        }

       // 檢查多數
        if (pidPrize.repeat && limitAwardee.length < pidPrize.limit) {
          if ((limitAwardee.length +1) >= pidPrize.limit){
            await Prizes.updateOne(
              { pid: pid },
              {
                $set: {
                  hidden: true,
                },
              }
            );
          }
          const newAwardee = new Awardees({ aid: aid, pid: pid, uid: uid });
          await newAwardee.save();
          return { success: true, message: `恭喜「${uidPrize.username}」獲得${pidPrize.pname}！` };
        }

        
        return { success: false, message: '此獎項已抽完畢' };
        
      } else if (type === 'getawardee') {

        if(!pid) return { success: false, message: "缺少獎品項目" };
        
        const pidPrize = await Prizes.findOne({ pid: pid }).lean();
        if (!pidPrize) return { success: false, message: "無此獎項" };
        
        // 所有玩家
        const users = await User.find({verify:true}).select("id username").lean();

        // 要打印的
        let filteredUsers = users;

         // 多個得獎者
        if(pidPrize.repeat){
          const awardedUids = new Set(await Awardees.distinct("uid", { pid: pid }));
          // 過濾已經得獎的玩家
          filteredUsers = users.filter(user => !awardedUids.has(user.id));
        }

        if(select === 'optional'){
          // 要排除的人
          const users = await User.find({verify: true, id: { $in: selectedUsers }}).select("id").lean();
          const userIdsSet = new Set(users.map(user => user.id));
          filteredUsers =  filteredUsers.filter(user => !userIdsSet.has(user.id));
        }else if (select === 'battlefield'){
                    // 排除-沒參加戰場的
        const getCorrectSaturday = (date) => {
          const dayOfWeek = date.getDay();  // 週日: 0, 週一: 1, ..., 週六: 6  
          const thisSaturday = new Date(date);
      
          // 如果今天是週日
          if (dayOfWeek === 0) {
            thisSaturday.setDate(date.getDate() - 1); 
            return thisSaturday
          }
          // 如果今天是週六
          if (dayOfWeek === 6) {
            return thisSaturday;
          }

          // 如果今天是其他日期
          thisSaturday.setDate(date.getDate() - (dayOfWeek + 1)); 
          return thisSaturday;
      };
      const today = new Date(); // 今天的日期
      let lastSaturday = getCorrectSaturday(today);
      lastSaturday = new Date(Date.UTC(lastSaturday.getUTCFullYear(), lastSaturday.getUTCMonth(), lastSaturday.getUTCDate(), 0, 0, 0, 0));
          // 有參加戰場的玩家
          const battlefieldRecords = await Battlefield.find({date: lastSaturday ,attend: true}).select("uid").lean();
          const battlefieldUids = new Set(battlefieldRecords.map(record => record.uid));
          filteredUsers = filteredUsers.filter(user => battlefieldUids.has(user.id));
        }


        console.log(filteredUsers.length,'總人數');
        
        return { success: true, message: "取得此獎項候選人成功！", data: filteredUsers };
        
      }
    }
  }catch (e) {
    return { success: false, message: "伺服器錯誤！" };
  }
});
