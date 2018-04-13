"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TypedKnex {
    constructor(knex) {
        this.knex = knex;
    }
    query(type) {
        return new TypedQueryBuilder(type, this.knex);
    }
}
exports.TypedKnex = TypedKnex;
class TypedQueryBuilder {
    constructor(type, knex) {
        this.type = type;
        this.knex = knex;
    }
    selectWithName(key) {
        return this;
    }
    getItem() {
        return {};
    }
}
class Practitioner {
}
class Employment {
}
class Organization {
}
const typedKnex = new TypedKnex({});
const query = typedKnex.query(Practitioner);
const query2 = query
    .selectWithName('employment', 'id');
// .selectWithName('age');
const item001 = query2.getItem();
item001.employment.id;
// item001.age;
