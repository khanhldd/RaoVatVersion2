const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      },
      text: {
        type: String,
        required: true
      },
      img: {
        type: String
      },
      price: {
        type: String
      },
      phone: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      hinhThucTraLuong:{
        type: String,
        required: true
      },
      loaiCongViec:{
        type: String,
        required: true
      },
      nganhNghe:{
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      likes: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "users"
          }
        }
      ],
      comment: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "users"
          },
          text: {
            type: String,
            required: true
          },
          name: {
            type: String
          },
          avatar: {
            type: String
          },
          date: {
            type: Date,
            default: Date.now
          }
        }
      ],
      date: {
        type: Date,
        default: Date.now
      }
});

module.exports = Job  = mongoose.model("job", JobSchema);