import App from '../../app';
import request from 'supertest';
import { Addon, Category, Customer, CustomerOrder, Dish, Employee, EmployeeRole, Establishment, SignUpCode, Table, TableClaim, TableClaimStatus, TableOrder } from '../../models';
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { config } from '../../config';

const createEstablishment = async () => {
  let establishmentId: number;

  await Establishment.create({
    title: 'new establishment',
    description: 'test description',
  }).then(async (node) => {
    establishmentId = node.id;
  });

  return establishmentId;
};

const createAdmin = async (establishmentId: number) => {
  let token: string;
  let employeeId: number;

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

    token = jwt.sign(tokenBody, process.env.SECRET, {
      expiresIn: 86400 // 24 hours
    });
  });

  return { token, employeeId };
};

describe('authentication.controller', () => {
  const displayName = 'TEST USER DISPLAY NAME';
  const employeeFirstName = 'TEST EMPLOYEE FIRST NAME';
  const tableDisplayName = 'TEST TABLE DISPLAY NAME';
  const signUpCode = 'SUCODE';

  let tableClaimId: number = undefined;
  let establishmentId: number = undefined;
  let tableId: number = undefined;
  let token: string = 'dummy';
  let customerId: number = undefined;
  let employeeId: number = undefined;

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
    await Customer.destroy({ where: { id: customerId } });
    await Employee.destroy({ where: { id: employeeId } });
    await Table.destroy({ where: { id: tableId } });
    await Establishment.destroy({ where: { id: establishmentId } });
    await SignUpCode.destroy({ where: { code: signUpCode } });
    await TableClaim.destroy({ where: { id: tableClaimId } });
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
        customerId = res.body.data.user.id;
        tableClaimId = res.body.data.user.tableClaimId;
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
        employeeId = res.body.data.user.id;
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

  it('should allow employee to toggle table claim seat limit', (done) => {
    request(App.server)
      .post(`/api/claim/${tableClaimId}/toggle-seats-limit`)
      .expect(200, done());
  });

  it('should allow employee to get asssitance requests', (done) => {
    request(App.server)
      .get(`/api/claim/${establishmentId}/assistance-requests`)
      .expect(200, done());
  });
});

describe('category.controller', () => {
  let establishmentId: number = undefined;
  let employeeId: number = undefined;
  let categoryId: number = undefined;
  let token: string = undefined;

  beforeAll(async () => {
    establishmentId = await createEstablishment();
    let { token: t, employeeId: e } = await createAdmin(establishmentId);
    employeeId = e;
    token = t;
  });

  afterAll(async () => {
    await Employee.destroy({ where: { id: employeeId } });
    await Establishment.destroy({ where: { id: establishmentId } });
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

describe('dish.controller dish', () => {
  let establishmentId: number = undefined;
  let employeeId: number = undefined;
  let categoryId: number = undefined;
  let dishId: number = undefined;
  let token: string = undefined;

  beforeAll(async () => {
    establishmentId = await createEstablishment();
    let { token: t, employeeId: e } = await createAdmin(establishmentId);
    employeeId = e;
    token = t;

    await Category.create({
      title: 'test category',
      description: 'test description',
      isVisible: true,
      establishmentId: establishmentId
    }).then(async (category) => {
      categoryId = category.id;
    });
  });

  afterAll(async () => {
    await Employee.destroy({ where: { id: employeeId } });
    await Category.destroy({ where: { id: categoryId } });
    await Establishment.destroy({ where: { id: establishmentId } });
  });

  it('should be able to index dishes', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/category/${categoryId}/dish`)
      .expect(200, done);
  });

  it('should be able to create dish', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/category/${categoryId}/dish`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test dish',
        description: 'test description',
        warningLabel: 'test warning',
        isVisible: true,
        isAvailable: true,
        basePrice: 10,
        imageUrl: 'test.com',
        tags: [],
        addons: [],
      })
      .expect(201)
      .then((res) => {
        dishId = res.body.data.id;
        done();
      });
  });

  it('should be able to show dish', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}`)
      .expect(200, done);
  });

  it('should be able to update dish', (done) => {
    request(App.server)
      .put(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test dish updated',
        description: 'test description updated',
        price: 10,
        isVisible: true,
      })
      .expect(200, done);
  });

  it('should toggle dish availability', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}/toggle-availability`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should toggle dish visibility', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}/toggle-visibility`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be able to delete dish', (done) => {
    request(App.server)
      .delete(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });
});

describe('dish.controller addons', () => {
  let establishmentId: number = undefined;
  let employeeId: number = undefined;
  let categoryId: number = undefined;
  let dishId: number = undefined;
  let addonId: number = undefined;
  let token: string = undefined;

  beforeAll(async () => {
    establishmentId = await createEstablishment();
    let { token: t, employeeId: e } = await createAdmin(establishmentId);
    employeeId = e;
    token = t;

    await Category.create({
      title: 'test category',
      description: 'test description',
      isVisible: true,
      establishmentId: establishmentId
    }).then(async (category) => {
      categoryId = category.id;
    });

    await Dish.create({
      title: 'test dish',
      description: 'test description',
      warningLabel: 'test warning',
      isVisible: true,
      isAvailable: true,
      basePrice: 10,
      imageUrl: 'test.com',
      tags: [],
      addons: [],
      categoryId: categoryId
    }).then(async (dish) => {
      dishId = dish.id;
    });
  });

  afterAll(async () => {
    await Employee.destroy({ where: { id: employeeId } });
    await Addon.destroy({ where: { id: addonId } });
    await Dish.destroy({ where: { id: dishId } });
    await Category.destroy({ where: { id: categoryId } });
    await Establishment.destroy({ where: { id: establishmentId } });
  });

  it('should be able to create addons', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}/addons`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test addon',
        description: 'test description',
        price: 10,
        isOptional: true,
        isMultiple: true,
      })
      .expect(201)
      .end((err, res) => {
        addonId = res.body.data.id;
        done();
      });
  });

  it('should be able to update addons', (done) => {
    request(App.server)
      .put(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}/addons/${addonId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test addon updated',
        description: 'test description updated',
        price: 10,
        isOptional: true,
        isMultiple: true,
      })
      .expect(200, done);
  });

  it('should be able to delete addons', (done) => {
    request(App.server)
      .delete(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}/addons/${addonId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });
});

describe('table.controller', () => {
  let establishmentId: number = undefined;
  let employeeId: number = undefined;
  let token: string = undefined;
  let tableId: number = undefined;

  beforeAll(async () => {
    establishmentId = await createEstablishment();
    let { token: t, employeeId: e } = await createAdmin(establishmentId);
    employeeId = e;
    token = t;
  });

  afterAll(async () => {
    await Employee.destroy({ where: { id: employeeId } });
    await Establishment.destroy({ where: { id: establishmentId } });
  });

  it('should be able to create table', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/table`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        displayName: 'test table',
        number: 1,
        isAvailable: true,
        seats: 10,
      })
      .expect(201)
      .then((res) => {
        tableId = res.body.data.id;
        done();
      });
  });

  it('should be able to show table', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/table/${tableId}`)
      .expect(200, done);
  });

  it('should be able to update table', (done) => {
    request(App.server)
      .put(`/api/establishment/${establishmentId}/table/${tableId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        displayName: 'test table updated',
        number: 1,
        isAvailable: true,
        seats: 10,
      })
      .expect(200, done);
  });

  it('should be able to delete table', (done) => {
    request(App.server)
      .delete(`/api/establishment/${establishmentId}/table/${tableId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });
});

describe('order.controller', () => {
  let establishmentId: number = undefined;
  let customerId: number = undefined;
  let token: string = undefined;
  let tableId: number = undefined;
  let categoryId: number = undefined;
  let dishId: number = undefined;
  let tableOrderId: number = undefined;
  let customerOrderId: number = undefined;
  let tableClaimId: number = undefined;

  beforeAll(async () => {
    establishmentId = await createEstablishment();

    await Category.create({
      title: 'test category',
      description: 'test description',
      isVisible: true,
      establishmentId: establishmentId
    }).then(async (category) => {
      categoryId = category.id;
    });

    await Dish.create({
      title: 'test dish',
      description: 'test description',
      warningLabel: 'test warning',
      isVisible: true,
      isAvailable: true,
      basePrice: 10,
      imageUrl: 'test.com',
      tags: [],
      addons: [],
      categoryId: categoryId
    }).then(async (dish) => {
      dishId = dish.id;
    });

    await Table.create({
      displayName: 'test table',
      number: 1,
      isAvailable: true,
      seats: 10,
      establishmentId: establishmentId
    }).then(async (table) => {
      tableId = table.id;
    });

    await TableClaim.create({
      tableId: tableId,
      requestsEnabled: true,
      status: TableClaimStatus.ACTIVE,
      requestCode: 'test',
      allowSeatsBypass: true,
    })
      .then(async (tableClaim) => {
        tableClaimId = tableClaim.id;

        await Customer.create({
          displayName: 'test customer',
          tableClaimId
        }).then(async (customer) => {
          customerId = customer.id;

          const tokenBody = {
            ...customer.get({ plain: true }),
            isEmployee: false
          };

          token = jwt.sign(tokenBody, process.env.SECRET, {
            expiresIn: 86400 // 24 hours
          });
        });
      });
  });

  afterAll(async () => {
    await CustomerOrder.destroy({ where: { id: customerOrderId } });
    await TableOrder.destroy({ where: { id: tableOrderId } });
    await Customer.destroy({ where: { id: customerId } });
    await Dish.destroy({ where: { id: dishId } });
    await Table.destroy({ where: { id: tableId } });
    await TableClaim.destroy({ where: { id: tableClaimId } });
    await Establishment.destroy({ where: { id: establishmentId } });
  });

  it('should be able to calculate price', (done) => {
    request(App.server)
      .post(`/api/order/price`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        dishId: dishId,
        options: [],
        quantity: 1
      })
      .expect(200, done);
  });

  it('should be able to create order', (done) => {
    request(App.server)
      .post(`/api/order`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        tableClaimId: tableClaimId,
        dishId: dishId,
        options: [],
        quantity: 1,
        comment: 'test comment',
      })
      .expect(201)
      .then((res) => {
        tableOrderId = res.body.data.tableOrderId;
        customerOrderId = res.body.data.customerOrderId;
        done();
      });
  });

  it('should be able to show table order', (done) => {
    request(App.server)
      .get(`/api/order/table`)
      .expect(200)
      .end((err, res) => {
        done();
      });
  });

  it('should be able to show receipts', (done) => {
    request(App.server)
      .get(`/api/order/receipts`)
      .expect(200)
      .end((err, res) => {
        done();
      });
  });

  it('should be able to show customer receipt', (done) => {
    request(App.server)
      .get(`/api/order/receipt/customer`)
      .expect(200)
      .end((err, res) => {
        done();
      });
  });

  it('should be able to show receipt total', (done) => {
    request(App.server)
      .get(`/api/order/receipt/total`)
      .expect(200)
      .end((err, res) => {
        done();
      });
  });
});

describe('tableClaim.controller', () => {
  let establishmentId: number = undefined;
  let token: string = undefined;
  let tableId: number = undefined;
  let tableClaimId: number = undefined;

  beforeAll(async () => {
    establishmentId = await createEstablishment();

    await Table.create({
      displayName: 'test table',
      number: 1,
      isAvailable: true,
      seats: 10,
      establishmentId: establishmentId
    }).then(async (table) => {
      tableId = table.id;
    });
  });

  afterAll(async () => {
    await TableClaim.destroy({ where: { id: tableClaimId } });
    await Table.destroy({ where: { id: tableId } });
    await Establishment.destroy({ where: { id: establishmentId } });
  });

  it('should check availability', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/table/${tableId}/check-availability`)
      .expect(200, done);
  });

  it('should be able to claim table', (done) => {
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
        tableClaimId = res.body.data.user.tableClaimId;
        done();
      });
  });

  it('should be able to toggle table claim access requests', (done) => {
    request(App.server)
      .post(`/api/toggle-access-requests`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be able to request assistance', (done) => {
    request(App.server)
      .post(`/api/assistance`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });
});