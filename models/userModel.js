import mongoose from "mongoose";
import jwt from "jsonwebtoken";
// import { jwtKey } from "../config/common.js";
import "../config/dotenv.js"

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true, 
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    handledSubAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "operationAdmin",
    }
});

userSchema.path('role')
    .default("user");

    userSchema.methods.generateUserToken = async function (payload){
            try{
                return jwt.sign(payload,
                    process.env.JWTKEY,{
                        expiresIn: "1d",
                    }
                )
            } catch(err){
                console.log(err)
            }
        }

const userSModel = mongoose.model('userModule', userSchema);

export default userSModel;