import express from "express"
import { handleCreateNewUser, handleDeleteUser, handleGetParticularUsers, handleGetUsers, handleSendPasswordResetLink, handleUpdateUser } from "../controllers/userController.js"

const userController = express.Router();

userController.post("/users-create", handleCreateNewUser);
userController.get("/get-role-users", handleGetUsers);
userController.get("/get-role-users/:id", handleGetParticularUsers);
userController.put("/get-role-users/:id", handleUpdateUser);
userController.delete("/get-role-users/:id", handleDeleteUser);
userController.post("/password-link/:id", handleSendPasswordResetLink);

export default userController