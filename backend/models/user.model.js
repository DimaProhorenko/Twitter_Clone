import mongoose, { mongo } from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      require: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    profileImage: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

userSchema.query.withoutPassword = function () {
  return this.select("-password");
};

const User = mongoose.model("User", userSchema);

export default User;
