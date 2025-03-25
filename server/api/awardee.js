import { connectToDatabase} from "../db";
import { Prizes,Awardees,User } from "./model";
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
      const { pid, uid, type } = await readBody(event);

      if (type === 'add') {
        // 檢查
        const pidPrize = await Prizes.findOne({ pid: pid }).lean();
        if (!pidPrize) return { success: false, message: "無此獎項" };

        const uidPrize = await User.findOne({ id: uid }).lean();
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

        const pidPrize = await Prizes.findOne({ pid: pid }).lean();
        if (!pidPrize) return { success: false, message: "無此獎項" };
        
        const users = await User.find({verify:true}).select("id username").lean();

         // 唯一得獎人
         const onlyAwardees = await Awardees.find({ pid: pid }).lean();
         if(!pidPrize.repeat && onlyAwardees.length === 0 ) return { success: true, message: "取得此獎項候選人成功！", data:users };

        // 多個得獎者
        const awardedUids = new Set(await Awardees.distinct("uid"));
        const filteredUsers = users.filter(user => !awardedUids.has(user.id));

        return { success: true, message: "取得此獎項候選人成功！", data: filteredUsers };
      }
    }

  } catch (e) {
    return { success: false, message: "伺服器錯誤！" };
  }
});
