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
      createDate: Date,
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
      content: Object,
      createdate: Date,
      hiddendate: {
        type: Date,
        required: false,
      },
    })
  );

export { User, Battlefield, Trial, Dayoff ,Board};
