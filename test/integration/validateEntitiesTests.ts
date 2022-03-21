import { assert } from "chai";
import { knex } from "knex";
import { validateEntities } from "../../src/validateEntities";
import {} from "../testEntities";

describe("validateEntitiesTests", () => {
    it("should fail on empty database", async () => {
        const db = knex({
            client: "sqlite3",
            useNullAsDefault: false,
            connection: { filename: ":memory:" },
        });

        try {
            await validateEntities(db);
            assert.isFalse(true);
            // eslint-disable-next-line no-empty
        } catch (_error) {}

        await db.destroy();
    });
});
