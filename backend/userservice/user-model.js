import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    createdAt: Date,
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }]
});

const User = mongoose.model('User', userSchema);

export default User;