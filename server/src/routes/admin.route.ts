import { Router } from "express";
import AdminControllers from "../controllers/admin.controller.js";

const router = Router();

router.post("/new-user", AdminControllers.newUser);
router.get("/get-users", AdminControllers.getUsers);
router.get("/get-users/:userID", AdminControllers.getUserByID);
router.delete("/delete-user/:userID", AdminControllers.deleteUserByID);

export const adminRoute = router;
