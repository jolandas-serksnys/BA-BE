import App from '../../app';
import request from 'supertest';
import { Customer, Employee, EmployeeRole, Establishment, SignUpCode, Table } from '../../models';
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { config } from '../../config';

describe('authentication.controller', () => {
  const displayName = 'TEST USER DISPLAY NAME';
  const employeeFirstName = 'TEST EMPLOYEE FIRST NAME';
  const tableDisplayName = 'TEST TABLE DISPLAY NAME';
  const signUpCode = 'SUCODE';

  let establishmentId: number = undefined;
  let tableId: number = undefined;
  let token: string = 'dummy';

  beforeAll(async () => {
    await Establishment.create({
      title: 'new establishment',
      description: 'test description',
    }).then(async (node) => {
      establishmentId = node.id;
    });

    await Table.create({
      displayName: tableDisplayName,
      seats: 1,
      establishmentId,
    }).then(async (node) => {
      tableId = node.id;
    });

    await SignUpCode.create({
      code: signUpCode,
      role: EmployeeRole.ADMINISTRATOR,
      establishmentId,
    });
  });

  afterAll(async () => {
    await Customer.destroy({
      where: {
        displayName: displayName
      }
    });

    await Employee.destroy({
      where: {
        firstName: employeeFirstName
      }
    });

    await Table.destroy({
      where: {
        id: tableId
      }
    });

    await Establishment.destroy({
      where: {
        id: establishmentId
      }
    });

    await SignUpCode.destroy({
      where: {
        code: signUpCode
      }
    });
  });

  it('should return forbidden when not signed in', (done) => {
    request(App.server)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .expect(401, done);
  });

  it('should not be able to sign in when table not found', (done) => {
    request(App.server)
      .post('/api/establishment/1/sign-in')
      .send({
        tableId: tableId + 1,
        displayName: displayName
      })
      .expect(404, done);
  });

  it('should be able to sign in', (done) => {
    request(App.server)
      .post('/api/establishment/1/sign-in')
      .send({
        tableId: tableId,
        displayName: 'test'
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        token = res.body.data.accessToken;
        done();
      });
  });

  it('should return user when signed in', (done) => {
    request(App.server)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should allow employee to create an account', (done) => {
    request(App.server)
      .post('/api/establishment/1/employee/sign-up')
      .send({
        email: 'testEmail@test.com',
        password: 'password',
        firstName: employeeFirstName,
        lastName: 'test',
        signUpCode: signUpCode,
      })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        token = res.body.data.accessToken;
        done();
      });
  });

  it('should be able to sign in as employee', (done) => {
    request(App.server)
      .post('/api/employee/sign-in')
      .send({
        email: 'testEmail@test.com',
        password: 'password'
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        token = res.body.data.accessToken;
        done();
      });
  });

  it('should allow employee to update account details', (done) => {
    request(App.server)
      .post('/api/employee/update-account')
      .send({
        firstName: employeeFirstName,
        lastName: 'test 2',
      })
      .expect(200, done());
  });

  it('should allow employee to change password', (done) => {
    request(App.server)
      .post('/api/employee/update-password')
      .send({
        currentPassword: 'password',
        password: 'password2',
        passwordConfirmation: 'password2',
      })
      .expect(200, done());
  });

});

describe('category.controller', () => {
  let establishmentId: number = undefined;
  let employeeId: number = undefined;
  let categoryId: number = undefined;
  let token: string = 'dummy';

  beforeAll(async () => {
    await Establishment.create({
      title: 'new establishment',
      description: 'test description',
    }).then(async (node) => {
      establishmentId = node.id;
    });

    await Employee.create({
      firstName: 'test',
      lastName: 'last name',
      email: 'email@emailtest.com',
      password: bcrypt.hashSync('password', 8),
      role: EmployeeRole.ADMINISTRATOR,
      establishmentId,
      signUpCodeId: 1,
    }).then(async (node) => {
      employeeId = node.id;

      const tokenBody = {
        ...node.get({ plain: true }),
        password: undefined,
        isEmployee: true
      };

      token = jwt.sign(tokenBody, config.secret, {
        expiresIn: 86400 // 24 hours
      });
    });
  });

  afterAll(async () => {
    await Employee.destroy({
      where: {
        id: employeeId
      }
    });

    await Establishment.destroy({
      where: {
        id: establishmentId
      }
    });
  });

  it('should be able to index', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/category`)
      .expect(200, done);
  });

  it('should be able to create', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/category`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test category',
        description: 'test description',
        isVisible: true,
      })
      .expect(201)
      .then((res) => {
        categoryId = res.body.data.id;
        done();
      });
  });

  it('should be able to show', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/category/${categoryId}`)
      .expect(200, done);
  });

  it('should be able to update', (done) => {
    request(App.server)
      .put(`/api/establishment/${establishmentId}/category/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'test category updated',
        description: 'test description updated',
      })
      .expect(200, done);
  });

  it('should be able to delete', (done) => {
    request(App.server)
      .delete(`/api/establishment/${establishmentId}/category/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });
});