import { connectToDatabase } from "../db";
import { User, Trial, Dayoff, Battlefield } from "./model";
import moment from "moment";

// 處理 HTTP 請求
export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const token = cookies.auth;
  await connectToDatabase(); // 確保資料庫連接

  if (event.req.method === "POST") {
    if (!token) {
      return { success:false, message: "成員身分認證失敗" }
    }
    const { date } = await readBody(event);

    const startOfDay = new Date(moment(date).startOf("day").toISOString());
    const endOfDay = new Date(moment(date).endOf("day").toISOString());

    const userdata = await User.find({ verify: true }).lean();
    const trialsdata = await Trial.find({
      date: { $gte: startOfDay, $lt: endOfDay },
    }).lean();
    const battlesdata = await Battlefield.find({
      date: { $gte: startOfDay, $lt: endOfDay },
    }).lean();
    const dayoffsdata = await Dayoff.find({
      date: { $gte: startOfDay, $lt: endOfDay },
      verify: true,
    }).lean();

    const trueBattleData = battlesdata.filter(
      (item) =>
        item.attend === true &&
        !dayoffsdata.some((dayoff) => dayoff.uid === item.uid)
    );
    const falseBattleData = battlesdata.filter(
      (item) =>
        item.attend === false &&
        !dayoffsdata.some((dayoff) => dayoff.uid === item.uid)
    );

    const trueTrianData = trialsdata;
    const falseTrianData = userdata.filter(
      (t) => !trialsdata.some((v) => String(v.id) === String(t.id))
    );

    // 出席 (user.createDate之前)
    // 未出席 (user.createDate之前)
    // 請假
    // 試煉有更新日期 (user.createDate之前)
    // 試煉未更新日期 (user.createDate之前)

    return {
      success: true,
      message: "取得搜尋結果",
      data: {
        trianY: trueTrianData,
        trianN: falseTrianData,
        battleY: trueBattleData,
        battleN: falseBattleData,
        dayoff: dayoffsdata,
      },
    };
  }
});
