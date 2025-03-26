import mongoose from "mongoose";

// 取得user這個資料表的資料
const User =
  mongoose.models.users ||
  mongoose.model(
    "users", // 模型名稱，對應到資料庫中的 "users" 集合
    new mongoose.Schema({
      id: { type: Number, unique: true },
      username: String,
      password: String,
      job: String,
      position: String,
      verify: Boolean,
      lineName: String,
      lineID: String,
      createDate: { type: Date, default: Date.now },
      leaveDate: Date,
    })
  );

const Battlefield =
  mongoose.models.battlefield ||
  mongoose.model(
    "battlefields",
    new mongoose.Schema({
      id: Number,
      uid: Number,
      attend: Boolean,
      date: Date,
      reviewer: {
        type: Number,
        required: false,
      },
    })
  );


const Trial =
  mongoose.models.trials ||
  mongoose.model(
    "trials",
    new mongoose.Schema({
      id: Number,
      value: Number,
      date: Date,
      ranking:Number,
      season:Number,
      reviewer: {
        type: Number,
        required: false,
      },
    })
  );

const Dayoff =
  mongoose.models.dayoffs ||
  mongoose.model(
    "dayoffs",
    new mongoose.Schema({
      id: Number,
      uid: Number,
      reason: String,
      date: Date,
      verify: Boolean,
      createDate: Date,
      reviewer: {
        type: Number,
        required: false,
      },
    })
  );

  const Board =
  mongoose.models.boards ||
  mongoose.model(
    "boards",
    new mongoose.Schema({
      bid: Number,
      uid: Number,
      title:String,
      content: Object,
      createdate: { type: Date, default: Date.now },
      hiddendate: {
        type: Date,
        required: false,
      },
    })
  );

  const BoardImg =
  mongoose.models.boardimgs ||
  mongoose.model(
    "boardimgs",
    new mongoose.Schema({
      bid: Number,
      iidx: String,
      url:String,
    })
  );


  const BoardReply =
  mongoose.models.boardreplys ||
  mongoose.model(
    "boardreplys",
    new mongoose.Schema({
      brid:Number,
      bid: Number,
      uid: Number,
      content: Object,
      createdate: { type: Date, default: Date.now },
      updatedate: {
        type: Date,
        required: false,
      },
      hiddendate: {
        type: Date,
        required: false,
      },
    })
  );

  const Prizes=
  mongoose.models.prizes ||
  mongoose.model(
    "prizes",
    new mongoose.Schema({
      pid:Number,
      pname:String,
      repeat:Boolean,
      limit: { type: Number, default: 1 }, 
      hidden: { type: Boolean, default: false }, 
      content: String,
      createdate: { type: Date, default: Date.now },
    })
  );

  const Awardees =
  mongoose.models.awardees ||
  mongoose.model(
    "awardees",
    new mongoose.Schema({
      aid:Number,
      pid: Number,
      uid: Number,
      createdate: { type: Date, default: Date.now },
    })
  );

export { User, Battlefield, Trial, Dayoff ,Board,BoardReply,BoardImg,Awardees,Prizes};
