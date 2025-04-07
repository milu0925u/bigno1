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
      const { pid, uid, type,chooseAttend,excludePeople} = await readBody(event);

      // 新增中獎人
      if (type === 'add') {
        if(!pid || !uid ) return { success: false, message: "缺少必要選擇" };
        // 檢查
        const pidPrize = await Prizes.findOne({ pid: pid }).lean();
        if (!pidPrize) return { success: false, message: "無此獎項" };

        if (pidPrize.hidden) return { success: false, message: "已抽完畢" };

        const uidPrize = await User.findOne({ id: uid }).lean();
        if (!uidPrize) return { success: false, message: "無此成員" };

        const repeatAwardee = await Awardees.find({pid:pid});

        if (uidPrize.limit <= 0 && repeatAwardee) return { success: false, message: "此獎項已抽完畢" };
        if(repeatAwardee.some(item => item.uid == uid)) return { success: false, message: "此成員已經抽過" };


        // 最後一名的流水編號
        let lastAwardee = await Awardees.findOne().sort({ aid: -1 }).limit(1);
        const aid = lastAwardee ? Number(lastAwardee.aid) + 1 : 1;

        const newAwardee = new Awardees({ aid: aid, pid: pid, uid: uid });
        await newAwardee.save();

        // 新的資料庫
        const newAwardeeLength = await Awardees.find({pid:pid});

        if(newAwardeeLength.length > pidPrize.limit){
          await Prizes.updateOne(
            { pid: pid },
            {
              $set: {
                hidden: true,
              },
            }
        );
        }

        return { success: true, message: `恭喜「${uidPrize.username}」獲得${pidPrize.pname}！`};
      } else if (type === 'getawardee') {
        // 取得抽獎項目
        if(!pid) return { success: false, message: "缺少獎品項目" };
        const pidPrize = await Prizes.findOne({ pid: pid }).lean();
        if (!pidPrize) return { success: false, message: "無此獎項" };
        // 獎項只有一個且得獎人已經有資料
        const awardees = await Awardees.find({pid: pid}).select("uid").lean();
        if (!pidPrize.repeat && awardees.length > 0) return { success: false, message: "已經抽完了" };
        
        let resultUser = [];
        const users = await User.find({verify:true}).select("id username").lean();

        // 只要戰場有出席的人
        if (chooseAttend){
          const today = new Date();
            // 計算上週的開始 (上週一 00:00:00)
            const lastWeekStart = new Date(today);
            lastWeekStart.setDate(today.getDate() - today.getDay() - 6); // 上週一
            lastWeekStart.setHours(0, 0, 0, 0);

            // 計算上週的結束 (上週日 23:59:59)
            const lastWeekEnd = new Date(today);
            lastWeekEnd.setDate(today.getDate() - today.getDay()); // 上週日
            lastWeekEnd.setHours(23, 59, 59, 999);

          const battlefield = await Battlefield.find({attend:true,date: { $gte: lastWeekStart, $lt: lastWeekEnd }}).select("uid").lean();
          resultUser = battlefield.map((v)=>({id:v.uid}))
        } else{
          resultUser = users;
        }

        // 已得獎的排除
        if(awardees){
          resultUser = resultUser.filter(user => !awardees.some(auser => user.id === auser.uid));
        }

        // 需要排除掉的人
        if(excludePeople && excludePeople.length >0){
          const filteredUsers = resultUser.filter(user => !excludePeople.includes(user.id));
          resultUser = filteredUsers;
        }

        return { success: true, message: "取得此獎項候選人成功！", data: resultUser }; 
      }
    }
  }catch (e) {
    return { success: false, message: "伺服器錯誤！" };
  }
});
