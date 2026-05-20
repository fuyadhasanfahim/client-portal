import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import { getToken } from "next-auth/jwt";

const { node_env, auth_secret } = envConfig;

interface TokenPayload extends jwt.JwtPayload {
    id: string;
    role: string;
}

export const verifyAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const token = await getToken({
        req,
        secret: auth_secret!,
        secureCookie: node_env === "production",
    });

    if (!token) {
        res.status(401).json({ message: "No token found in cookies" });
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).user = token as TokenPayload;
        next();
    } catch (err) {
        res.status(401).json({
            message: "Invalid or expired token",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};
