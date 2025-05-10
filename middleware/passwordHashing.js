import bcrypt from "bcrypt"
const convertPasswordToHash = async(password) => {
    let bcryptPassword = await bcrypt.hash(password , 10);
    // console.log("bcryptPassword",bcryptPassword);
    return bcryptPassword;
}

export {convertPasswordToHash}