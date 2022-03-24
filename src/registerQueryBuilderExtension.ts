/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { TypedQueryBuilder } from "./typedKnex";

export function registerQueryBuilderExtension(name: string, fun: Function) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (TypedQueryBuilder as any).prototype[name] = function () {
        return fun.bind(this)(...arguments);
    };
}
