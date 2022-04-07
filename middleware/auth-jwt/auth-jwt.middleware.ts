import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken';
import { config } from "../../config";
import { Employee, EmployeeRole } from "../../models";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(403).send({
      message: 'Unauthenticated'
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }

    req.body.userId = decoded['id'];
    req.body.isEmployee = decoded['isEmployee'];
    return next();
  });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  Employee.findByPk(req.body.userId)
    .then((employee) => {
      if (!employee || employee.role !== EmployeeRole.ADMINISTRATOR) {
        res.status(403).send({
          message: 'Need admin rights'
        });
        return;
      }

      next();
    });
};

export const isEmployee = (req: Request, res: Response, next: NextFunction) => {
  Employee.findByPk(req.body.userId)
    .then((employee) => {
      if (!employee) {
        res.status(403).send({
          message: 'Need admin rights'
        });
        return;
      }

      next();
    });
};