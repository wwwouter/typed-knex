import { assert } from "chai";
import { mapObjectToTableObject } from "../../src/mapObjectToTableObject";
import { User } from "../testEntities";

describe("mapObjectToTableObject", () => {
    it("should map object to table object", (done) => {
        const result = mapObjectToTableObject(User, { id: "id", status: "status" });

        assert.deepEqual(result, { id: "id", weirdDatabaseName: "status" });

        done();
    });
});
