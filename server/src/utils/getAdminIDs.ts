import UserModel from "../models/user.model.js";

export const getAdminIDs = async (): Promise<string[]> => {
    const admins = await UserModel.find({
        role: { $in: ["admin"] },
    });

    return admins.map((admin) => admin.userID);
};
