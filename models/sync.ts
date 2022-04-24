import { Addon } from "./addon.model";
import { AssistanceRequest } from "./assistanceRequest.model";
import { Category } from "./category.model";
import { Customer } from "./customer.model";
import { Dish } from "./dish.model";
import { Employee, SignUpCode } from "./employee.model";
import { Establishment } from "./establishment.model";
import { Option } from "./option.model";
import { CustomerOrder, OrderAddon, TableOrder } from "./order.model";
import { Table } from "./table.model";
import { TableClaim } from "./tableClaim.model";
import { Tag } from "./tag.model";

export const Sync = async () => {
  try {
    /*
    await Establishment.sync({ force: true }).then(() => console.log("Establishments table created"));
    await SignUpCode.sync({ force: true }).then(() => console.log("Sign up codes table created"));
    await Employee.sync({ force: true }).then(() => console.log("Employees table created"));

    await Table.sync({ force: true }).then(() => console.log("Tables table created"));
    await TableClaim.sync({ force: true }).then(() => console.log("Table claims table created"));
    await Customer.sync({ force: true }).then(() => console.log("Customers table created"));
    await AssistanceRequest.sync({ force: true }).then(() => console.log("Assistance requests table created"));

    await Category.sync({ force: true }).then(() => console.log("Categories table created"));
    await Dish.sync({ force: true }).then(() => console.log("Dishes table created"));
    await Tag.sync({ force: true }).then(() => console.log("Tags table created"));

    await Addon.sync({ force: true }).then(() => console.log("Addons table created"));
    await Option.sync({ force: true }).then(() => console.log("Addons table created"));

    await TableOrder.sync({ force: true }).then(() => console.log("Table Orders table created"));
    await CustomerOrder.sync({ force: true }).then(() => console.log("Customer Orders table created"));
    await OrderAddon.sync({ force: true }).then(() => console.log("Orders addons table created"));
    */

    // Defaults

    /*
    Establishment.create({
      title: 'Delish',
      description: 'Change these details in admin panel',
      type: EstablishmentType.RESTAURANT
    });
    */
  } catch (error) {
    console.error(error);
  }
};

Sync();