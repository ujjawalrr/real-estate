import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "https://toppng.com/public/uploads/preview/instagram-default-profile-picture-11562973083brycehrmyv.png"
    },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

export default User;