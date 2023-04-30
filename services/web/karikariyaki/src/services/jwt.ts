import { JwtPayload, sign, verify } from "jsonwebtoken";
import { CookieOptions, NextFunction, Request, Response } from "express";
import randToken from "rand-token";

// Types
import { InHouseError, Statics } from "@types";

// Services
import { OperatorService, ResponseService } from "@services";

export class JWTService {
    public static encodeAccessToken(userName: string): string {
        if (!process.env.SECRET || !process.env.COOKIE_NAME) {
            throw new InHouseError(
                503,
                "Invalid cookie settings, please contact the adminstrator"
            );
        }

        return sign({ userName: userName.trim() }, process.env.SECRET, {
            expiresIn: JWTService.getExpirationTimeInMs(),
        });
    }

    public static encodeRefreshToken(userName: string): string {
        if (
            !process.env.COOKIE_REFRESH_NAME ||
            !process.env.SECRET_REFRESH_SIZE ||
            Number.isNaN(parseInt(process.env.SECRET_REFRESH_SIZE))
        ) {
            throw new InHouseError(
                503,
                "Invalid cookie settings, please contact the adminstrator"
            );
        }

        return sign(
            {
                code: randToken.generate(
                    parseInt(process.env.SECRET_REFRESH_SIZE)
                ),
                userName: userName.trim(),
            },
            process.env.SECRET_REFRESH,
            {
                expiresIn: JWTService.getRefreshExpirationTimeInMs(),
            }
        );
    }

    public static decodeAccessToken(accessToken: string): JwtPayload {
        if (!process.env.SECRET) {
            throw new InHouseError(
                503,
                "Invalid cookie settings, please contact the adminstrator"
            );
        }

        if (!accessToken) {
            throw new InHouseError(403, "No access token provided");
        }

        const result = verify(accessToken, process.env.SECRET);

        if (typeof result === "string") {
            throw new InHouseError(403, "Invalid refresh token result");
        }

        return result;
    }

    public static decodeRefreshToken(refreshToken: string): JwtPayload {
        if (!process.env.SECRET_REFRESH) {
            throw new InHouseError(
                503,
                "Invalid cookie settings, please contact the adminstrator"
            );
        }

        if (!refreshToken) {
            throw new InHouseError(403, "No refresh token provided");
        }

        const result = verify(refreshToken, process.env.SECRET_REFRESH);

        if (typeof result === "string") {
            throw new InHouseError(403, "Invalid refresh token result");
        }

        return result;
    }

    public static saveCookies(res: Response, userName: string) {
        res.cookie(
            process.env.COOKIE_NAME,
            JWTService.encodeAccessToken(userName),
            JWTService.getDefaultCookieOptions()
        );

        res.cookie(
            process.env.COOKIE_REFRESH_NAME,
            JWTService.encodeRefreshToken(userName),
            JWTService.getDefaultCookieOptions()
        );
    }

    public static async refreshCookies(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const accessToken = req.cookies[process.env.COOKIE_NAME];

        let userName = "";
        let hasAccessTokenExpired = false;

        try {
            userName = JWTService.decodeAccessToken(accessToken).userName;
        } catch (error) {
            if (error.name !== "TokenExpiredError") {
                JWTService.clearCookies(res);

                res.status(error.code ?? 500).json(
                    ResponseService.generateFailedResponse(error.message)
                );

                return;
            }

            hasAccessTokenExpired = true;
        }

        if (hasAccessTokenExpired) {
            const refreshToken = req.cookies[process.env.COOKIE_REFRESH_NAME];

            const defaultCookieOptions = JWTService.getDefaultCookieOptions();

            try {
                userName = JWTService.decodeRefreshToken(refreshToken).userName;

                const refreshedAccessToken =
                    JWTService.encodeAccessToken(userName);
                const refreshedRefreshToken =
                    JWTService.encodeRefreshToken(userName);

                res.cookie(
                    process.env.COOKIE_NAME,
                    refreshedAccessToken,
                    defaultCookieOptions
                );

                res.cookie(
                    process.env.COOKIE_REFRESH_NAME,
                    refreshedRefreshToken,
                    defaultCookieOptions
                );
            } catch (error) {
                JWTService.clearCookies(res);

                res.status(error.code ?? 500).json(
                    ResponseService.generateFailedResponse(error.message)
                );

                return;
            }
        }

        try {
            const foundOperator = await OperatorService.queryByUserName(
                userName
            );

            if (!foundOperator) {
                res.status(404).json(
                    ResponseService.generateFailedResponse("Operator not found")
                );

                return;
            }

            next();
        } catch (error) {
            JWTService.clearCookies(res);

            res.status(500).json(
                ResponseService.generateFailedResponse(error.message)
            );
        }
    }

    public static clearCookies(res: Response) {
        if (!res) {
            return;
        }

        res.clearCookie(process.env.COOKIE_NAME);
        res.clearCookie(process.env.COOKIE_REFRESH_NAME);
    }

    public static getExpirationTimeInMs() {
        return (
            (parseInt(process.env.COOKIE_EXPIRATION_TIME_IN_DAYS) ??
                Statics.DEFAULT_COOKIE_EXPIRATION_TIME_IN_DAYS) *
            24 *
            60 *
            60 *
            1000
        );
    }

    public static getRefreshExpirationTimeInMs() {
        return (
            (parseInt(process.env.COOKIE_REFRESH_EXPIRATION_TIME_IN_DAYS) ??
                Statics.DEFAULT_COOKIE_REFRESH_EXPIRATION_TIME_IN_DAYS) *
            24 *
            60 *
            60 *
            1000
        );
    }

    public static getExpirationTimeInDate() {
        return new Date(Date.now() + JWTService.getExpirationTimeInMs());
    }

    public static getRefreshExpirationTimeInDate() {
        return new Date(Date.now() + JWTService.getRefreshExpirationTimeInMs());
    }

    public static getDefaultCookieOptions(): CookieOptions {
        return {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        };
    }
}
