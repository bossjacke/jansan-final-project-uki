import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        phone: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "customer","buier"], default: "customer" },
        locationId: {
            type: String,
            required: function () {
                return this.role === "customer";
            },
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

