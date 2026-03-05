import { JwtPayload } from "jsonwebtoken";
import "ws";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        userId: string;
        role: string;
      };
    }
  }
}

declare module "ws" {
  interface WebSocket {
    user?: {
      userId: string,
      role: string
    };
  }
}