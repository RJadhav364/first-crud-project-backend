import express from "express"
import { handleAuthorizedEdit, handleAuthorizedLoginSystem, handleAuthorizedparticular, handleCreateNewSuperior, handleDeleteSubadmin, handleEditProfile, handleListingAdminSubAdmin, handleSendPasswordResetLink } from "../controllers/adminController.js"

const adminController = express.Router();

adminController.post("/new-rolecontroller", handleCreateNewSuperior);
adminController.get("/admin-users", handleListingAdminSubAdmin);
adminController.post("/userlogin", handleAuthorizedLoginSystem);
adminController.put("/admin-edit/:id", handleAuthorizedEdit);
adminController.get("/admin-users/:id", handleAuthorizedparticular);
adminController.delete("/admin-delete/:id", handleDeleteSubadmin);
adminController.put("/profile-edit/:id", handleEditProfile);
adminController.post("/password-link", handleSendPasswordResetLink);

export default adminController