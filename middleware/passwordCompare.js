import bcrypt from "bcrypt"

const compareHashPassword = async(passwordGotFromuser , passwordInDB) => {
    const comparedpasswordResult = await bcrypt.compare(passwordGotFromuser, passwordInDB);
    // console.log(comparedpasswordResult, "comparedpasswordResult");
    return comparedpasswordResult;
}

export default compareHashPassword