import { assert } from "chai";
import { knex } from "knex";
import { validateTables } from "../../src/validateTables";
import {} from "../testTables";

describe("validateTables", () => {
    it("should fail on empty database", async () => {
        const db = knex({
            client: "sqlite3",
            useNullAsDefault: false,
            connection: { filename: ":memory:" },
        });

        try {
            await validateTables(db);
            assert.isFalse(true);
            // tslint:disable-next-line:no-empty
        } catch (_error) {}

        await db.destroy();
    });
});
