import jwt from "jsonwebtoken";
import {env} from "../config/env";

interface TokenPayload {
	userId: number;
}

export const generateAccessToken = (userId: number): string => {
	return jwt.sign({userId}, env.JWT_ACCESS_SECRET, {expiresIn: "15m"});
};

export const generateRefreshToken = (userId: number): string => {
	return jwt.sign({userId}, env.JWT_REFRESH_SECRET, {expiresIn: "7d"});
};

export const verifyAccessToken = (token: string): TokenPayload => {
	return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
	return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};
