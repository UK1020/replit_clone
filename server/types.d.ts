import { CartItem } from "@shared/schema";
import "express-session";

declare module "express-session" {
  interface SessionData {
    cart?: CartItem[];
  }
}