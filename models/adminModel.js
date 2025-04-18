import mongoose from "mongoose";
import jwt from "jsonwebtoken"
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    firstname: {
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
    hasAllRights: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mnumber: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

adminSchema.path('hasAllRights')
    .default("No")

    adminSchema.methods.generateToken = async function (payload){
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

const adminSModel = mongoose.model('operationAdmin', adminSchema);

export default adminSModel;