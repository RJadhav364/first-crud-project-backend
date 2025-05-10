import mongoose from "mongoose";

const connectionMongoDB = async() => {
    // console.log(process.env.MongoDB_path);
    // const dbUrl = "mongodb://127.0.0.1:27017/mytesting"
    // const dbUrl = "mongodb+srv://new_user_rohan:rohanJadhav@cluster0.no1et41.mongodb.net/mytesting"
    const dbUrl = "mongodb+srv://quanticteqrohan:2vKIS5QIhBV8@cluster0.iziyiap.mongodb.net/mytesting"
    
    return mongoose.connect(`${dbUrl}`)
    .then(() => console.log("database connected"))
    .catch((err) => {
        console.log("error while connecting database", err);
    })
}


export default connectionMongoDB