import { CustomerOrder, OrderAddon, TableOrder } from '../order.model';

const {
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('TableOrder', () => {
  const model = new TableOrder();

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ['tableClaimId', 'status'].forEach(checkPropertyExists(model))
})

describe('CustomerOrder', () => {
  const model = new CustomerOrder();

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ['title', 'status', 'comment', 'price', 'totalPrice', 'tableOrderId', 'ownerId', 'quantity'].forEach(checkPropertyExists(model))

})

describe('OrderAddon', () => {
  const model = new OrderAddon()

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ['title', 'price'].forEach(checkPropertyExists(model))
})