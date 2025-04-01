// store updated password

import adminSModel from "../models/adminModel.js";
import userSModel from "../models/userModel.js";
import { convertPasswordToHash } from "./passwordHashing.js";

const updateOldPassWithNew = async(newPassword,id,role) => {
    console.log(newPassword,id,role)
    let newPasswordConversion;
    let updateOldPassword;
    switch(true){
        case role == "subadmin" || role == "admin":
            newPasswordConversion = await convertPasswordToHash(newPassword);
            updateOldPassword = await adminSModel.findByIdAndUpdate({_id: id}, {password: newPasswordConversion});
            console.log(updateOldPassword)
            return updateOldPassword.role
            break;
        default:
            newPasswordConversion = await convertPasswordToHash(newPassword);
            updateOldPassword = await userSModel.findByIdAndUpdate({_id: id}, {password: newPasswordConversion});
            console.log(updateOldPassword)
            return updateOldPassword.role
    }
}

export default updateOldPassWithNew;