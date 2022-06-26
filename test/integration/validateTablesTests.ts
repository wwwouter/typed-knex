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
        } catch (_error) {}

        await db.destroy();
    });

    it("should succeed on empty database, is tableNamesToValidate is empty", async () => {
        const db = knex({
            client: "sqlite3",
            useNullAsDefault: false,
            connection: { filename: ":memory:" },
        });

        try {
            await validateTables(db, []);
            assert.isFalse(true);
        } catch (_error) {}

        await db.destroy();
    });
});
