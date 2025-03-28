import compareHashPassword from "../middleware/passwordCompare.js";
import { convertPasswordToHash } from "../middleware/passwordHashing.js";
import verifyJWTToken from "../middleware/verifyToken.js";
import adminSModel from "../models/adminModel.js";
import userSModel from "../models/userModel.js";


const handleCreateNewSuperior = async(req,res) => {
    try{
        const requestedValues = req.body;
        const {password, ...values} = requestedValues;
        // console.log("requestedValues",req.body);
        // console.log("authorization",req.headers['authorization']);
        const headersToken = req.headers['authorization']
        if(headersToken){
            const token  = headersToken.split(" ")[1];
            // console.log(token);
            const tokenResult = await verifyJWTToken(token);
            // console.log("tokenResult",tokenResult);
            if(tokenResult.decode.role == "admin"){
                // console.log("inside if");
                const passwordConversion = await convertPasswordToHash(password);
                const mergeObject = {password: passwordConversion, ...values};
                // console.log("mergeObject",mergeObject);
                const newRegistration = await adminSModel.create(mergeObject)
                res.status(200).send({message: "New Authorized person created"})
            } else{
                res.status(403).send({message: "You do not have permission to perform this action"})
            }
        } else{
            res.status(498).send({message: "Token not found"})
        }
        // console.log("requestedValues",values);
    } catch(err){
        // console.log("err",err.errorResponse.errmsg);
        // const errorLabels = err.errorResponse[Symbol('errorLabels')];
        // console.log(errorLabels)
        // console.log("err",err.errorResponse && err.errorResponse.keyPattern.email);
        switch(true){
            case err.errorResponse && err.errorResponse.keyPattern.email == 1:
                // console.log("err",err.errorResponse.errmsg);
                res.status(409).send({message: "Email ID already exist"})
                break;
            default:
                res.send({message: "Something went wrong"})
            
        }
    }   
}

// listing of admin and subadmin

const handleListingAdminSubAdmin = async(req,res) => {
    try{
        let page = req.query.page == "no_pagination" ? "no_pagination" : req.query.page == "only_count" ? "only_count" : Number(req.query.page) || 1;
        let limit = 10;
        let skip = (page - 1) * limit;
        const headersToken = req.headers['authorization']
        // console.log(headersToken)
        if(headersToken){
            const token  = headersToken.split(" ")[1];
            const tokenResult = await verifyJWTToken(token);
            // console.log("tokenResult",tokenResult);
            // switch(true){
            //     case tokenResult.result == "false":
                    const allAuthorizedUsers = page == "no_pagination" ? await adminSModel.find({isDeleted: false}) : await adminSModel.find({isDeleted: false}).skip(skip).limit(limit);
                    // console.log("allAuthorizedUsers",await adminSModel.find({ isDeleted: !true}))
                    let allAuthorizedUsersCount = await adminSModel.countDocuments({isDeleted: false});
                    let totaPages = Math.ceil(allAuthorizedUsersCount / limit)
                    res.status(200).send({message: "Data Fetch successfully", data: page == "only_count" ? [] : allAuthorizedUsers,total_records: allAuthorizedUsersCount , total_page: totaPages , current_page:page,skipDataCount: skip})
            //         break;
            //     default:
            //         res.status(401).send({message: "Token has expired"});
            // }
        } else{
            res.status(498).send({message: "Token not found"})
        }
    }
    catch(err){
        // console.log(err)
        switch(true){
            case err.name == "TokenExpiredError":
                res.status(401).send({message: "Token has expired"})
                break;
            default:
                res.status(400).send({message: "An unexpected error occurred. Please try again later."})
        }
    }
}


// handle admin and subadmin login

const handleAuthorizedLoginSystem = async(req,res) => {
    try{
        const credentialsGot = req.body;
        // console.log("credentialsGot",req.body)
        const findCredentialsDB = await adminSModel.findOne({email: credentialsGot.email});
        const findCredentialsUserDB = await userSModel.findOne({email: credentialsGot.email});
        // console.log("findCredentialsDB",findCredentialsDB)
        switch(true){
            case (findCredentialsDB == null && findCredentialsUserDB == null) || (findCredentialsDB && findCredentialsDB.isDeleted == true):
                res.status(404).send({message: "User not found"});
                break;
            case findCredentialsDB != null:
                const passwordResult = await compareHashPassword(credentialsGot.password , findCredentialsDB.password);
                if(passwordResult == true){
                    // console.log(passwordResult, "comparedpasswordResult");
                    // const {password, ...restValues} = findCredentialsDB;
                    const payload = {
                        id: findCredentialsDB._id,
                        email: findCredentialsDB.email,
                        role: findCredentialsDB.role,
                        firstname: findCredentialsDB.firstname,
                        hasAllRights: findCredentialsDB.hasAllRights,
                        mnumber: findCredentialsDB.mnumber,
                        isDeleted: findCredentialsDB.isDeleted
                    };
                    // console.log(payload, "payload");
                    res.status(200).send({message: "User Logged In Successfully", data: {
                        token: await findCredentialsDB.generateToken(payload),
                        id: findCredentialsDB._id,
                        email: findCredentialsDB.email,
                        role: findCredentialsDB.role, // Assuming you store the user's role
                        firstname: findCredentialsDB.firstname, // Custom field if needed
                        hasAllRights: findCredentialsDB.hasAllRights, // Custom field if needed
                        mnumber: findCredentialsDB.mnumber, // Username
                    }})
                }
                else{
                    res.status(401).send({message: "Unauthorized, Password not matched"})
                }
                break;
            case findCredentialsUserDB != null:
                const passwordResultUser = await compareHashPassword(credentialsGot.password , findCredentialsUserDB.password);
                if(passwordResultUser == true){
                    // console.log(passwordResult, "comparedpasswordResult");
                    // const {password, ...restValues} = findCredentialsDB;
                    const payload = {
                        id: findCredentialsUserDB._id,
                        email: findCredentialsUserDB.email,
                        role: findCredentialsUserDB.role,
                        firstname: findCredentialsUserDB.firstname,
                        lastname: findCredentialsUserDB.lastname,
                        hasAllRights: findCredentialsUserDB.hasAllRights,
                        handledSubAdmin: findCredentialsUserDB.handledSubAdmin,
                        mnumber: findCredentialsUserDB.number,
                    };
                    // console.log(payload, "payload");
                    res.status(200).send({message: "User Logged In Successfully", data: {
                        token: await findCredentialsUserDB.generateUserToken(payload),
                        id: findCredentialsUserDB._id,
                        email: findCredentialsUserDB.email,
                        role: findCredentialsUserDB.role, // Assuming you store the user's role
                        firstname: findCredentialsUserDB.firstname, // Custom field if needed
                        lastname: findCredentialsUserDB.firstname, // Custom field if needed
                        hasAllRights: findCredentialsUserDB.hasAllRights, // Custom field if needed
                        handledSubAdmin: findCredentialsUserDB.handledSubAdmin, // Custom field if needed
                        mnumber: findCredentialsUserDB.number, // Username
                    }})
                }
                else{
                    res.status(401).send({message: "Unauthorized, Password not matched"})
                }
                break;
        }
    }
    catch(err){
        console.log(err)
    }
}

// handle admin and subadmin edit

const handleAuthorizedEdit = async(req,res) => {
    try{
        const requestedObject = req.body;
        const headersToken = req.headers['authorization']
        // console.log(requestedObject)
        
        if(headersToken){
            const token  = headersToken.split(" ")[1];
            // console.log(token);
            const tokenResult = await verifyJWTToken(token);
            // console.log("tokenResult",tokenResult);
            if(tokenResult.decode.role == "admin"){
                // console.log("inside if");
                const editedAuthorizeddata = await adminSModel.findOneAndUpdate({_id: req.params.id }, requestedObject);
                // console.log(await adminSModel.findById({_id: req.params.id }))
                res.status(200).send({message: "Data updated successfully" });
            } else{
                res.status(403).send({message: "You do not have permission to perform this action"})
            }
        } else{
            res.status(498).send({message: "Token not found"})
        }
    } catch(err){
        switch(true){
            case err.errorResponse && err.errorResponse.keyPattern.email == 1:
                // console.log("err",err.errorResponse.errmsg);
                res.status(409).send({message: "Email ID already exist"})
                break;
            case err.name == "TokenExpiredError":
                res.status(401).send({message: "Token has expired"})
                break;
            default:
                res.send({message: "Something went wrong"})
            
        }
    }
}

// handle id wise admin and subadmin data
const handleAuthorizedparticular = async(req,res) => {
    // console.log(req.query.page)
    const requestedObject = req.body;
    const headersToken = req.headers['authorization']
    let page = req.query.page == "detailed" ? "detailed" : ""; 
    try{
        const token  = headersToken.split(" ")[1];
        const tokenResult = await verifyJWTToken(token);
        const adminId = req.params.id;
        switch(true){
            case tokenResult.decode.role == "admin" || tokenResult.decode.role == "subadmin":
                const fetchDataById = await adminSModel.findById({_id: adminId });
                const fetchSubadminCount = await adminSModel.countDocuments({isDeleted: false});
                // console.log(await adminSModel.countDocuments())
                const fetchAssignedUserCount = await userSModel.countDocuments({handledSubAdmin: adminId});
                const fetcInActiveUserCount = await userSModel.find({handledSubAdmin: adminId}).countDocuments({status: "Inactive"});
                const totalUserCount = await userSModel.countDocuments();
                // const userDataCount = fetchUserData.countDocuments();
                // console.log(fetchUserData)
                const passObject = {
                    id: fetchDataById._id,
                    firstname: fetchDataById.firstname,
                    email: fetchDataById.email,
                    role: fetchDataById.role,
                    hasAllRights: fetchDataById.hasAllRights,
                    mnumber: fetchDataById.mnumber,
                }
                res.status(200).send({message:"data fetched" , data: passObject, countUserData: page == "detailed" ? fetchAssignedUserCount : 0, inActiveUserCount: page == "detailed" ? fetcInActiveUserCount : 0, totalSubAdminCount: page == "detailed" ? fetchSubadminCount : 0, totalUserCount: page == "detailed" ? totalUserCount : 0});
                break;
            default:
                const fetchUserById = await userSModel.findById({_id: adminId });
                const handleAdminDetails = await adminSModel.findById({_id: fetchUserById.handledSubAdmin})
                // console.log(handleAdminDetails);
                const passUserObject = {
                    id: fetchUserById._id,
                    firstname: fetchUserById.firstname,
                    lastname: fetchUserById.lastname,
                    email: fetchUserById.email,
                    role: fetchUserById.role,
                    mnumber: fetchUserById.number,
                    status: fetchUserById.status,
                    AuthorizerName: handleAdminDetails.firstname
                }
                res.status(200).send({message:"data fetched" , data: passUserObject});
        } 
    } catch(err){
        // console.log(err)
        switch(true){
            case err.name == "TokenExpiredError":
                res.status(401).send({message: "Token has expired"})
                break;
            default:
                res.status(9999).send({message: "An unexpected error occurred. Please try again later."})
        }
    }
}

// handle delete subadmin
const handleDeleteSubadmin = async(req,res) => {
    try{
        const requestedObject = req.body;
        const headersToken = req.headers['authorization']
        // console.log(requestedObject)
        
        if(headersToken){
            const token  = headersToken.split(" ")[1];
            // console.log(token);
            const tokenResult = await verifyJWTToken(token);
            // console.log("tokenResult",tokenResult);
            if(tokenResult.decode.role == "admin"){
                // console.log("inside if");
                const deleteAuthorizedId = await adminSModel.findById({_id: req.params.id });
                // console.log(await adminSModel.findById({_id: req.params.id }))
                await adminSModel.findByIdAndUpdate(deleteAuthorizedId._id, {
                    isDeleted: true
                })
                res.status(200).send({message: "Data deleted successfully" });
            } else{
                res.status(403).send({message: "You do not have permission to perform this action"})
            }
        } else{
            res.status(498).send({message: "Token not found"})
        }
    }catch(err){
        switch(true){
            case err.name == "TokenExpiredError":
                res.status(401).send({message: "Token has expired"})
                break;
            default:
                res.status(9999).send({message: "An unexpected error occurred. Please try again later."})
        }
    }
}

// profile edit backend logic start
const handleEditProfile = async(req,res) => {
    try{
        const requestedObject = req.body;
        const headersToken = req.headers['authorization'];
        if(headersToken){
            const token  = headersToken.split(" ")[1];
            // console.log(token);
            const tokenResult = await verifyJWTToken(token);
            // console.log("tokenResult",tokenResult);
            // console.log("requestedObject",requestedObject);
            switch(true){
                case tokenResult.decode.role == "admin" || tokenResult.decode.role == "subadmin":
                    const editedAuthorizeddata = await adminSModel.findOneAndUpdate({_id: req.params.id }, requestedObject);
                    res.status(200).send({message: "Profile updated successfully"});
                    break;
                default:
                    const editedUserdata = await userSModel.findOneAndUpdate({_id: req.params.id }, requestedObject);
                    res.status(200).send({message: "Profile updated successfully"});
            }
        } else{
            res.status(498).send({message: "Token not found"})
        }
    } catch(err){
        switch(true){
            case err.name == "TokenExpiredError":
                res.status(401).send({message: "Token has expired"})
                break;
            default:
                res.status(9999).send({message: "An unexpected error occurred. Please try again later."})
        }
    }
}
// profile edit backend logic end

export {handleCreateNewSuperior , handleListingAdminSubAdmin, handleAuthorizedLoginSystem, handleAuthorizedEdit , handleAuthorizedparticular, handleDeleteSubadmin, handleEditProfile}