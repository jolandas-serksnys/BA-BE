import { TableClaimController } from "./tableClaim.controller";
import {
  Customer,
  Employee,
  EmployeeRole,
  Establishment,
  SignUpCode,
  Table
} from "../models";
import { ResponseType } from "../utils";
import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";

const MESSAGE_SIGNED_IN = 'Successfully signed in';
const MESSAGE_SIGNED_UP = 'Successfully signed up';
const MESSAGE_BAD_INFO = 'Wrong email or password';
const MESSAGE_ACCOUNT_UPDATED = 'Account details have been successfully updated';
const MESSAGE_404 = 'Couldn\'t find requested table';
const ERROR_ESTABLISHMENT_NOT_FOUND = 'Couldn\'t find establishment';
const ERROR_SIGN_UP_CODE_NOT_FOUND = 'Sign up code is invalid';
const ERROR_PASSWORD_MISMATCH = 'Passwords don\'t match';
const MESSAGE_PASSWORD_UPDATED = 'Password has been successfully updated';

export class AuthController {

  public getUser = async (req: Request, res: Response) => {
    try {
      const { isEmployee, userId } = req.body;

      if (isEmployee) {
        await Employee.findByPk(userId)
          .then((employee) => {
            const returnBody = {
              ...employee.get({ plain: true }),
              isEmployee: true,
              password: undefined
            };

            res.status(200).send({
              user: returnBody
            });
          })
      } else {
        await Customer.findByPk(userId)
          .then((customer) => {
            const returnBody = {
              ...customer.get({ plain: true }),
              isEmployee: false,
            };

            res.status(200).send({
              isSuccessful: true,
              type: ResponseType.SUCCESS,
              data: returnBody
            });
          })
      }
    } catch (error) {
      res.status(400).send({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public customerSignIn = async (req: Request, res: Response) => {
    try {
      const { tableId } = req.body;

      const table = await Table.findByPk(tableId);

      if (!table) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      const tableClaimController = new TableClaimController();
      return await tableClaimController.claim(table, req, res);
    } catch (error) {
      res.status(400).send({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public employeeSignIn = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const employee = await Employee.findOne({
        where: {
          email
        }
      });

      if (!employee) {
        return res.status(404).send({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_BAD_INFO
        });
      }

      const passwordIsValid = bcrypt.compareSync(
        password,
        employee.getDataValue('password')
      );

      if (!passwordIsValid) {
        return res.status(404).send({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_BAD_INFO
        });
      }

      const tokenBody = {
        ...employee.get({ plain: true }),
        password: undefined,
        isEmployee: true
      };
      const token = jwt.sign(tokenBody, process.env.SECRET, {
        expiresIn: 86400 // 24 hours
      });

      res.status(200).send({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: {
          user: tokenBody,
          accessToken: token
        },
        message: MESSAGE_SIGNED_IN
      });
    } catch (error) {
      res.status(400).send({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public employeeSignUp = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.params;
      const { email, password, firstName, lastName, signUpCode: code } = req.body;

      const establishment = await Establishment.findByPk(establishmentId);

      if (!establishment) {
        return res.status(404).send({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: ERROR_ESTABLISHMENT_NOT_FOUND
        });
      }

      const employeesCount = await Employee.count();

      let signUpCode;

      if (employeesCount === 0) {
        await SignUpCode.create({
          establishmentId: establishment.id,
          role: EmployeeRole.ADMINISTRATOR,
          code: 'admin'
        }).then((node) => signUpCode = node);
      } else {
        signUpCode = await SignUpCode.findOne({
          where: {
            code,
            isClaimed: false
          }
        });
      }

      if (!signUpCode) {
        return res.status(400).send({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: ERROR_SIGN_UP_CODE_NOT_FOUND
        });
      }

      const employee = await Employee.create({
        email,
        firstName,
        lastName,
        password: bcrypt.hashSync(password, 8),
        role: signUpCode.role,
        signUpCodeId: signUpCode.id,
        establishmentId: establishment.id
      });

      await signUpCode.update({
        isClaimed: true
      });

      const tokenBody = {
        ...employee.get({ plain: true }),
        password: undefined,
        isEmployee: true
      };
      const token = jwt.sign(tokenBody, process.env.SECRET, {
        expiresIn: 86400 // 24 hours
      });

      res.status(201).send({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: {
          user: tokenBody,
          accessToken: token
        },
        message: MESSAGE_SIGNED_UP
      });

    } catch (error) {
      res.status(400).send({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public employeeUpdateAccount = async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, userId } = req.body;

      await Employee.findByPk(userId)
        .then(async (employee) => {
          await employee.update({ firstName, lastName });

          res.status(200).send({
            isSuccessful: true,
            type: ResponseType.SUCCESS,
            data: {
              ...employee.get({ plain: true }),
              password: undefined,
              isEmployee: true
            },
            message: MESSAGE_ACCOUNT_UPDATED
          });
        })
    } catch (error) {
      res.status(400).send({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public employeeUpdatePassword = async (req: Request, res: Response) => {
    try {
      const { currentPassword, password, passwordConfirmation, userId } = req.body;

      const employee = await Employee.findByPk(userId);

      const passwordIsValid = bcrypt.compareSync(
        currentPassword,
        employee.getDataValue('password')
      );

      if (!passwordIsValid || password !== passwordConfirmation) {
        return res.status(400).send({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: ERROR_PASSWORD_MISMATCH
        });
      }

      await Employee.findByPk(userId)
        .then(async (employee) => {
          await employee.update({ password: bcrypt.hashSync(password, 8) });

          res.status(200).send({
            isSuccessful: true,
            type: ResponseType.SUCCESS,
            data: {
              ...employee.get({ plain: true }),
              password: undefined,
              isEmployee: true
            },
            message: MESSAGE_PASSWORD_UPDATED
          });
        })
    } catch (error) {
      res.status(400).send({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };
}