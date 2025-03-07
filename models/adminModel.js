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
                "j&/g@N&cj2vTIqQ!^9aV5HQ<R>a.9>,Xl2YQX!O}z&eofhc1TnyZmvXw9.PS0",{
                    expiresIn: "1d",
                }
            )
        } catch(err){
            console.log(err)
        }
    }

const adminSModel = mongoose.model('operationAdmin', adminSchema);

export default adminSModel;