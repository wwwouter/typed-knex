import { assert } from "chai";
import { knex } from "knex";
import { TypedKnex } from "../../src";
import { registerQueryBuilderExtension } from "../../src/registerQueryBuilderExtension";
import { User } from "../testEntities";

describe("registerQueryBuilderExtension", () => {
    it("should map object to table object", (done) => {
        function selectId(this: any) {
            this.select("id");
        }

        registerQueryBuilderExtension("selectId", selectId);

        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User) as any;
        query.selectId();

        const resultSql = query.toQuery();

        assert.deepEqual(resultSql, 'select "users"."id" as "id" from "users"');

        done();
    });
});
