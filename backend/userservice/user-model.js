import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    surname: String,
    email: String,
    password: String,
    createdAt: { type: Date, default: Date.now },
    avatar: String,
    role: { type: String, default: "user" },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }]
});

const User = mongoose.model('User', userSchema);

export default User;