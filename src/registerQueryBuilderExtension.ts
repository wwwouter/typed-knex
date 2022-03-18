import { TypedQueryBuilder } from "./typedKnex";

export function registerQueryBuilderExtension(name: string, fun: Function) {
    (TypedQueryBuilder as any).prototype[name] = function () {
        return fun.bind(this)(...arguments);
    };
}
