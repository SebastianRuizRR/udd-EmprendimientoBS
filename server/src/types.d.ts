
import { Request } from "express";
import { Sala } from "@prisma/client";

export interface CustomRequest extends Request {
    sala: Sala; 
}
