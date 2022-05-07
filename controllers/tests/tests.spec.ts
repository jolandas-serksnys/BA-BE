import App from '../../app';
import request from 'supertest';
import {
  Addon,
  AssistanceRequestType,
  Category,
  Customer,
  CustomerOrder,
  CustomerOrderStatus,
  Dish,
  Employee,
  EmployeeRole,
  Establishment,
  Option,
  SignUpCode,
  Table,
  TableClaim,
  TableClaimStatus,
  TableOrder
} from '../../models';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

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
  let token = 'dummy';
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
        tableId: '555555',
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
    const { token: t, employeeId: e } = await createAdmin(establishmentId);
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
      .set('Authorization', `Bearer ${token}`)
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
      .set('Authorization', `Bearer ${token}`)
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

describe('dish.controller', () => {
  let establishmentId: number = undefined;
  let employeeId: number = undefined;
  let categoryId: number = undefined;
  let dishId: number = undefined;
  let token: string = undefined;
  let addonId: number = undefined;

  beforeAll(async () => {
    establishmentId = await createEstablishment();
    const { token: t, employeeId: e } = await createAdmin(establishmentId);
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
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be able to index dishes all', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/category/${categoryId}/dish/all`)
      .set('Authorization', `Bearer ${token}`)
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

  it('should be able to get dish', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should not be able to get dish', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/category/${categoryId}/dish/3545`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404, done);
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

  it('should not be able to update dish', (done) => {
    request(App.server)
      .put(`/api/establishment/${establishmentId}/category/${categoryId}/dish/4545`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test dish updated',
        description: 'test description updated',
        price: 10,
        isVisible: true,
      })
      .expect(404, done);
  });

  it('should toggle dish availability', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}/toggle-availability`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should not toggle dish availability', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/category/${categoryId}/dish/54456/toggle-availability`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404, done);
  });

  it('should toggle dish visibility', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}/toggle-visibility`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should not toggle dish visibility', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/category/${categoryId}/dish/5456/toggle-visibility`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404, done);
  });

  it('should be able to create dish addon', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}/addon`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test dish addon',
        description: 'test description',
        price: 10,
        isVisible: true,
      })
      .expect(201)
      .then((res) => {
        addonId = res.body.data.id;
        done();
      });
  });

  it('should not be able to create dish addon', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/category/123/dish/${dishId}/addon`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test dish addon',
        description: 'test description',
        price: 10,
        isVisible: true,
      })
      .expect(404, done);
  });

  it('should be able to index dish addons', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}/addon`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should not be able to index dish addons', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/category/4544/dish/${dishId}/addon`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404, done);
  });

  it('should be able to update dish addon', (done) => {
    request(App.server)
      .put(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}/addons/${addonId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test dish addon',
        description: 'test description',
        price: 10,
        isVisible: true,
        options: [],
      })
      .expect(200, done);
  });

  it('should not be able to update dish addon', (done) => {
    request(App.server)
      .put(`/api/establishment/${establishmentId}/category/${categoryId}/dish/4422/addons/${addonId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test dish addon',
        description: 'test description',
        price: 10,
        isVisible: true,
      })
      .expect(404, done);
  });

  it('should be able to delete dish addon', (done) => {
    request(App.server)
      .delete(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}/addons/${addonId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should not be able to delete dish addon', (done) => {
    request(App.server)
      .delete(`/api/establishment/${establishmentId}/category/${categoryId}/dish/45456/addons/123`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404, done);
  });

  it('should be able to delete dish', (done) => {
    request(App.server)
      .delete(`/api/establishment/${establishmentId}/category/${categoryId}/dish/${dishId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should not be able to delete dish', (done) => {
    request(App.server)
      .delete(`/api/establishment/${establishmentId}/category/${categoryId}/dish/45456`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404, done);
  });
});

describe('table.controller', () => {
  let establishmentId: number = undefined;
  let employeeId: number = undefined;
  let token: string = undefined;
  let tableId: number = undefined;

  beforeAll(async () => {
    establishmentId = await createEstablishment();
    const { token: t, employeeId: e } = await createAdmin(establishmentId);
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

  it('should be able to get table', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/table/${tableId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should not be able to get table', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/table/55555`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404, done);
  });

  it('should be able to index tables', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/table`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should not be able to index tables', (done) => {
    request(App.server)
      .get(`/api/establishment/55555/table`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404, done);
  });

  it('should be able to toggle table availability', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/table/${tableId}/toggle-availability`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should bot be able to toggle table availability', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/table/555555/toggle-availability`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404, done);
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

  it('should be not able to update table when establisment doesnt exist', (done) => {
    request(App.server)
      .put(`/api/establishment/55555/table/${tableId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        displayName: 'test table updated',
        number: 1,
        isAvailable: true,
        seats: 10,
      })
      .expect(404, done);
  });

  it('should be not able to update table when table doesnt exist', (done) => {
    request(App.server)
      .put(`/api/establishment/${establishmentId}/table/555555`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        displayName: 'test table updated',
        number: 1,
        isAvailable: true,
        seats: 10,
      })
      .expect(404, done);
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
  let employeeId: number = undefined;
  let customerId: number = undefined;
  let employeeToken: string = undefined;
  let token: string = undefined;
  let tableId: number = undefined;
  let categoryId: number = undefined;
  let dishId: number = undefined;
  let tableOrderId: number = undefined;
  let customerOrderId: number = undefined;
  let tableClaimId: number = undefined;
  let addonId: number = undefined;
  let optionId: number = undefined;

  beforeAll(async () => {
    establishmentId = await createEstablishment();
    const { token: t, employeeId: e } = await createAdmin(establishmentId);
    employeeId = e;
    employeeToken = t;

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

    await Addon.create({
      title: 'test addon',
      isOptional: true,
      isMultiple: true,
      dishId,
    }).then(async (addon) => {
      addonId = addon.id;
    });

    await Option.create({
      title: 'test option',
      price: 10,
      addonId,
    }).then(async (option) => {
      optionId = option.id;
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
    await Employee.destroy({ where: { id: employeeId } });
    await CustomerOrder.destroy({ where: { id: customerOrderId } });
    await TableOrder.destroy({ where: { id: tableOrderId } });
    await Customer.destroy({ where: { id: customerId } });
    await Option.destroy({ where: { id: optionId } });
    await Addon.destroy({ where: { id: addonId } });
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
        options: [optionId],
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
        options: [optionId],
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

  it('should be able to cancel customer order', (done) => {
    request(App.server)
      .post(`/api/order/${customerOrderId}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be able to show table order', (done) => {
    request(App.server)
      .post(`/api/order/table`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        id: tableClaimId
      })
      .expect(200, done);
  });

  it('should be able to show receipts', (done) => {
    request(App.server)
      .get(`/api/order/receipts`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be able to show customer receipt', (done) => {
    request(App.server)
      .get(`/api/order/receipt/customer`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be able to show receipt total', (done) => {
    request(App.server)
      .get(`/api/order/receipt/total`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be able to update status', (done) => {
    request(App.server)
      .post(`/api/order/${customerOrderId}/status`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        status: CustomerOrderStatus.CANCELLED
      })
      .expect(200, done);
  });

  it('should be able to toggle table claim requests', (done) => {
    request(App.server)
      .post(`/api/order/table/${tableOrderId}/toggle`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200, done);
  });

  it('should be able to get active orders', (done) => {
    request(App.server)
      .post(`/api/order/active`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200, done);
  });
});

describe('tableClaim.controller', () => {
  let establishmentId: number = undefined;
  let employeeId: number = undefined;
  let token: string = undefined;
  let employeeToken: string = undefined;
  let tableId: number = undefined;
  let tableClaimId: number = undefined;
  let assistanceRequestId: number = undefined;

  beforeAll(async () => {
    establishmentId = await createEstablishment();

    const { token: t, employeeId: e } = await createAdmin(establishmentId);
    employeeId = e;
    employeeToken = t;

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
    await Employee.destroy({ where: { id: employeeId } });
    await TableClaim.destroy({ where: { id: tableClaimId } });
    await Table.destroy({ where: { id: tableId } });
    await Establishment.destroy({ where: { id: establishmentId } });
  });

  it('should check availability', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/table/${tableId}/check-availability`)
      .expect(200, done);
  });

  it('should not check availability', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/table/555555/check-availability`)
      .expect(404, done);
  });

  it('should be able to claim table', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/sign-in`)
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

  it('should be able to toggle table claim access requests', (done) => {
    request(App.server)
      .post(`/api/toggle-access-requests`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be able to get claimed', (done) => {
    request(App.server)
      .get(`/api/claimed`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be able to create assistance requests', (done) => {
    request(App.server)
      .post(`/api/assistance`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        tableClaimId: tableClaimId,
        type: AssistanceRequestType.HELP,
        message: 'test message'
      })
      .expect(200)
      .then((res) => {
        assistanceRequestId = res.body.data.id;
        done();
      });
  });

  it('should be able to get assistance requests', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/assistance-requests`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200, done);
  });

  it('should be able to dismiss assistance requests', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/assistance-requests/${assistanceRequestId}/dismiss`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200, done);
  });

  it('should toggle table claim seats limit bypass', (done) => {
    request(App.server)
      .post(`/api/claim/${tableClaimId}/toggle-seats-limit`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200, done);
  });

  it('should not be able to toggle table claim seats limit bypass', (done) => {
    request(App.server)
      .post(`/api/claim/99999/toggle-seats-limit`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(400, done);
  });

  it('should check availability claimed', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/table/${tableId}/check-availability`)
      .expect(200, done);
  });
});

describe('employee.controller', () => {
  let establishmentId: number = undefined;
  let employeeId: number = undefined;
  let employeeId2: number = undefined;
  let accessCodeId: number = undefined;
  let token: string = undefined;

  beforeAll(async () => {
    establishmentId = await createEstablishment();
    const { token: t, employeeId: e } = await createAdmin(establishmentId);
    employeeId = e;
    token = t;

    await Employee.create({
      firstName: 'user1',
      lastName: 'user2',
      email: 'test@gmail.com',
      role: EmployeeRole.GENERAL,
      establishmentId: establishmentId
    }).then(async (employee) => {
      employeeId2 = employee.id;
    });
  });

  afterAll(async () => {
    await Employee.destroy({ where: { id: employeeId } });
    await Establishment.destroy({ where: { id: establishmentId } });
  });

  it('should be able to get employese', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/employee`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be able to get employee', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/employee/${employeeId2}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be receive an error when trying to get non existant employee', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/employee/99999`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404, done);
  });

  it('should be able to update employee', (done) => {
    request(App.server)
      .put(`/api/establishment/${establishmentId}/employee/${employeeId2}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'testUpdated',
      })
      .expect(200, done);
  });

  it('should be able to delete employee', (done) => {
    request(App.server)
      .delete(`/api/establishment/${establishmentId}/employee/${employeeId2}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be able to index sign up codes', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}/sign-up-code`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should be able to create sign up codes', (done) => {
    request(App.server)
      .post(`/api/establishment/${establishmentId}/sign-up-code`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        role: EmployeeRole.WAITER,
      })
      .expect(201)
      .then((res) => {
        accessCodeId = res.body.data.id;
        done();
      });
  });

  it('should be able to delete sign up codes', (done) => {
    request(App.server)
      .delete(`/api/establishment/${establishmentId}/sign-up-code/${accessCodeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });
});

describe('establishment.controller', () => {
  let establishmentId: number = undefined;
  let token: string = undefined;

  beforeAll(async () => {
    establishmentId = await createEstablishment();
    const { token: t } = await createAdmin(establishmentId);
    token = t;
  });

  afterAll(async () => {
    await Establishment.destroy({ where: { id: establishmentId } });
  });

  it('should be able to get establishment', (done) => {
    request(App.server)
      .get(`/api/establishment/${establishmentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, done);
  });

  it('should noy be able to get establishment', (done) => {
    request(App.server)
      .get(`/api/establishment/9999`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404, done);
  });

  it('should be able to update establishment', (done) => {
    request(App.server)
      .put(`/api/establishment/${establishmentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test',
        description: 'test',
      })
      .expect(200, done);
  });

  it('should not be able to update non existant establishment', (done) => {
    request(App.server)
      .put(`/api/establishment/5555`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test',
        description: 'test',
      })
      .expect(404, done);
  });

});
