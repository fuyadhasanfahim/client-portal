import { Router } from "express";
import ServiceControllers from "../controllers/service.controller.js";

const router = Router();

router.get("/get-services", ServiceControllers.getServices);
router.get("/get-service/:serviceID", ServiceControllers.getService);
router.post("/new-service", ServiceControllers.newService);
router.delete("/delete-service/:serviceID", ServiceControllers.deleteService);
router.put("/edit-service/:serviceID", ServiceControllers.editService);

export const serviceRoute = router;
