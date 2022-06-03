import { assert } from "chai";
import { knex } from "knex";
import { getTables, getTableName } from "../../src";
import { getColumnName } from "../../src/decorators";
import { TypedKnex, TypedQueryBuilder } from "../../src/typedKnex";
import { setToNull, unflatten } from "../../src/unflatten";
import { Region, User, UserCategory, UserSetting } from "../testTables";

describe("TypedKnexQueryBuilder", () => {
    it('should return select * from "users"', (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User);
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users"');

        done();
    });

    it('should return select "id" from "users"', (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).select("id");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "users"."id" as "id" from "users"');

        done();
    });

    it("should return camelCase correctly", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).select("initialValue");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "userSettings"."initialValue" as "initialValue" from "userSettings"');

        done();
    });

    it("should create query with where on column of own table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).where("name", "user1");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\'');

        done();
    });

    it("should create query with Date column", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).select("birthDate").where("birthDate", new Date(1979, 0, 1));

        const queryString = query.toQuery();
        assert.equal(queryString, 'select "users"."birthDate" as "birthDate" from "users" where "users"."birthDate" = \'1979-01-01 00:00:00.000\'');

        done();
    });

    it("should create query with array column", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).select("tags").where("tags", ["tag1"]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select "users"."tags" as "tags" from "users" where "users"."tags" = \'{"tag1"}\'');

        done();
    });

    it("should create query with where on column of own table with LIKE", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).where("name", "like", "%user%");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" like \'%user%\'');

        done();
    });

    it("should handle nullable properties", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        typedKnex.query(UserCategory).select("phoneNumber").where("phoneNumber", "user1").select("backupRegion.code").toQuery();

        done();
    });

    it("should handle nullable level 2 properties", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        typedKnex.query(User).select("category.phoneNumber").where("category.phoneNumber", "user1");

        done();
    });

    it("should create query with where not on column of own table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereNot("name", "user1");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where not "users"."name" = \'user1\'');

        done();
    });

    it("should join a table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).innerJoinColumn("user");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId"');

        done();
    });

    it("should join a table and select a column of joined table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).select("user.name").innerJoinColumn("user");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "user"."name" as "user.name" from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId"');

        done();
    });

    it("should join a table and use where on a column of joined table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).where("user.name", "user1").innerJoinColumn("user");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId" where "user"."name" = \'user1\'');

        done();
    });

    it("should join two level of tables", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).innerJoinColumn("user").innerJoinColumn("user.category");
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId"'
        );

        done();
    });

    it("should join three level of tables", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).innerJoinColumn("user.category.region");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId"');

        done();
    });

    it("should join two levels of tables and select a column of the last joined table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).select("user.category.name").innerJoinColumn("user.category");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "user_category"."name" as "user.category.name" from "userSettings" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId"');

        done();
    });

    it("should join three levels of tables and select a column of the last joined table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).select("user.category.region.code").innerJoinColumn("user.category.region");
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "user_category_region"."code" as "user.category.region.code" from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId"'
        );

        done();
    });

    it("should join two levels of tables and use where on a column of last joined table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).where("user.category.name", "user1").innerJoinColumn("user.category");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId" where "user_category"."name" = \'user1\'');

        done();
    });

    it("should join three levels of tables and use where on a column of last joined table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).where("user.category.region.code", 2).innerJoinColumn("user.category.region");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId" where "user_category_region"."code" = 2');

        done();
    });

    it("should inner join with function with other table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).innerJoinTableOnFunction("otherUser", User, (join) => {
            join.on("id", "=", "user2Id");
        });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id"');

        done();
    });

    it("should inner join with function with other table and use order by on joined table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex
            .query(UserSetting)
            .innerJoinTableOnFunction("otherUser", User, (join) => {
                join.on("id", "=", "user2Id");
            })
            .orderBy("otherUser.name");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id" order by "otherUser"."name" asc');

        done();
    });

    it("should inner join with function with other tables and use order by on joined table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex
            .query(UserSetting)
            .innerJoinTableOnFunction("otherUser", User, (join) => {
                join.on("id", "=", "user2Id");
            })
            .innerJoinTableOnFunction("otherCategory", UserCategory, (join) => {
                join.on("id", "=", "otherUser.categoryId");
            })
            .orderBy("otherCategory.name");

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "userSettings" inner join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id" inner join "userCategories" as "otherCategory" on "otherUser"."categoryId" = "otherCategory"."id" order by "otherCategory"."name" asc'
        );

        done();
    });

    it("should inner join with function with other table using correct column name", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).innerJoinTableOnFunction("otherUser", User, (join) => {
            join.on("status", "=", "user2Id").andOnVal("status", "=", "status1").andOn("status", "=", "otherValue");
        });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            `select * from "userSettings" inner join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."weirdDatabaseName" and "otherUser"."weirdDatabaseName" = 'status1' and "userSettings"."other_value" = "otherUser"."weirdDatabaseName"`
        );

        done();
    });

    it("should inner join with function with other table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).innerJoin("otherUser", User, "nickName", "=", "value");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "users" as "otherUser" on "otherUser"."nickName" = "userSettings"."value"');

        done();
    });

    it("should inner join with other table with name attribute", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).innerJoin("otherUser", User, "status", "=", "otherValue").where("otherUser.status", "status1").where("otherValue", "other value");

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "userSettings" inner join "users" as "otherUser" on "otherUser"."weirdDatabaseName" = "userSettings"."other_value" where "otherUser"."weirdDatabaseName" = \'status1\' and "userSettings"."other_value" = \'other value\''
        );

        done();
    });

    it("should left outer join with other table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).leftOuterJoin("otherUser", User, "nickName", "=", "value");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "otherUser"."nickName" = "userSettings"."value"');

        done();
    });

    it("should left outer join with other table with name attribute", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).leftOuterJoin("otherUser", User, "status", "=", "otherValue");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "otherUser"."weirdDatabaseName" = "userSettings"."other_value"');

        done();
    });

    it("should left outer join with other tables", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex
            .query(UserSetting)
            .leftOuterJoin("otherUser", User, "status", "=", "otherValue")
            .leftOuterJoin("otherUser.otherOtherUser", User, "status", "=", "otherUser.status")
            .select("otherUser.otherOtherUser.name");

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "otherUser_otherOtherUser"."name" as "otherUser.otherOtherUser.name" from "userSettings" left outer join "users" as "otherUser" on "otherUser"."weirdDatabaseName" = "userSettings"."other_value" left outer join "users" as "otherUser_otherOtherUser" on "otherUser_otherOtherUser"."weirdDatabaseName" = "otherUser"."weirdDatabaseName"'
        );

        done();
    });

    it("should select 2 columns at once", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).select("id", "name");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "users"."id" as "id", "users"."name" as "name" from "users"');

        done();
    });

    it("should select 2 columns at once from parent", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).select("user.id", "user.name");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "user"."id" as "user.id", "user"."name" as "user.name" from "userSettings"');

        done();
    });

    it("should select raw query", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).selectRaw("subQuery", Number, "select other.id from other");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select (select other.id from other) as "subQuery" from "users"');

        done();
    });

    it("should create query with AND in where clause", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).where("name", "user1").andWhere("name", "user2").andWhere("name", "like", "%user%");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\' and "users"."name" = \'user2\' and "users"."name" like \'%user%\'');

        done();
    });

    it("should create query with OR in where clause", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).where("name", "user1").orWhere("name", "user2").orWhere("name", "like", "%user%");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\' or "users"."name" = \'user2\' or "users"."name" like \'%user%\'');

        done();
    });

    it("should create query with where in", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereIn("name", ["user1", "user2"]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" in (\'user1\', \'user2\')');

        done();
    });

    it("should create query with where not in", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereNotIn("name", ["user1", "user2"]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" not in (\'user1\', \'user2\')');

        done();
    });

    it("should create query with where between", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereBetween("numericValue", [1, 10]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."numericValue" between 1 and 10');

        done();
    });

    it("should create query with where not between", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereNotBetween("numericValue", [1, 10]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."numericValue" not between 1 and 10');

        done();
    });

    it("should create query with where exists", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereExists(UserSetting, (subQuery) => {
            subQuery.whereColumn("userId", "=", "id");
        });

        const queryString = query.toQuery();
        assert.equal(queryString, `select * from "users" where exists (select * from "userSettings" as "subquery0$userSettings" where "subquery0$userSettings"."userId" = "users"."id")`);

        done();
    });

    it("should create query with where exists with column name mapping", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereExists(UserSetting, (subQuery) => {
            subQuery.innerJoinColumn("user");
            subQuery.whereColumn("user.notUndefinedStatus", "=", "notUndefinedStatus");
        });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            `select * from "users" where exists (select * from "userSettings" as "subquery0$userSettings" inner join "users" as "subquery0$user" on "subquery0$user"."id" = "subquery0$userSettings"."userId" where "subquery0$user"."weirdDatabaseName2" = "users"."weirdDatabaseName2")`
        );

        done();
    });

    it("should create query with or where exists", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex
            .query(User)
            .where("name", "name")
            .orWhereExists(UserSetting, (subQuery) => {
                subQuery.whereColumn("userId", "=", "id");
            });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" = \'name\' or exists (select * from "userSettings" as "subquery0$userSettings" where "subquery0$userSettings"."userId" = "users"."id")');

        done();
    });

    it("should create query with where not exists", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereNotExists(UserSetting, (subQuery) => {
            subQuery.whereColumn("userId", "=", "id");
        });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where not exists (select * from "userSettings" as "subquery0$userSettings" where "subquery0$userSettings"."userId" = "users"."id")');

        done();
    });

    it("should create query with or where not exists", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex
            .query(User)
            .where("name", "name")
            .orWhereNotExists(UserSetting, (subQuery) => {
                subQuery.whereColumn("userId", "=", "id");
            });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" = \'name\' or not exists (select * from "userSettings" as "subquery0$userSettings" where "subquery0$userSettings"."userId" = "users"."id")');

        done();
    });

    it("should create query with where raw", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereRaw("?? = ??", "users.id", "users.name");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."id" = "users"."name"');

        done();
    });

    it("should create query with group by", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).select("someValue").selectRaw("total", Number, 'SUM("numericValue")').groupBy("someValue");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select "users"."someValue" as "someValue", (SUM("numericValue")) as "total" from "users" group by "users"."someValue"');

        done();
    });

    it("should create query with having", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).having("numericValue", ">", 10);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" having "users"."numericValue" > 10');

        done();
    });

    it("should create query with having null", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).havingNull("numericValue");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" having "users"."numericValue" is null');

        done();
    });

    it("should create query with having not null", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).havingNotNull("numericValue");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" having "users"."numericValue" is not null');

        done();
    });

    it("should create query with having in", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).havingIn("name", ["user1", "user2"]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" having "users"."name" in (\'user1\', \'user2\')');

        done();
    });

    it("should create query with having not in", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).havingNotIn("name", ["user1", "user2"]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" having "users"."name" not in (\'user1\', \'user2\')');

        done();
    });

    it("should create query with having exists", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).havingExists(UserSetting, (subQuery) => {
            subQuery.whereColumn("userId", "=", "id");
        });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" having exists (select * from "userSettings" as "subquery0$userSettings" where "subquery0$userSettings"."userId" = "users"."id")');

        done();
    });

    it("should create query with having not exists", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).havingNotExists(UserSetting, (subQuery) => {
            subQuery.whereColumn("userId", "=", "id");
        });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" having not exists (select * from "userSettings" as "subquery0$userSettings" where "subquery0$userSettings"."userId" = "users"."id")');

        done();
    });

    it("should create query with having raw", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).havingRaw("?? = ??", "users.id", "users.name");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" having "users"."id" = "users"."name"');

        done();
    });

    it("should create query with having between", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).havingBetween("numericValue", [1, 10]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" having "users"."numericValue" between 1 and 10');

        done();
    });

    it("should create query with having not between", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).havingNotBetween("numericValue", [1, 10]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" having "users"."numericValue" not between 1 and 10');

        done();
    });

    it("should create query with an union", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex
            .query(User)
            .select("id")
            .union(User, (subQuery) => {
                subQuery.select("id").where("numericValue", 12);
            });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select "users"."id" as "id" from "users" union select "users"."id" as "id" from "users" where "users"."numericValue" = 12');

        done();
    });

    it("should create query with an union all", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex
            .query(User)
            .select("id")
            .unionAll(User, (subQuery) => {
                subQuery.select("id").where("numericValue", 12);
            });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select "users"."id" as "id" from "users" union all select "users"."id" as "id" from "users" where "users"."numericValue" = 12');

        done();
    });

    it("should create query with min", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).min("numericValue", "minNumericValue");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select min("users"."numericValue") as "minNumericValue" from "users"');
        done();
    });

    it("should create query with count", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).count("numericValue", "countNumericValue");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select count("users"."numericValue") as "countNumericValue" from "users"');
        done();
    });

    it("should create query with countDistinct", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).countDistinct("numericValue", "countDistinctNumericValue");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select count(distinct "users"."numericValue") as "countDistinctNumericValue" from "users"');
        done();
    });

    it("should create query with max", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).max("numericValue", "maxNumericValue");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select max("users"."numericValue") as "maxNumericValue" from "users"');
        done();
    });

    it("should create query with two max", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).max("numericValue", "maxNumericValue").max("someValue", "maxSomeValue");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select max("users"."numericValue") as "maxNumericValue", max("users"."someValue") as "maxSomeValue" from "users"');
        done();
    });

    it("should create query with sum", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).sum("numericValue", "sumNumericValue");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select sum("users"."numericValue") as "sumNumericValue" from "users"');
        done();
    });

    it("should create query with sumDistinct", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).sumDistinct("numericValue", "sumDistinctNumericValue");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select sum(distinct "users"."numericValue") as "sumDistinctNumericValue" from "users"');
        done();
    });

    it("should create query with avg", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).avg("numericValue", "avgNumericValue");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select avg("users"."numericValue") as "avgNumericValue" from "users"');
        done();
    });

    it("should create query with avgDistinct", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).avgDistinct("numericValue", "avgDistinctNumericValue");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select avg(distinct "users"."numericValue") as "avgDistinctNumericValue" from "users"');
        done();
    });

    it("should create query with order by", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).orderBy("id");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" order by "users"."id" asc');

        done();
    });

    it("should clear select", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).select("id").clearSelect();
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users"');

        done();
    });

    it("should clear where", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).where("name", "user1").clearWhere();

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users"');

        done();
    });

    it("should clear order", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).orderBy("id").clearOrder();
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users"');

        done();
    });

    it("should create query with distinct", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).select("id").distinct();
        const queryString = query.toQuery();
        assert.equal(queryString, 'select distinct "users"."id" as "id" from "users"');

        done();
    });

    it("should clone and adjust only the clone", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));

        const query = typedKnex.query(User).select("id");

        const clonedQuery = query.clone();

        clonedQuery.select("name");

        assert.equal(query.toQuery(), 'select "users"."id" as "id" from "users"');
        assert.equal(clonedQuery.toQuery(), 'select "users"."id" as "id", "users"."name" as "name" from "users"');

        done();
    });

    it("should create query with groupby raw", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).groupByRaw("year WITH ROLLUP");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" group by year WITH ROLLUP');

        done();
    });

    it("should create query with or where in", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereIn("name", ["user1", "user2"]).orWhereIn("name", ["user3", "user4"]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" in (\'user1\', \'user2\') or "users"."name" in (\'user3\', \'user4\')');

        done();
    });

    it("should create query with or where not in", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereNotIn("name", ["user1", "user2"]).orWhereNotIn("name", ["user3", "user4"]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" not in (\'user1\', \'user2\') or "users"."name" not in (\'user3\', \'user4\')');

        done();
    });

    it("should create query with or where between", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereBetween("numericValue", [1, 10]).orWhereBetween("numericValue", [100, 1000]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."numericValue" between 1 and 10 or "users"."numericValue" between 100 and 1000');

        done();
    });

    it("should create query with or where not between", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereNotBetween("numericValue", [1, 10]).orWhereNotBetween("numericValue", [100, 1000]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."numericValue" not between 1 and 10 or "users"."numericValue" not between 100 and 1000');

        done();
    });

    it("should create query with parentheses in where", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex
            .query(User)
            .whereParentheses((sub) => sub.where("id", "1").orWhere("id", "2"))
            .orWhere("name", "Tester");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where ("users"."id" = \'1\' or "users"."id" = \'2\') or "users"."name" = \'Tester\'');

        done();
    });

    it("should return metadata from tables", (done) => {
        const tables = getTables();

        assert.equal(tables.length, 5);
        assert.exists(tables.find((i) => i.tableName === "users"));
        assert.exists(tables.find((i) => i.tableName === "correctTableName"));

        done();
    });

    it("should create query with where null", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereNull("name").orWhereNull("name");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" is null or "users"."name" is null');

        done();
    });

    it("should create query with where not null", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereNotNull("name").orWhereNotNull("name");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" is not null or "users"."name" is not null');

        done();
    });

    it("should left outer join a table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).leftOuterJoinColumn("user");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "user" on "user"."id" = "userSettings"."userId"');

        done();
    });

    it("should return camelCase correctly", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).select("initialValue");
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "userSettings"."initialValue" as "initialValue" from "userSettings"');

        done();
    });

    it("should left outer join with function with itself", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).leftOuterJoinTableOnFunction("evilTwin", UserSetting, (join) => {
            join.on("id", "=", "id");
        });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" left outer join "userSettings" as "evilTwin" on "userSettings"."id" = "evilTwin"."id"');

        done();
    });

    it("should left outer join with function with other table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).leftOuterJoinTableOnFunction("otherUser", User, (join) => {
            join.on("id", "=", "user2Id");
        });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id"');

        done();
    });

    it("should left outer join with function with other table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).leftOuterJoinTableOnFunction("otherUser", User, (join) => {
            join.on("id", "=", "user2Id").onNull("name");
        });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id" and "otherUser"."name" is null');

        done();
    });

    it("should left outer join with function with other table with on and on or on", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).leftOuterJoinTableOnFunction("otherUser", User, (join) => {
            join.on("id", "=", "user2Id").andOn("name", "=", "user2Id").orOn("someValue", "=", "user2Id");
        });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "userSettings" left outer join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id" and "userSettings"."user2Id" = "otherUser"."name" or "userSettings"."user2Id" = "otherUser"."someValue"'
        );

        done();
    });

    it("should left outer join with function with other table with onVal", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).leftOuterJoinTableOnFunction("otherUser", User, (join) => {
            join.onVal("name", "=", "1").andOnVal("name", "=", "2").orOnVal("name", "=", "3");
        });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "otherUser"."name" = \'1\' and "otherUser"."name" = \'2\' or "otherUser"."name" = \'3\'');

        done();
    });

    it("should be able to use joined column in another leftOuterJoinTableOnFunction", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex
            .query(UserSetting)
            .leftOuterJoinTableOnFunction("evilTwin", UserSetting, (join) => {
                join.on("id", "=", "id");
            })
            .leftOuterJoinTableOnFunction("evilTwin2", UserSetting, (join) => {
                join.on("id", "=", "evilTwin.id");
            });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "userSettings" left outer join "userSettings" as "evilTwin" on "userSettings"."id" = "evilTwin"."id" left outer join "userSettings" as "evilTwin2" on "evilTwin"."id" = "evilTwin2"."id"'
        );

        done();
    });

    it("should left outer join with function with other table with an column alias", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserCategory).leftOuterJoinTableOnFunction("specialRegion", Region, (join) => {
            join.on("id", "=", "specialRegionId");
        });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userCategories" left outer join "regions" as "specialRegion" on "userCategories"."INTERNAL_NAME" = "specialRegion"."id"');

        done();
    });

    it('should return select * from "users"', (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).limit(10);
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" limit 10');

        done();
    });

    it('should return select * from "users"', (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).offset(10);
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" offset 10');

        done();
    });

    it('should return select * from "users"', (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User);
        query.useKnexQueryBuilder((queryBuilder) => queryBuilder.where("somethingelse", "value"));
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "somethingelse" = \'value\'');

        done();
    });

    it("should removeNullObjects", (done) => {
        const result = {
            id: "id",
            "element.id": null,
            "element.category.id": null,
            "unit.category.id": null,
            "category.name": "cat name",
        };
        const flattened = unflatten([result]);
        assert.isNull(flattened[0].element.id);
        assert.isNull(flattened[0].unit.category.id);
        assert.equal(flattened[0].category.name, "cat name");
        const nulled = setToNull(flattened);
        assert.isNull(nulled[0].element);
        assert.equal(nulled[0].category.name, "cat name");
        assert.isNull(nulled[0].unit);

        done();
    });

    it("should return sub query in select", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex
            .query(UserCategory)
            .select("id")
            .selectQuery("total", Number, User, (subQuery) => {
                subQuery.count("id", "total").whereColumn("categoryId", "=", "id");
            });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select "userCategories"."id" as "id", (select count("users"."id") as "total" from "users" where "users"."categoryId" = "userCategories"."id") as "total" from "userCategories"');

        done();
    });

    it("should left outer join with function with and in on", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(UserSetting).leftOuterJoinTableOnFunction("evilTwin", UserSetting, (join) => {
            join.on("id", "=", "id");
            join.on("key", "=", "key");
        });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" left outer join "userSettings" as "evilTwin" on "userSettings"."id" = "evilTwin"."id" and "userSettings"."key" = "evilTwin"."key"');

        done();
    });

    it("should left outer join with function and selection of joined table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex
            .query(UserSetting)
            .leftOuterJoinTableOnFunction("evilTwin", UserSetting, (join) => {
                join.on("id", "=", "id");
            })
            .where("evilTwin.value", "value")
            .select("evilTwin.key");

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "evilTwin"."key" as "evilTwin.key" from "userSettings" left outer join "userSettings" as "evilTwin" on "userSettings"."id" = "evilTwin"."id" where "evilTwin"."value" = \'value\''
        );

        done();
    });

    it("should get name of the table", (done) => {
        const tableName = getTableName(User);

        assert.equal(tableName, "users");

        done();
    });

    it("should get name of the column", (done) => {
        const columnName = getColumnName(User, "id");

        assert.equal(columnName, "id");

        done();
    });

    it("should insert a select", async () => {
        const k = knex({ client: "postgresql" });
        const typedKnex = new TypedKnex(k);
        const query = typedKnex.query(User);
        try {
            await query.selectRaw("f", String, "'fixedValue'").select("name").distinct().whereNotNull("name").insertSelect(UserSetting, "id", "initialValue");
        } catch (_e) {
            assert.equal(
                query.toQuery(),
                `insert into "userSettings" ("userSettings"."id","userSettings"."initialValue") select distinct ('fixedValue') as "f", "users"."name" as "name" from "users" where "users"."name" is not null`
            );
        }
    });

    it("should create query with order by raw", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).orderByRaw("SUM(??) DESC", "users.year");

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" order by SUM("users"."year") DESC');

        done();
    });

    it("should create query with where in with subquery", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereExists(UserSetting, (subQuery) => {
            subQuery.whereColumn("userId", "=", "id");
        });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where exists (select * from "userSettings" as "subquery0$userSettings" where "subquery0$userSettings"."userId" = "users"."id")');

        done();
    });

    it("should create insert query with returning all", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.insertItemWithReturning({ id: "newId" });

        assert.equal((query as any).queryLog.trim(), `insert into "users" ("id") values ('newId') returning *`);
    });

    it("should create insert query with returning 1 column", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.insertItemWithReturning({ id: "newId" }, ["status"]);

        assert.equal((query as any).queryLog.trim(), `insert into "users" ("id") values ('newId') returning "users"."weirdDatabaseName"`);
    });

    it("should create insert query with returning 2 column", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.insertItemWithReturning({ id: "newId" }, ["status", "id"]);

        assert.equal((query as any).queryLog.trim(), `insert into "users" ("id") values ('newId') returning "users"."weirdDatabaseName", "users"."id"`);
    });

    it("should create insert query", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.insertItem({ id: "newId" });

        assert.equal((query as any).queryLog.trim(), `insert into "users" ("id") values ('newId')`);
    });

    it("should create insert query with column name mapping", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.insertItem({ status: "newStatus" });

        assert.equal((query as any).queryLog.trim(), `insert into "users" ("weirdDatabaseName") values ('newStatus')`);
    });

    it("should create multiple insert queries", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.insertItems([{ id: "newId1" }, { id: "newId2" }]);

        assert.equal((query as any).queryLog.trim(), `insert into "users" ("id") values ('newId1'), ('newId2')`);
    });

    it("should create multiple insert queries with column name mapping", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.insertItems([{ status: "newStatus1" }, { status: "newStatus2" }]);

        assert.equal((query as any).queryLog.trim(), `insert into "users" ("weirdDatabaseName") values ('newStatus1'), ('newStatus2')`);
    });

    it("should create update query", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.updateItem({ id: "newId" });

        assert.equal((query as any).queryLog.trim(), `update "users" set "id" = 'newId'`);
    });

    it("should create update query with returning", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.updateItemWithReturning({ id: "newId" });

        assert.equal((query as any).queryLog.trim(), `update "users" set "id" = 'newId' returning *`);
    });

    it("should create update query with column name mapping", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.updateItem({ status: "newStatus" });

        assert.equal((query as any).queryLog.trim(), `update "users" set "weirdDatabaseName" = 'newStatus'`);
    });

    it("should create update query by id", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.updateItemByPrimaryKey("userId", { name: "newName" });

        assert.equal((query as any).queryLog.trim(), `update "users" set "name" = 'newName' where "id" = 'userId'`);
    });

    it("should create update query by id with column name mapping", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.updateItemByPrimaryKey("userId", { status: "newStatus" });

        assert.equal((query as any).queryLog.trim(), `update "users" set "weirdDatabaseName" = 'newStatus' where "id" = 'userId'`);
    });

    it("should create multiple update queries by id", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.updateItemsByPrimaryKey([
            { primaryKeyValue: "userId1", data: { name: "newName1" } },
            { primaryKeyValue: "userId2", data: { name: "newName2" } },
        ]);

        assert.equal((query as any).queryLog.trim(), `update "users" set "name" = 'newName1' where "id" = 'userId1';\nupdate "users" set "name" = 'newName2' where "id" = 'userId2';`);
    });

    it("should create multiple update queries by id with column name mapping", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.updateItemsByPrimaryKey([
            { primaryKeyValue: "userId1", data: { status: "newStatus1" } },
            { primaryKeyValue: "userId2", data: { status: "newStatus2" } },
        ]);

        assert.equal((query as any).queryLog.trim(), `update "users" set "weirdDatabaseName" = 'newStatus1' where "id" = 'userId1';\nupdate "users" set "weirdDatabaseName" = 'newStatus2' where "id" = 'userId2';`);
    });

    it("should create findByPrimaryKey query", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(User);

        (query as any).onlyLogQuery = true;

        await query.findByPrimaryKey("1", "id", "name");

        assert.equal((query as any).queryLog.trim(), `select "users"."id" as "id", "users"."name" as "name" from "users" where "id" = '1'`);
    });

    it("should select * when querybuilder has no select specified", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users"');

        done();
    });

    it("getMany should select all columns of root type with correct aliases", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(UserCategory);

        (query as any).onlyLogQuery = true;

        await query.getMany();

        assert.equal(
            (query as any).queryLog.trim(),
            `select "id" as "id", "name" as "name", "regionId" as "region", "regionId" as "regionId", "year" as "year", "phoneNumber" as "phoneNumber", "backupRegionId" as "backupRegion", "INTERNAL_NAME" as "specialRegionId" from "userCategories"`
        );
    });

    it("getFirst should select all columns of root type with correct aliases", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(UserCategory);

        (query as any).onlyLogQuery = true;

        await query.getFirst();

        assert.equal(
            (query as any).queryLog.trim(),
            `select "id" as "id", "name" as "name", "regionId" as "region", "regionId" as "regionId", "year" as "year", "phoneNumber" as "phoneNumber", "backupRegionId" as "backupRegion", "INTERNAL_NAME" as "specialRegionId" from "userCategories"`
        );
    });

    it("getFirstOrNull should select all columns of root type with correct aliases", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(UserCategory);

        (query as any).onlyLogQuery = true;

        await query.getFirstOrNull();

        assert.equal(
            (query as any).queryLog.trim(),
            `select "id" as "id", "name" as "name", "regionId" as "region", "regionId" as "regionId", "year" as "year", "phoneNumber" as "phoneNumber", "backupRegionId" as "backupRegion", "INTERNAL_NAME" as "specialRegionId" from "userCategories"`
        );
    });

    it("getFirstOrUndefined should select all columns of root type with correct aliases", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(UserCategory);

        (query as any).onlyLogQuery = true;

        await query.getFirstOrUndefined();

        assert.equal(
            (query as any).queryLog.trim(),
            `select "id" as "id", "name" as "name", "regionId" as "region", "regionId" as "regionId", "year" as "year", "phoneNumber" as "phoneNumber", "backupRegionId" as "backupRegion", "INTERNAL_NAME" as "specialRegionId" from "userCategories"`
        );
    });

    it("getSingle should select all columns of root type with correct aliases", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(UserCategory);

        (query as any).onlyLogQuery = true;

        await query.getSingle();

        assert.equal(
            (query as any).queryLog.trim(),
            `select "id" as "id", "name" as "name", "regionId" as "region", "regionId" as "regionId", "year" as "year", "phoneNumber" as "phoneNumber", "backupRegionId" as "backupRegion", "INTERNAL_NAME" as "specialRegionId" from "userCategories"`
        );
    });

    it("getSingleOrNull should select all columns of root type with correct aliases", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(UserCategory);

        (query as any).onlyLogQuery = true;

        await query.getSingleOrNull();

        assert.equal(
            (query as any).queryLog.trim(),
            `select "id" as "id", "name" as "name", "regionId" as "region", "regionId" as "regionId", "year" as "year", "phoneNumber" as "phoneNumber", "backupRegionId" as "backupRegion", "INTERNAL_NAME" as "specialRegionId" from "userCategories"`
        );
    });

    it("getSingleOrUndefined should select all columns of root type with correct aliases", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(UserCategory);

        (query as any).onlyLogQuery = true;

        await query.getSingleOrUndefined();

        assert.equal(
            (query as any).queryLog.trim(),
            `select "id" as "id", "name" as "name", "regionId" as "region", "regionId" as "regionId", "year" as "year", "phoneNumber" as "phoneNumber", "backupRegionId" as "backupRegion", "INTERNAL_NAME" as "specialRegionId" from "userCategories"`
        );
    });

    it("should handle where exists on same table as main table", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereExists(User, (subQuery) => {
            subQuery.whereColumn("status", "=", "status").whereColumn("id", "<>", "id");
        });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            `select * from "users" where exists (select * from "users" as "subquery0$users" where "subquery0$users"."weirdDatabaseName" = "users"."weirdDatabaseName" and "subquery0$users"."id" <> "users"."id")`
        );

        done();
    });

    it("should handle two levels of where exists", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User).whereExists(User, (subQuery) => {
            subQuery.whereColumn("status", "=", "status").whereColumn("id", "<>", "id");

            subQuery.whereExists(User, (subQuery2) => {
                subQuery2.whereColumn("status", "=", "status").whereColumn("id", "<>", "id");
            });
        });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            `select * from "users" where exists (select * from "users" as "subquery0$users" where "subquery0$users"."weirdDatabaseName" = "users"."weirdDatabaseName" and "subquery0$users"."id" <> "users"."id" and exists (select * from "users" as "subquery0$subquery0$users" where "subquery0$subquery0$users"."weirdDatabaseName" = "subquery0$users"."weirdDatabaseName" and "subquery0$subquery0$users"."id" <> "subquery0$users"."id"))`
        );

        done();
    });

    it("getSingleOrNull should select all columns of root type with correct aliases", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(UserCategory);

        (query as any).onlyLogQuery = true;

        await query.getSingleOrNull();

        assert.equal(
            (query as any).queryLog.trim(),
            `select "id" as "id", "name" as "name", "regionId" as "region", "regionId" as "regionId", "year" as "year", "phoneNumber" as "phoneNumber", "backupRegionId" as "backupRegion", "INTERNAL_NAME" as "specialRegionId" from "userCategories"`
        );
    });

    it("getSingleOrUndefined should select all columns of root type with correct aliases", async () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        (typedKnex as any).onlyLogQuery = true;

        const query = typedKnex.query(UserCategory);

        (query as any).onlyLogQuery = true;

        await query.getSingleOrUndefined();

        assert.equal(
            (query as any).queryLog.trim(),
            `select "id" as "id", "name" as "name", "regionId" as "region", "regionId" as "regionId", "year" as "year", "phoneNumber" as "phoneNumber", "backupRegionId" as "backupRegion", "INTERNAL_NAME" as "specialRegionId" from "userCategories"`
        );
    });

    it("should get correct column for nested queries", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        let nestedStatusColumnName;
        let nestedUserCategoryYear;
        const query = typedKnex.query(User).whereExists(User, (subQuery) => {
            subQuery.innerJoinColumn("category").select("category.id").select("status");

            nestedStatusColumnName = subQuery.getColumnAlias("status");
            nestedUserCategoryYear = subQuery.getColumnAlias("category.year");
        });

        query.toQuery();

        assert.equal(nestedStatusColumnName, '"subquery0$users"."weirdDatabaseName"');
        assert.equal(nestedUserCategoryYear, '"subquery0$category"."year"');

        done();
    });

    it("should be able to refer to main query in raw where exists", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User);
        query.whereExists(User, (subQuery) => {
            subQuery.whereColumn("status", "=", "status").whereColumn("id", "<>", "id").whereRaw(`EXISTS (SELECT 1 FROM users as users2 WHERE ${query.getColumnAlias(
                "status"
            )} = users2."weirdDatabaseName" AND ${query.getColumnAlias("id")} <> users2."id")
            `);
        });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            `select * from "users" where exists (select * from "users" as "subquery0$users" where "subquery0$users"."weirdDatabaseName" = "users"."weirdDatabaseName" and "subquery0$users"."id" <> "users"."id" and EXISTS (SELECT 1 FROM users as users2 WHERE "users"."weirdDatabaseName" = users2."weirdDatabaseName" AND "users"."id" <> users2."id")
            )`
        );

        done();
    });

    it("should be able to refer to main query in where exists", (done) => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));
        const query = typedKnex.query(User);
        query.whereExists(User, (subQuery1) => {
            subQuery1.whereColumn("status", "=", "status"); // Compares subQuery1 with its parent (query)

            subQuery1.whereExists(User, (subQuery2) => {
                subQuery2.whereColumn(subQuery2.getColumn("status"), "=", query.getColumn("status")); // Compares subQuery2 with the first parent (query)

                subQuery2.whereExists(User, (subQuery3) => {
                    subQuery3.whereColumn(subQuery3.getColumn("status"), "=", subQuery1.getColumn("status")); // Compares subQuery3 with the second parent (subQuery1)
                });
            });
        });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            `select * from "users" where exists (select * from "users" as "subquery0$users" where "subquery0$users"."weirdDatabaseName" = "users"."weirdDatabaseName" and exists (select * from "users" as "subquery0$subquery0$users" where "subquery0$subquery0$users"."weirdDatabaseName" = "users"."weirdDatabaseName" and exists (select * from "users" as "subquery0$subquery0$subquery0$users" where "subquery0$subquery0$subquery0$users"."weirdDatabaseName" = "subquery0$users"."weirdDatabaseName")))`
        );

        done();
    });

    describe("getColumnAlias", () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));

        it("should return root column name", async () => {
            const query = typedKnex.query(UserCategory);
            assert.equal(query.getColumnAlias("id"), '"userCategories"."id"');
        });

        it("should return root column name with mapped name", async () => {
            const query = typedKnex.query(UserCategory);
            assert.equal(query.getColumnAlias("specialRegionId"), '"userCategories"."INTERNAL_NAME"');
        });

        it("should return named joined column name", async () => {
            const query = typedKnex.query(UserCategory).innerJoin("user", User, "categoryId", "=", "id");
            assert.equal(query.getColumnAlias("user.id"), '"user"."id"');
        });

        it("should return named joined column name with mapped name", async () => {
            const query = typedKnex.query(UserCategory).innerJoin("user", User, "categoryId", "=", "id");
            assert.equal(query.getColumnAlias("user.status"), '"user"."weirdDatabaseName"');
        });

        it("should return two levels joined column name", async () => {
            const query = typedKnex.query(User).innerJoinColumn("category").innerJoinColumn("category.region");
            assert.equal(query.getColumnAlias("category.region.code"), '"category_region"."code"');
        });

        it("should return select with alias", async () => {
            const query = typedKnex.query(UserCategory);
            query.selectRaw("hash", String, `hashFunction(${query.getColumnAlias("name")})`).select("id");

            const queryString = query.toQuery();

            assert.equal(queryString, 'select (hashFunction("userCategories"."name")) as "hash", "userCategories"."id" as "id" from "userCategories"');
        });
    });

    describe("distinctOn", () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));

        it("should distinct on 1 column", (done) => {
            const query = typedKnex.query(UserCategory).select("id").distinctOn(["name"]);

            const queryString = query.toQuery();
            assert.equal(queryString, 'select distinct on ("userCategories"."name") "userCategories"."id" as "id" from "userCategories"');

            done();
        });

        it("should distinct on 2 columns", (done) => {
            const query = typedKnex.query(UserCategory).select("id").distinctOn(["name", "phoneNumber"]);

            const queryString = query.toQuery();
            assert.equal(queryString, 'select distinct on ("userCategories"."name", "userCategories"."phoneNumber") "userCategories"."id" as "id" from "userCategories"');

            done();
        });

        it("should distinct on 1 column with mapping", (done) => {
            const query = typedKnex.query(UserCategory).select("id").distinctOn(["specialRegionId"]);

            const queryString = query.toQuery();
            assert.equal(queryString, 'select distinct on ("userCategories"."INTERNAL_NAME") "userCategories"."id" as "id" from "userCategories"');

            done();
        });

        it("should distinct on columns with join and with mapping", (done) => {
            const query = typedKnex.query(User).innerJoin("category", UserCategory, "id", "=", "categoryId").select("id").distinctOn(["name", "category.id", "category.specialRegionId"]);

            const queryString = query.toQuery();
            assert.equal(
                queryString,
                'select distinct on ("users"."name", "category"."id", "category"."INTERNAL_NAME") "users"."id" as "id" from "users" inner join "userCategories" as "category" on "category"."id" = "users"."categoryId"'
            );

            done();
        });
    });
    describe("mapPropertyNameToColumnName", () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));

        it("should return aliased name", async () => {
            const query = typedKnex.query(UserCategory) as TypedQueryBuilder<UserCategory, UserCategory, UserCategory>;
            const columnName = query.mapPropertyNameToColumnName("specialRegionId");
            assert.equal(columnName, "INTERNAL_NAME");
        });

        it("should return name when no alias", async () => {
            const query = typedKnex.query(UserCategory) as TypedQueryBuilder<UserCategory, UserCategory, UserCategory>;
            const columnName = query.mapPropertyNameToColumnName("name");
            assert.equal(columnName, "name");
        });
    });
    describe("mapColumnNameToPropertyName", () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));

        it("should return aliased name", async () => {
            const query = typedKnex.query(UserCategory) as TypedQueryBuilder<UserCategory, UserCategory, UserCategory>;
            const columnName = query.mapColumnNameToPropertyName("INTERNAL_NAME");
            assert.equal(columnName, "specialRegionId");
        });

        it("should return name when no alias", async () => {
            const query = typedKnex.query(UserCategory) as TypedQueryBuilder<UserCategory, UserCategory, UserCategory>;
            const columnName = query.mapColumnNameToPropertyName("name");
            assert.equal(columnName, "name");
        });
    });
    describe("mapColumnsToProperties", () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));

        it("should map", async () => {
            const query = typedKnex.query(UserCategory) as TypedQueryBuilder<UserCategory, UserCategory, UserCategory>;
            const item = { INTERNAL_NAME: "internal name", name: "name" } as any;
            query.mapColumnsToProperties(item);
            assert.deepEqual(item, { specialRegionId: "internal name", name: "name" });
        });
    });
    describe("mapPropertiesToColumns", () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));

        it("should map", async () => {
            const query = typedKnex.query(UserCategory) as TypedQueryBuilder<UserCategory, UserCategory, UserCategory>;
            const item = { specialRegionId: "internal name", name: "name" } as any;
            query.mapPropertiesToColumns(item);
            assert.deepEqual(item, { INTERNAL_NAME: "internal name", name: "name" });
        });
    });

    describe("updateItemWithReturning", () => {
        const typedKnex = new TypedKnex(knex({ client: "postgresql" }));

        it("should use where clause", async () => {
            const query = typedKnex.query(User);

            (query as any).onlyLogQuery = true;

            await query.where("name", "name1").updateItemWithReturning({ id: "newId" });

            assert.equal((query as any).queryLog.trim(), `update "users" set "id" = 'newId' where "users"."name" = 'name1' returning *`);
        });
    });
});
