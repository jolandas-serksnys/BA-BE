import { NextFunction, Request, Response } from "express";
import { Employee } from "../../models";

export const checkDuplicate = (req: Request, res: Response, next: NextFunction) => {
  Employee.findOne({
    where: {
      email: req.body.email
    }
  })
  .then(employee => {
    if (employee) {
      res.status(400).send({
        message: 'Employee with given email already exists'
      });
    } else {
      next();
    }
  })
}