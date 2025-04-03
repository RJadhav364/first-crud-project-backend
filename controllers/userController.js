import mongoose from "mongoose";
import { convertPasswordToHash } from "../middleware/passwordHashing.js";
import verifyJWTToken from "../middleware/verifyToken.js";
import adminSModel from "../models/adminModel.js";
import userSModel from "../models/userModel.js";

const handleCreateNewUser = async(req,res) => {
    const findCredentialsUserDB = await adminSModel.findOne({email: req.body.email});
    try{
        if(findCredentialsUserDB == null){
            const headersToken = req.headers['authorization']
            if(headersToken){
                const token  = headersToken.split(" ")[1];
                // console.log(token);
                const tokenResult = await verifyJWTToken(token);
                // console.log("tokenResult",tokenResult);
                    // console.log("inside if");
                    const {password, ...values} = req.body;
                    const passwordConversion = await convertPasswordToHash(password);
                    const mergeObject = {password: passwordConversion, ...values};
                    // console.log("mergeObject",mergeObject);
                    const newRegistration = await userSModel.create(mergeObject)
                    res.status(200).send({message: "New user created"})
            } else{
                res.status(498).send({message: "Token not found"})
            }
        } else{
            res.status(400).send({message: "You are already an authorized person. You cannot create a user account."})
        }
    }catch(err){
        console.log(err)
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

const handleGetUsers = async(req,res) => {
    try{
        // console.log(req.query)
        let page =  req.query.page == "only_count" ? "only_count" : Number(req.query.page) || 1;
        let limit = req.query.page == "only_count" ? 5 : 10;
        let sort = req.query.page == "only_count" ? -1 : 1; //Sorting by { _id: -1 } ensures that the most recent documents appear first.
        const data = await userSModel.find().sort({ _id: 1 });
        // console.log("data",data)
        let skip = (page - 1) * limit;
        const headersToken = req.headers['authorization'];
        if(headersToken){
            const token  = headersToken.split(" ")[1];
            // console.log(await userSModel.find({}));
            const tokenResult = await verifyJWTToken(token);
            let newRegistration 
            let adminModeldata = await adminSModel.find({});
            // let allAuthorizedUsersCoun2t = await userSModel.countDocuments();
            // console.log(adminModeldata);
            let passedData;
            let allUsersCount;
            let totaPages;
            let inactiveUsers;
            let usersAssingnedCount;
            const filter = {};

            if (req.query.authorname) {
                filter.firstname = { $regex: req.query.authorname, $options: "i" }; // Case-insensitive search
            }
              
            if (req.query.id) {
                filter["handledSubAdmin"] = req.query.id; // Assuming ID is an exact match
            }

            if (req.query.status) {
                filter.status = req.query.status; // Assuming ID is an exact match
            }
            switch(true){
                case tokenResult.decode.role == "subadmin":
                    // console.log("subadmin found",await userSModel.find(filter));
                    newRegistration = await userSModel.find({handledSubAdmin: tokenResult.decode.id, ...filter}).sort({ _id: sort }).skip(skip).limit(limit);
                    const subadminWiseData = await newRegistration.filter(({handledSubAdmin}) => handledSubAdmin == tokenResult.decode.id);
                    passedData = await subadminWiseData.map(({_id,firstname,lastname,email,role,number,handledSubAdmin,status}) => ({
                        id: _id,
                        firstname,
                        lastname,
                        email,
                        role,
                        number,
                        handledSubAdmin,
                        status,
                        authorizedDetails: adminModeldata.find(value => value._id.equals(handledSubAdmin))
                    }))
                    allUsersCount = await userSModel.countDocuments({handledSubAdmin: tokenResult.decode.id, ...filter});
                    inactiveUsers = await userSModel.find({handledSubAdmin: tokenResult.decode.id,status: "Inactive", ...filter}).countDocuments()
                    let totalUsersCount = await userSModel.countDocuments({handledSubAdmin: tokenResult.decode.id, ...filter});
                    totaPages = Math.ceil(allUsersCount / limit)
                    res.status(200).send({message:"Data fetched successfully", data: passedData,total_records: allUsersCount , total_page: totaPages , current_page:page, totalUsersCount: totalUsersCount,inactiveUsers: inactiveUsers,assignedUserCount: allUsersCount})
                    break;
                default:
                    // console.log(await userSModel.find(req.query))
                    newRegistration = await userSModel.find(filter).sort({ _id: sort }).skip(skip).limit(limit);
                    // console.log(newRegistration)
                    passedData = await newRegistration.map(({_id,firstname,lastname,email,role,number,handledSubAdmin,status}) => ({
                        id: _id,
                        firstname,
                        lastname,
                        email,
                        role,
                        number,
                        handledSubAdmin,
                        status,
                        authorizedDetails: adminModeldata.find(value => value._id.equals(handledSubAdmin))
                    }))
                    
                    inactiveUsers = await userSModel.find({status: "Inactive"}).countDocuments(filter)
                    usersAssingnedCount = await userSModel.find({handledSubAdmin: tokenResult.decode.id}).countDocuments()
                    // await newRegistration.map((data) => console.log(data[0]));
                    // await newRegistration.map((data) => console.log("data",data.email,data["status"]));
                            // console.log(passedData)
                    allUsersCount = await userSModel.countDocuments(filter);
                    totaPages = Math.ceil(allUsersCount / limit)
                    res.status(200).send({message:"Data fetched successfully", data: passedData,total_records: allUsersCount , total_page: totaPages , current_page:page,skipDataCount: skip, totalUsersCount: allUsersCount,inactiveUsers: inactiveUsers, assignedUserCount: usersAssingnedCount})
                    //         break;
                    //     default:
                    //         res.status(401).send({message: "Token has expired"});
                    // }
            }
        } else{
            res.status(498).send({message: "Token not found"})
        }
    } catch(err){
        console.log(err)
        switch(true){
            case err.name == "TokenExpiredError":
                res.status(401).send({message: "Token has expired"})
                break;
            default:
                res.send({message: "An unexpected error occurred. Please try again later."})
        }
    }
}

const handleGetParticularUsers = async(req,res) => {
    try{
        const userId = req.params.id;
        const fetchDataById = await userSModel.findById({_id: userId });
        // console.log(fetchDataById)
        let passObject = {
            id: fetchDataById._id,
            firstname: fetchDataById.firstname,
            lastname: fetchDataById.lastname,
            email: fetchDataById.email,
            role: fetchDataById.role,
            handledSubAdmin: fetchDataById.handledSubAdmin,
            number: fetchDataById.number,
            status: fetchDataById.status
        }
        let adminDetails = await adminSModel.findById({_id: passObject.handledSubAdmin});
        // console.log(adminDetails);
        if(adminDetails != null){
            adminDetails = {
                id: adminDetails._id,
                firstname: adminDetails.firstname,
                email: adminDetails.email,
                role: adminDetails.role,
                hasAllRights: adminDetails.hasAllRights,
                mnumber: adminDetails.mnumber,
            }
            passObject = {adminDetails, ...passObject}
            res.status(200).send({message:"data fetched" , data: passObject});
        } else{
            passObject = {adminDetails, ...passObject}
            res.status(200).send({message:"data fetched" , data: passObject});
        }
    } catch(err){
        // console.log(err)
        res.status(400).send("Something went wrong");
    }
}

const handleUpdateUser = async(req,res) => {
    try{
        const requestedObject = req.body;
        const headersToken = req.headers['authorization']
        // console.log(requestedObject)
        if(headersToken){
            const token  = headersToken.split(" ")[1];
            // console.log(token);
            const tokenResult = await verifyJWTToken(token);
            // console.log("tokenResult",tokenResult);
            if(tokenResult.decode.role == "admin" || (tokenResult.decode.role == "subadmin" && requestedObject.hasAllRights == "Yes")){
                // console.log("inside if");
                const editedAuthorizeddata = await userSModel.findOneAndUpdate({_id: req.params.id }, requestedObject.body);
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
            default:
                res.send({message: "Something went wrong"})
        }
    }
}

const handleDeleteUser = async(req,res) => {
    try{
        const requestedObject = req.body;
        const headersToken = req.headers['authorization']
        // console.log(requestedObject)
        
        if(headersToken){
            const token  = headersToken.split(" ")[1];
            // console.log(token);
            const tokenResult = await verifyJWTToken(token);
            // console.log("tokenResult",tokenResult);
            if(tokenResult.decode.role == "admin" || (tokenResult.decode.role == "subadmin" && requestedObject.hasAllRights == "Yes")){
                // console.log("inside if");
                const deleteAuthorizedId = await userSModel.findOneAndDelete({_id: req.params.id });
                // console.log(await adminSModel.findById({_id: req.params.id }))
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
                res.status(403).send({message: "An unexpected error occurred. Please try again later."})
        }
    }
}

const handleSendPasswordResetLink = (req,res) => {
    try {
        console.log(req.body.email)
        // switch(true){

        // }
    } catch (error) {
        
    }
}

export {handleCreateNewUser,handleGetUsers,handleGetParticularUsers,handleUpdateUser,handleDeleteUser,handleSendPasswordResetLink}