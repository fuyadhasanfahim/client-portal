/* eslint-disable @typescript-eslint/no-explicit-any */
import ServiceModel from "../models/service.model.js";
import { IService } from "../types/service.interface.js";

async function getServicesFromDB({
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    filter = "all",
}: {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "name" | "price";
    sortOrder?: "asc" | "desc";
    filter?: string;
}) {
    const query: Record<string, any> = {};

    if (search && search.trim().length > 0) {
        const rx = new RegExp(search.trim(), "i");
        query.$or = [
            { name: rx },
            { "types.name": rx },
            { "complexities.name": rx },
            { "types.complexities.name": rx },
        ];
    }

    switch (filter) {
        case "hasTypes":
            query.types = { $exists: true, $ne: [] };
            break;
        case "hasComplexities":
            query.$or = [
                ...(query.$or ?? []),
                { complexities: { $exists: true, $ne: [] } },
                {
                    types: {
                        $elemMatch: {
                            complexities: { $exists: true, $ne: [] },
                        },
                    },
                },
            ];
            break;
        case "hasPrice":
            query.price = { $exists: true, $ne: null };
            break;
        case "noPrice":
            query.$or = [
                ...(query.$or ?? []),
                { price: { $exists: false } },
                { price: null },
            ];
            break;
        case "hasOptions":
            query.options = true;
            break;
        case "hasInputs":
            query.inputs = true;
            break;
        case "disabledAny":
            query.disabledOptions = { $exists: true, $ne: [] };
            break;
        case "disabledNone":
            query.$or = [
                ...(query.$or ?? []),
                { disabledOptions: { $exists: false } },
                { disabledOptions: { $size: 0 } },
            ];
            break;
        case "all":
        default:
            break;
    }

    const sort: Record<string, 1 | -1> = [
        "createdAt",
        "updatedAt",
        "name",
        "price",
    ].includes(sortBy)
        ? { [sortBy]: sortOrder === "asc" ? 1 : -1 }
        : { createdAt: -1 };

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
        ServiceModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
        ServiceModel.countDocuments(query),
    ]);

    return {
        services,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

async function getServiceFromDB(serviceID: string) {
    const service = await ServiceModel.findById(serviceID);

    return service;
}

async function newServiceInDB(data: IService) {
    const service = await ServiceModel.create(data);

    return service;
}

async function deleteServiceFromDB(serviceID: string) {
    const service = await ServiceModel.findByIdAndDelete(serviceID);

    return service;
}

async function editServiceInDB({
    serviceID,
    data,
}: {
    serviceID: string;
    data: any;
}) {
    const service = await ServiceModel.findByIdAndUpdate(serviceID, data, {
        new: true,
    });

    return service;
}

const ServiceServices = {
    getServicesFromDB,
    newServiceInDB,
    deleteServiceFromDB,
    getServiceFromDB,
    editServiceInDB,
};
export default ServiceServices;
