import { RequestHandler } from "express";

export const asyncHandler =
  (requestHandler: RequestHandler): RequestHandler =>{
   return (req, res, next) =>
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  }
  