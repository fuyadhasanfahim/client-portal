import { Router } from "express";
import UserControllers from "../controllers/user.controller.js";
import upload from "../middleware/multer.js";

const router = Router();

router.get("/me", UserControllers.getMe);
router.get("/get-info/:userID", UserControllers.getUserInfo);
router.put("/update-info/:userID", UserControllers.updateUserInfo);
router.put("/update-password/:userID", UserControllers.updateUserPassword);
router.put(
    "/upload-avatar/:userID",
    upload.single("image"),
    UserControllers.uploadAvatar
);
router.get("/get-users", UserControllers.getUsers);
router.get("/get-clients", UserControllers.getClients);
router.get("/get-team-members", UserControllers.getTeamMembers);
router.put(
    "/update-team-member-info/:id",
    UserControllers.updateTeamMemberInfo
);

export const userRoute = router;
