import { Prisma } from "@prisma/client";
import _ from "lodash";

export function stringifyDecimals(obj: any): void {
  _.forOwn(obj, (value, key) => {
    if (value instanceof Prisma.Decimal) {
      obj[key] = value.toString();
    } else if (_.isPlainObject(value)) {
      stringifyDecimals(value);
    } else if (_.isArray(value)) {
      stringifyDecimals(obj[key]);
    } else {
      obj[key] = value;
    }
  });
}
