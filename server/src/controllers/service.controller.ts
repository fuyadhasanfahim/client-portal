import { Request, Response } from "express";
import ServiceServices from "../services/service.service.js";
import { AddServiceSchema } from "../validators/service.validator.js";

async function getServices(req: Request, res: Response) {
    try {
        const {
            search = "",
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
            filter,
        } = req.query;

        const data = await ServiceServices.getServicesFromDB({
            search: search as string,
            page: Number(page),
            limit: Number(limit),
            sortBy: sortBy as
                | "createdAt"
                | "updatedAt"
                | "name"
                | "price"
                | undefined,
            filter: filter as string,
            sortOrder: sortOrder as "asc" | "desc",
        });

        if (!data) {
            res.status(404).json({
                success: false,
                message: "No services found!",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

async function getService(req: Request, res: Response) {
    try {
        const { serviceID } = req.params as any;

        if (!serviceID) {
            res.status(400).json({
                success: false,
                message: "Service id is missing.",
            });
        }

        const service = await ServiceServices.getServiceFromDB(serviceID);

        res.status(200).json({
            success: true,
            data: service,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

async function newService(req: Request, res: Response) {
    try {
        const body = await req.body;

        if (!body || typeof body !== "object") {
            res.status(400).json({ success: false, message: "No data found!" });
            return;
        }

        const parsed = AddServiceSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(422).json({
                success: false,
                message: "Validation failed",
                issues: parsed.error.issues,
            });
            return;
        }

        const service = await ServiceServices.newServiceInDB(parsed.data);

        if (!service) {
            res.status(404).json({
                success: false,
                message: "Something went wrong creating service.",
            });
            return;
        }

        res.status(201).json({
            success: true,
            message: "Service created successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

async function deleteService(req: Request, res: Response) {
    try {
        const { serviceID } = req.params as any;

        if (!serviceID) {
            res.status(400).json({
                success: false,
                message: "Service id is missing.",
            });
        }

        await ServiceServices.deleteServiceFromDB(serviceID);

        res.status(200).json({
            success: true,
            message: "Service deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

async function editService(req: Request, res: Response) {
    try {
        const { serviceID } = req.params as any;
        const data = req.body;

        if (!serviceID) {
            res.status(400).json({
                success: false,
                message: "Service id is missing.",
            });
        }

        await ServiceServices.editServiceInDB({ serviceID, data });

        res.status(200).json({
            success: true,
            message: "Service edited successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

const ServiceControllers = {
    getServices,
    newService,
    deleteService,
    getService,
    editService,
};
export default ServiceControllers;
