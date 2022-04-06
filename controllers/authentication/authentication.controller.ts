import { Request, Response } from "express";
import { Customer, Employee, Table } from "../../models";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { config } from "../../config";
import { TableController } from "..";
import { ResponseType } from "../../utils";

const MESSAGE_SIGNED_IN = 'Successfully signed in';
const MESSAGE_SIGNED_UP = 'Successfully signed up';
const MESSAGE_BAD_INFO = 'Wrong email or password';
const MESSAGE_EMAIL_TAKEN = 'Email is already taken';
const MESSAGE_ACCOUNT_UPDATED = 'Account details have been successfully updated';
const MESSAGE_404 = 'Couldn\'t find requested table';
const MESSAGE_401 = 'Unauthorized';

export class AuthController {
  public getUser = async (req: Request) => {
    const error = {
      isEmployee: null,
      userId: null
    };

    const authorization = req.headers['authorization'];
    const token = authorization.split(' ')[1];

    if (!authorization || !token) {
      return error;
    }

    const tokenBody = jwt.decode(token);

    if (!tokenBody
      || tokenBody['isEmployee'] === undefined
      || tokenBody['id'] === undefined
      || tokenBody['exp'] < Date.now() / 1000) {
      return error;
    }

    const isEmployee = tokenBody['isEmployee'] as boolean;
    const userId = tokenBody['id'] as number;

    return { isEmployee, userId };
  }

  public getUserByToken = async (token: string) => {
    const error = {
      isEmployee: null,
      userId: null
    };

    if (!token) {
      return error;
    }

    const tokenBody = jwt.decode(token);

    if (!tokenBody || tokenBody['isEmployee'] === undefined || tokenBody['id'] === undefined) {
      return error;
    }

    const isEmployee = tokenBody['isEmployee'] as boolean;
    const userId = tokenBody['id'] as number;

    return { isEmployee, userId };
  }

  public user = async (req: Request, res: Response) => {
    const { isEmployee, userId } = await this.getUser(req);

    if (!userId) {
      return res.status(401).send({
        message: 'Not signed in',
        accessToken: undefined
      });
    }

    if (isEmployee) {
      Employee.findByPk(userId)
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
        .catch((error) => {
          res.status(500).send({ isSuccessful: false, type: ResponseType.DANGER, message: error.message });
        });
    } else {
      Customer.findByPk(userId)
        .then((customer) => {
          const returnBody = {
            ...customer.get({ plain: true }),
            isEmployee: false,
          };

          res.status(200).send({ isSuccessful: true, type: ResponseType.SUCCESS, data: returnBody });
        })
        .catch((error) => {
          res.status(500).send({ isSuccessful: false, type: ResponseType.DANGER, message: error.message });
        });
    }
  };

  public customerSignIn = (req: Request, res: Response) => {
    const { tableId } = req.body;

    Table.findByPk(tableId)
      .then((table) => {
        if (table) {
          const tableController = new TableController();
          return tableController.claim(table, req, res);
        }
        else {
          res.status(404).json({ isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_404 });
        }
      })
      .catch((error) => {
        res.status(500).send({ isSuccessful: false, type: ResponseType.DANGER, message: error.message });
      });
  };

  public employeeSignIn = (req: Request, res: Response) => {
    const { email, password } = req.body;

    Employee.findOne({
      where: {
        email
      }
    })
      .then(employee => {
        if (!employee) {
          return res.status(404).send({ isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_BAD_INFO });
        }

        const passwordIsValid = bcrypt.compareSync(
          password,
          employee.getDataValue('password')
        );

        if (!passwordIsValid) {
          return res.status(401).send({ isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_BAD_INFO });
        }

        const tokenBody = {
          ...employee.get({ plain: true }),
          password: undefined,
          isEmployee: true
        };
        const token = jwt.sign(tokenBody, config.secret, {
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
      })
      .catch((error) => {
        res.status(500).send({ isSuccessful: false, type: ResponseType.DANGER, message: error.message });
      });
  };

  public employeeSignUp = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    const employee = await Employee.findOne({ where: { email: email } });

    if (employee) {
      return res.status(400).send({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: MESSAGE_EMAIL_TAKEN
      });
    }

    Employee.create({
      email,
      firstName,
      lastName,
      password: bcrypt.hashSync(password, 8),
      role: 'GENERAL'
    })
      .then(employee => {
        const tokenBody = {
          ...employee.get({ plain: true }),
          password: undefined,
          isEmployee: true
        };
        const token = jwt.sign(tokenBody, config.secret, {
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
      })
      .catch((error) => {
        res.status(500).send({ isSuccessful: false, type: ResponseType.DANGER, message: error.message });
      });
  };

  public employeeUpdateAccount = async (req: Request, res: Response) => {
    const { firstName, lastName } = req.body;

    const employee = await this.getUser(req);

    if (!employee) {
      return res.status(401).send({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: MESSAGE_401
      });
    }

    Employee.findByPk(employee.userId)
      .then(async (employee) => {
        await employee.update({ firstName, lastName });

        res.status(201).send({
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
      .catch((error) => {
        res.status(500).send({ isSuccessful: false, type: ResponseType.DANGER, message: error.message });
      });
  };
}