"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const knex = require("knex");
const src_1 = require("../../src");
const decorators_1 = require("../../src/decorators");
const typedKnex_1 = require("../../src/typedKnex");
const unflatten_1 = require("../../src/unflatten");
const testEntities_1 = require("../testEntities");
describe('TypedKnexQueryBuilder', () => {
    it('should return select * from "users"', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users"');
        done();
    });
    it('should return select "id" from "users"', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).select(c => [c.id]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."id" as "id" from "users"');
        done();
    });
    it('should return camelCase correctly', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .select(c => [c.initialValue]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "userSettings"."initialValue" as "initialValue" from "userSettings"');
        done();
    });
    it('should create query with where on column of own table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).where(c => c.name, 'user1');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\'');
        done();
    });
    it('should create query with Date column', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User)
            .select(i => i.birthDate)
            .where(c => c.birthDate, new Date(1979, 0, 1));
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."birthDate" as "birthDate" from "users" where "users"."birthDate" = \'1979-01-01 00:00:00.000\'');
        done();
    });
    it('should create query with array column', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User)
            .select(i => i.tags)
            .where(c => c.tags, ['tag1']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."tags" as "tags" from "users" where "users"."tags" = \'{"tag1"}\'');
        done();
    });
    it('should create query with where on column of own table with LIKE', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).where(c => c.name, 'like', '%user%');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" like \'%user%\'');
        done();
    });
    it('should handle nullable properties', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex
            .query(testEntities_1.UserCategory)
            .select(i => i.phoneNumber)
            .where(c => c.phoneNumber, 'user1')
            .select(i => i.backupRegion.code)
            .toQuery();
        done();
    });
    it('should handle nullable level 2 properties', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex
            .query(testEntities_1.User)
            .select(i => i.category.phoneNumber)
            .where(c => c.category.phoneNumber, 'user1');
        done();
    });
    it('should create query with where not on column of own table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).whereNot(c => c.name, 'user1');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where not "users"."name" = \'user1\'');
        done();
    });
    it('should join a table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.UserSetting).innerJoinColumn(c => c.user);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId"');
        done();
    });
    it('should join a table and select a column of joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .select(c => [c.user.name])
            .innerJoinColumn(c => c.user);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "user"."name" as "user.name" from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId"');
        done();
    });
    it('should join a table and use where on a column of joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .where(c => c.user.name, 'user1')
            .innerJoinColumn(c => c.user);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId" where "user"."name" = \'user1\'');
        done();
    });
    it('should join two level of tables', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .innerJoinColumn(c => c.user)
            .innerJoinColumn(c => c.user.category);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId"');
        done();
    });
    it('should join three level of tables', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .innerJoinColumn(c => c.user.category.region);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId"');
        done();
    });
    it('should join two levels of tables and select a column of the last joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .select(c => c.user.category.name)
            .innerJoinColumn(c => c.user.category);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "user_category"."name" as "user.category.name" from "userSettings" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId"');
        done();
    });
    it('should join three levels of tables and select a column of the last joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .select(c => [c.user.category.region.code])
            .innerJoinColumn(c => c.user.category.region);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "user_category_region"."code" as "user.category.region.code" from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId"');
        done();
    });
    it('should join two levels of tables and use where on a column of last joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .where(c => c.user.category.name, 'user1')
            .innerJoinColumn(c => c.user.category);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId" where "user_category"."name" = \'user1\'');
        done();
    });
    it('should join three levels of tables and use where on a column of last joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .where(c => c.user.category.region.code, 2)
            .innerJoinColumn(c => c.user.category.region);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId" where "user_category_region"."code" = 2');
        done();
    });
    it('should inner join with function with other table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .innerJoinTableOnFunction('otherUser', testEntities_1.User, join => {
            join.on(i => i.id, '=', j => j.user2Id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id"');
        done();
    });
    it('should select 2 columns at once', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).select(c => [c.id, c.name]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."id" as "id", "users"."name" as "name" from "users"');
        done();
    });
    it('should select 2 columns at once from parent', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .select(c => [c.user.id, c.user.name]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "user"."id" as "user.id", "user"."name" as "user.name" from "userSettings"');
        done();
    });
    // it('should create query with where not on column of own table', (done) => {
    //     const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
    //     const query = typedKnex
    //         .query(User)
    //         .whereNot('name', 'user1');
    //     const queryString = query.toQuery();
    //     assert.equal(queryString, 'select * from "users" where not "name" = \'user1\'');
    //     done();
    // });
    it('should select column from table with to-many relationship', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            // .query(User)
            .query(testEntities_1.UserSetting)
            // .selectColumnWithArrays('category', 'name');
            // .select(['category2', 'regionId')];
            .select(c => [c.user.category.regionId]);
        // .select(['user2s', 'category')];
        // .select(['name')];
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "user_category"."regionId" as "user.category.regionId" from "userSettings"');
        // const i = await query.firstItem();
        // if (i) {
        //     // const i1 = i.userSettings;
        //     const i1 = i.category.name;
        //     const i2 = i.category.id;
        //     const i3 = i.id;
        //     const i4 = i.name;
        //     i.user.category.regionId
        // }
        done();
    });
    it('should select raw query', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .selectRaw('subQuery', Number, 'select other.id from other');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select (select other.id from other) as "subQuery" from "users"');
        // const i = await query.firstItem();
        // console.log(i.name);
        // console.log(i.subQuery === true);
        // console.log(i.subQuery === 'true');
        // console.log(i.subQueryd);
        done();
    });
    it('should create query with AND in where clause', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .where(c => c.name, 'user1')
            .andWhere(c => c.name, 'user2')
            .andWhere(c => c.name, 'like', '%user%');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\' and "users"."name" = \'user2\' and "users"."name" like \'%user%\'');
        done();
    });
    it('should create query with OR in where clause', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .where(c => c.name, 'user1')
            .orWhere(c => c.name, 'user2')
            .orWhere(c => c.name, 'like', '%user%');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\' or "users"."name" = \'user2\' or "users"."name" like \'%user%\'');
        done();
    });
    it('should create query with where in', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereIn(c => c.name, ['user1', 'user2']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" in (\'user1\', \'user2\')');
        done();
    });
    it('should create query with where not in', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereNotIn(c => c.name, ['user1', 'user2']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" not in (\'user1\', \'user2\')');
        done();
    });
    it('should create query with where between', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereBetween(c => c.numericValue, [1, 10]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."numericValue" between 1 and 10');
        done();
    });
    it('should create query with where not between', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereNotBetween(c => c.numericValue, [1, 10]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."numericValue" not between 1 and 10');
        done();
    });
    it('should create query with where exists', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereExists(testEntities_1.UserSetting, (subQuery, parentColumn) => {
            subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create query with where exists with column name mapping', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereExists(testEntities_1.UserSetting, (subQuery, parentColumn) => {
            subQuery.whereColumn(c => c.user.notUndefinedStatus, '=', parentColumn.notUndefinedStatus);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where exists (select * from "userSettings" where "user"."weirdDatabaseName2" = "users"."weirdDatabaseName2")');
        done();
    });
    it('should create query with or where exists', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .where(c => c.name, 'name')
            .orWhereExists(testEntities_1.UserSetting, (subQuery, parentColumn) => {
            subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" = \'name\' or exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create query with where not exists', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereNotExists(testEntities_1.UserSetting, (subQuery, parentColumn) => {
            subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where not exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create query with or where not exists', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .where(c => c.name, 'name')
            .orWhereNotExists(testEntities_1.UserSetting, (subQuery, parentColumn) => {
            subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" = \'name\' or not exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create query with where raw', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereRaw('?? = ??', 'users.id', 'users.name');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."id" = "users"."name"');
        done();
    });
    it('should create query with group by', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .select(c => c.someValue)
            .selectRaw('total', Number, 'SUM("numericValue")')
            .groupBy(c => c.someValue);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."someValue" as "someValue", (SUM("numericValue")) as "total" from "users" group by "users"."someValue"');
        done();
    });
    it('should create query with having', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .having(c => c.numericValue, '>', 10);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."numericValue" > 10');
        done();
    });
    it('should create query with having null', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).havingNull(c => c.numericValue);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."numericValue" is null');
        done();
    });
    it('should create query with having not null', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).havingNotNull(c => c.numericValue);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."numericValue" is not null');
        done();
    });
    it('should create query with having in', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingIn(c => c.name, ['user1', 'user2']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."name" in (\'user1\', \'user2\')');
        done();
    });
    it('should create query with having not in', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingNotIn(c => c.name, ['user1', 'user2']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."name" not in (\'user1\', \'user2\')');
        done();
    });
    it('should create query with having exists', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingExists(testEntities_1.UserSetting, (subQuery, parentColumn) => {
            subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create query with having not exists', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingNotExists(testEntities_1.UserSetting, (subQuery, parentColumn) => {
            subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having not exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create query with having raw', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingRaw('?? = ??', 'users.id', 'users.name');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."id" = "users"."name"');
        done();
    });
    it('should create query with having between', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingBetween(c => c.numericValue, [1, 10]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."numericValue" between 1 and 10');
        done();
    });
    it('should create query with having not between', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingNotBetween(c => c.numericValue, [1, 10]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."numericValue" not between 1 and 10');
        done();
    });
    it('should create query with an union', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .select(c => [c.id])
            .union(testEntities_1.User, subQuery => {
            subQuery.select(c => [c.id]).where(c => c.numericValue, 12);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."id" as "id" from "users" union select "users"."id" as "id" from "users" where "users"."numericValue" = 12');
        done();
    });
    it('should create query with an union all', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .select(c => [c.id])
            .unionAll(testEntities_1.User, subQuery => {
            subQuery.select(c => [c.id]).where(c => c.numericValue, 12);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."id" as "id" from "users" union all select "users"."id" as "id" from "users" where "users"."numericValue" = 12');
        done();
    });
    it('should create query with min', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .min(c => c.numericValue, 'minNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select min("users"."numericValue") as "minNumericValue" from "users"');
        done();
    });
    it('should create query with count', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .count(c => c.numericValue, 'countNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select count("users"."numericValue") as "countNumericValue" from "users"');
        done();
    });
    it('should create query with countDistinct', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .countDistinct(c => c.numericValue, 'countDistinctNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select count(distinct "users"."numericValue") as "countDistinctNumericValue" from "users"');
        done();
    });
    it('should create query with max', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .max(c => c.numericValue, 'maxNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select max("users"."numericValue") as "maxNumericValue" from "users"');
        done();
    });
    it('should create query with two max', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .max(c => c.numericValue, 'maxNumericValue')
            .max(c => c.someValue, 'maxSomeValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select max("users"."numericValue") as "maxNumericValue", max("users"."someValue") as "maxSomeValue" from "users"');
        done();
    });
    it('should create query with sum', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .sum(c => c.numericValue, 'sumNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select sum("users"."numericValue") as "sumNumericValue" from "users"');
        done();
    });
    it('should create query with sumDistinct', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .sumDistinct(c => c.numericValue, 'sumDistinctNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select sum(distinct "users"."numericValue") as "sumDistinctNumericValue" from "users"');
        done();
    });
    it('should create query with avg', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .avg(c => c.numericValue, 'avgNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select avg("users"."numericValue") as "avgNumericValue" from "users"');
        done();
    });
    it('should create query with avgDistinct', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .avgDistinct(c => c.numericValue, 'avgDistinctNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select avg(distinct "users"."numericValue") as "avgDistinctNumericValue" from "users"');
        done();
    });
    it('should create query with order by', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).orderBy(c => c.id);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" order by "users"."id" asc');
        done();
    });
    it('should clear select', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .select(c => [c.id])
            .clearSelect();
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users"');
        done();
    });
    it('should clear where', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .where(c => c.name, 'user1')
            .clearWhere();
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users"');
        done();
    });
    it('should clear order', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .orderBy(c => c.id)
            .clearOrder();
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users"');
        done();
    });
    it('should create query with distinct', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .select(c => [c.id])
            .distinct();
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select distinct "users"."id" as "id" from "users"');
        done();
    });
    it('should clone and adjust only the clone', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).select(c => [c.id]);
        const clonedQuery = query.clone();
        clonedQuery.select(c => [c.name]);
        chai_1.assert.equal(query.toQuery(), 'select "users"."id" as "id" from "users"');
        chai_1.assert.equal(clonedQuery.toQuery(), 'select "users"."id" as "id", "users"."name" as "name" from "users"');
        done();
    });
    it('should create query with groupby raw', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).groupByRaw('year WITH ROLLUP');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" group by year WITH ROLLUP');
        done();
    });
    it('should create query with or where in', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereIn(c => c.name, ['user1', 'user2'])
            .orWhereIn(c => c.name, ['user3', 'user4']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" in (\'user1\', \'user2\') or "users"."name" in (\'user3\', \'user4\')');
        done();
    });
    it('should create query with or where not in', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereNotIn(c => c.name, ['user1', 'user2'])
            .orWhereNotIn(c => c.name, ['user3', 'user4']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" not in (\'user1\', \'user2\') or "users"."name" not in (\'user3\', \'user4\')');
        done();
    });
    it('should create query with or where between', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereBetween(c => c.numericValue, [1, 10])
            .orWhereBetween(c => c.numericValue, [100, 1000]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."numericValue" between 1 and 10 or "users"."numericValue" between 100 and 1000');
        done();
    });
    it('should create query with or where not between', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereNotBetween(c => c.numericValue, [1, 10])
            .orWhereNotBetween(c => c.numericValue, [100, 1000]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."numericValue" not between 1 and 10 or "users"."numericValue" not between 100 and 1000');
        done();
    });
    it('should create query with parentheses in where', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereParentheses(sub => sub.where(c => c.id, '1').orWhere(c => c.id, '2'))
            .orWhere(c => c.name, 'Tester');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where ("users"."id" = \'1\' or "users"."id" = \'2\') or "users"."name" = \'Tester\'');
        done();
    });
    it('should return metadata from Entities', done => {
        const entities = src_1.getEntities();
        chai_1.assert.equal(entities.length, 5);
        chai_1.assert.exists(entities.find(i => i.tableName === 'users'));
        chai_1.assert.exists(entities.find(i => i.tableName === 'correctTableName'));
        done();
    });
    it('should create query with where null', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).whereNull(c => c.name).orWhereNull(c => c.name);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" is null or "users"."name" is null');
        done();
    });
    it('should create query with where not null', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).whereNotNull(c => c.name).orWhereNotNull(c => c.name);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" is not null or "users"."name" is not null');
        done();
    });
    it('should left outer join a table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinColumn(i => i.user);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "user" on "user"."id" = "userSettings"."userId"');
        done();
    });
    it('should return camelCase correctly', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.UserSetting).select(c => c.initialValue);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "userSettings"."initialValue" as "initialValue" from "userSettings"');
        done();
    });
    it('should left outer join with function with itself', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('evilTwin', testEntities_1.UserSetting, join => {
            join.on(i => i.id, '=', j => j.id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "userSettings" as "evilTwin" on "userSettings"."id" = "evilTwin"."id"');
        done();
    });
    it('should left outer join with function with other table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('otherUser', testEntities_1.User, join => {
            join.on(i => i.id, '=', j => j.user2Id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id"');
        done();
    });
    it('should left outer join with function with other table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('otherUser', testEntities_1.User, join => {
            join
                .on(i => i.id, '=', j => j.user2Id)
                .onNull(i => i.name);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id" and "otherUser"."name" is null');
        done();
    });
    it('should left outer join with function with other table with on and on or on', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('otherUser', testEntities_1.User, join => {
            join
                .on(j => j.id, '=', i => i.user2Id)
                .andOn(j => j.name, '=', i => i.user2Id)
                .orOn(j => j.someValue, '=', i => i.user2Id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id" and "userSettings"."user2Id" = "otherUser"."name" or "userSettings"."user2Id" = "otherUser"."someValue"');
        done();
    });
    it('should left outer join with function with other table with onVal', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('otherUser', testEntities_1.User, join => {
            join
                .onVal(i => i.name, '=', '1')
                .andOnVal(i => i.name, '=', '2')
                .orOnVal(i => i.name, '=', '3');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "otherUser"."name" = \'1\' and "otherUser"."name" = \'2\' or "otherUser"."name" = \'3\'');
        done();
    });
    it('should be able to use joined column in another leftOuterJoinTableOnFunction', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('evilTwin', testEntities_1.UserSetting, join => {
            join.on(i => i.id, '=', j => j.id);
        }).leftOuterJoinTableOnFunction('evilTwin2', testEntities_1.UserSetting, join => {
            join.on(i => i.id, '=', j => j.evilTwin.id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "userSettings" as "evilTwin" on "userSettings"."id" = "evilTwin"."id" left outer join "userSettings" as "evilTwin2" on "evilTwin"."id" = "evilTwin2"."id"');
        done();
    });
    it('should return select * from "users"', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).limit(10);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" limit 10');
        done();
    });
    it('should return select * from "users"', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).offset(10);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" offset 10');
        done();
    });
    it('should return select * from "users"', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User);
        query.useKnexQueryBuilder(queryBuilder => queryBuilder.where('somethingelse', 'value'));
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "somethingelse" = \'value\'');
        done();
    });
    it('should removeNullObjects', done => {
        const result = {
            id: 'id',
            'element.id': null,
            'element.category.id': null,
            'unit.category.id': null,
            'category.name': 'cat name',
        };
        const flattened = unflatten_1.unflatten([result]);
        chai_1.assert.isNull(flattened[0].element.id);
        chai_1.assert.isNull(flattened[0].unit.category.id);
        chai_1.assert.equal(flattened[0].category.name, 'cat name');
        const nulled = unflatten_1.setToNull(flattened);
        chai_1.assert.isNull(nulled[0].element);
        chai_1.assert.equal(nulled[0].category.name, 'cat name');
        chai_1.assert.isNull(nulled[0].unit);
        done();
    });
    it('should return sub query in select', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserCategory)
            .select(i => i.id)
            .selectQuery('total', Number, testEntities_1.User, (subQuery, parentColumn) => {
            subQuery
                .count(i => i.id, 'total')
                .whereColumn(c => c.categoryId, '=', parentColumn.id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "userCategories"."id" as "id", (select count("users"."id") as "total" from "users" where "users"."categoryId" = "userCategories"."id") as "total" from "userCategories"');
        done();
    });
    it('should left outer join with function with and in on', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('evilTwin', testEntities_1.UserSetting, join => {
            join.on(i => i.id, '=', j => j.id);
            join.on(i => i.key, '=', j => j.key);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "userSettings" as "evilTwin" on "userSettings"."id" = "evilTwin"."id" and "userSettings"."key" = "evilTwin"."key"');
        done();
    });
    it('should left outer join with function and selection of joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('evilTwin', testEntities_1.UserSetting, join => {
            join.on(i => i.id, '=', j => j.id);
        })
            .where(i => i.evilTwin.value, 'value')
            .select(i => i.evilTwin.key);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "evilTwin"."key" as "evilTwin.key" from "userSettings" left outer join "userSettings" as "evilTwin" on "userSettings"."id" = "evilTwin"."id" where "evilTwin"."value" = \'value\'');
        done();
    });
    it('should get name of the table', done => {
        const tableName = src_1.getTableName(testEntities_1.User);
        chai_1.assert.equal(tableName, 'users');
        done();
    });
    it('should get name of the column', done => {
        const columnName = decorators_1.getColumnName(testEntities_1.User, 'id');
        chai_1.assert.equal(columnName, 'id');
        done();
    });
    it('should insert a select', async () => {
        const k = knex({ client: 'postgresql' });
        const typedKnex = new typedKnex_1.TypedKnex(k);
        const query = typedKnex
            .query(testEntities_1.User);
        try {
            await query
                .selectRaw('f', String, '\'fixedValue\'')
                .select(u => [u.name])
                .distinct()
                .whereNotNull(u => u.name)
                .insertSelect(testEntities_1.UserSetting, i => [i.id, i.initialValue]);
        }
        catch (_e) {
            chai_1.assert.equal(query.toQuery(), `insert into "userSettings" ("userSettings"."id","userSettings"."initialValue") select distinct ('fixedValue') as "f", "users"."name" as "name" from "users" where "users"."name" is not null`);
        }
    });
    it('should create query with order by raw', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .orderByRaw('SUM(??) DESC', 'users.year');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" order by SUM("users"."year") DESC');
        done();
    });
    it('should create query with where in with subquery', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereExists(testEntities_1.UserSetting, (subQuery, parentColumn) => {
            subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create insert query', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.insertItem({ id: 'newId' });
        chai_1.assert.equal(query.queryLog.trim(), `insert into "users" ("id") values ('newId')`);
    });
    it('should create insert query with column name mapping', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.insertItem({ status: 'newStatus' });
        chai_1.assert.equal(query.queryLog.trim(), `insert into "users" ("weirdDatabaseName") values ('newStatus')`);
    });
    it('should create multiple insert queries', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.insertItems([{ id: 'newId1' }, { id: 'newId2' }]);
        chai_1.assert.equal(query.queryLog.trim(), `insert into "users" ("id") values ('newId1'), ('newId2')`);
    });
    it('should create multiple insert queries with column name mapping', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.insertItems([{ status: 'newStatus1' }, { status: 'newStatus2' }]);
        chai_1.assert.equal(query.queryLog.trim(), `insert into "users" ("weirdDatabaseName") values ('newStatus1'), ('newStatus2')`);
    });
    it('should create update query', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.updateItem({ id: 'newId' });
        chai_1.assert.equal(query.queryLog.trim(), `update "users" set "id" = 'newId'`);
    });
    it('should create update query with column name mapping', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.updateItem({ status: 'newStatus' });
        chai_1.assert.equal(query.queryLog.trim(), `update "users" set "weirdDatabaseName" = 'newStatus'`);
    });
    it('should create update query by id', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.updateItemByPrimaryKey('userId', { name: 'newName' });
        chai_1.assert.equal(query.queryLog.trim(), `update "users" set "name" = 'newName' where "id" = 'userId'`);
    });
    it('should create update query by id with column name mapping', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.updateItemByPrimaryKey('userId', { status: 'newStatus' });
        chai_1.assert.equal(query.queryLog.trim(), `update "users" set "weirdDatabaseName" = 'newStatus' where "id" = 'userId'`);
    });
    it('should create multiple update queries by id', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.updateItemsByPrimaryKey([
            { primaryKeyValue: 'userId1', data: { name: 'newName1' } },
            { primaryKeyValue: 'userId2', data: { name: 'newName2' } },
        ]);
        chai_1.assert.equal(query.queryLog.trim(), `update "users" set "name" = 'newName1' where "id" = 'userId1';\nupdate "users" set "name" = 'newName2' where "id" = 'userId2';`);
    });
    it('should create multiple update queries by id with column name mapping', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.updateItemsByPrimaryKey([
            { primaryKeyValue: 'userId1', data: { status: 'newStatus1' } },
            { primaryKeyValue: 'userId2', data: { status: 'newStatus2' } },
        ]);
        chai_1.assert.equal(query.queryLog.trim(), `update "users" set "weirdDatabaseName" = 'newStatus1' where "id" = 'userId1';\nupdate "users" set "weirdDatabaseName" = 'newStatus2' where "id" = 'userId2';`);
    });
    // it('should stay commented out', async done => {
    //     const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
    //     // const item = await typedKnex
    //     //     .query(UserSetting)
    //     //     .insertItem({ id: '1', key:  });
    //     const item = await typedKnex
    //         .query(User)
    //         .select(i => i.category.name)
    //         .orderBy(i => i.birthDate)
    //         .getFirst();
    //     console.log('item: ', item.category.name);
    //     // if (item !== undefined) {
    //     //     console.log(item.user2.numericValue);
    //     //     console.log(item.otherUser.name);
    //     // }
    //     done();
    // });
});
describe('TypedKnexQueryBuilder with string parameters', () => {
    it('should return select * from "users"', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users"');
        done();
    });
    it('should return select "id" from "users"', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).select('id');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."id" as "id" from "users"');
        done();
    });
    it('should return camelCase correctly', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .select('initialValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "userSettings"."initialValue" as "initialValue" from "userSettings"');
        done();
    });
    it('should create query with where on column of own table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).where('name', 'user1');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\'');
        done();
    });
    it('should create query with Date column', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User)
            .select('birthDate')
            .where('birthDate', new Date(1979, 0, 1));
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."birthDate" as "birthDate" from "users" where "users"."birthDate" = \'1979-01-01 00:00:00.000\'');
        done();
    });
    it('should create query with array column', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User)
            .select('tags')
            .where('tags', ['tag1']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."tags" as "tags" from "users" where "users"."tags" = \'{"tag1"}\'');
        done();
    });
    it('should create query with where on column of own table with LIKE', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).where('name', 'like', '%user%');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" like \'%user%\'');
        done();
    });
    it('should handle nullable properties', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex
            .query(testEntities_1.UserCategory)
            .select('phoneNumber')
            .where('phoneNumber', 'user1')
            .select('backupRegion.code')
            .toQuery();
        done();
    });
    it('should handle nullable level 2 properties', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex
            .query(testEntities_1.User)
            .select('category.phoneNumber')
            .where('category.phoneNumber', 'user1');
        done();
    });
    it('should create query with where not on column of own table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).whereNot('name', 'user1');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where not "users"."name" = \'user1\'');
        done();
    });
    it('should join a table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.UserSetting).innerJoinColumn('user');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId"');
        done();
    });
    it('should join a table and select a column of joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .select('user.name')
            .innerJoinColumn('user');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "user"."name" as "user.name" from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId"');
        done();
    });
    it('should join a table and use where on a column of joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .where('user.name', 'user1')
            .innerJoinColumn('user');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId" where "user"."name" = \'user1\'');
        done();
    });
    it('should join two level of tables', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .innerJoinColumn('user')
            .innerJoinColumn('user.category');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId"');
        done();
    });
    it('should join three level of tables', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .innerJoinColumn('user.category.region');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId"');
        done();
    });
    it('should join two levels of tables and select a column of the last joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .select('user.category.name')
            .innerJoinColumn('user.category');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "user_category"."name" as "user.category.name" from "userSettings" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId"');
        done();
    });
    it('should join three levels of tables and select a column of the last joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .select('user.category.region.code')
            .innerJoinColumn('user.category.region');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "user_category_region"."code" as "user.category.region.code" from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId"');
        done();
    });
    it('should join two levels of tables and use where on a column of last joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .where('user.category.name', 'user1')
            .innerJoinColumn('user.category');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId" where "user_category"."name" = \'user1\'');
        done();
    });
    it('should join three levels of tables and use where on a column of last joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .where('user.category.region.code', 2)
            .innerJoinColumn(c => c.user.category.region);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId" where "user_category_region"."code" = 2');
        done();
    });
    it('should inner join with function with other table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .innerJoinTableOnFunction('otherUser', testEntities_1.User, join => {
            join.on('id', '=', 'user2Id');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" inner join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id"');
        done();
    });
    it('should select 2 columns at once', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).select('id', 'name');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."id" as "id", "users"."name" as "name" from "users"');
        done();
    });
    it('should select 2 columns at once from parent', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .select('user.id', 'user.name');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "user"."id" as "user.id", "user"."name" as "user.name" from "userSettings"');
        done();
    });
    it('should select raw query', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .selectRaw('subQuery', Number, 'select other.id from other');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select (select other.id from other) as "subQuery" from "users"');
        done();
    });
    it('should create query with AND in where clause', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .where('name', 'user1')
            .andWhere('name', 'user2')
            .andWhere('name', 'like', '%user%');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\' and "users"."name" = \'user2\' and "users"."name" like \'%user%\'');
        done();
    });
    it('should create query with OR in where clause', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .where('name', 'user1')
            .orWhere('name', 'user2')
            .orWhere('name', 'like', '%user%');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\' or "users"."name" = \'user2\' or "users"."name" like \'%user%\'');
        done();
    });
    it('should create query with where in', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereIn('name', ['user1', 'user2']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" in (\'user1\', \'user2\')');
        done();
    });
    it('should create query with where not in', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereNotIn('name', ['user1', 'user2']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" not in (\'user1\', \'user2\')');
        done();
    });
    it('should create query with where between', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereBetween('numericValue', [1, 10]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."numericValue" between 1 and 10');
        done();
    });
    it('should create query with where not between', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereNotBetween('numericValue', [1, 10]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."numericValue" not between 1 and 10');
        done();
    });
    it('should create query with where exists', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereExists(testEntities_1.UserSetting, (subQuery) => {
            subQuery.whereColumn('userId', '=', 'id');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create query with where exists with column name mapping', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereExists(testEntities_1.UserSetting, (subQuery) => {
            subQuery.whereColumn('user.notUndefinedStatus', '=', 'notUndefinedStatus');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where exists (select * from "userSettings" where "user"."weirdDatabaseName2" = "users"."weirdDatabaseName2")');
        done();
    });
    it('should create query with or where exists', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .where(c => c.name, 'name')
            .orWhereExists(testEntities_1.UserSetting, (subQuery) => {
            subQuery.whereColumn('userId', '=', 'id');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" = \'name\' or exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create query with where not exists', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereNotExists(testEntities_1.UserSetting, (subQuery) => {
            subQuery.whereColumn('userId', '=', 'id');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where not exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create query with or where not exists', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .where(c => c.name, 'name')
            .orWhereNotExists(testEntities_1.UserSetting, (subQuery) => {
            subQuery.whereColumn('userId', '=', 'id');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" = \'name\' or not exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create query with where raw', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereRaw('?? = ??', 'users.id', 'users.name');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."id" = "users"."name"');
        done();
    });
    it('should create query with group by', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .select('someValue')
            .selectRaw('total', Number, 'SUM("numericValue")')
            .groupBy('someValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."someValue" as "someValue", (SUM("numericValue")) as "total" from "users" group by "users"."someValue"');
        done();
    });
    it('should create query with having', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .having('numericValue', '>', 10);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."numericValue" > 10');
        done();
    });
    it('should create query with having null', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).havingNull('numericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."numericValue" is null');
        done();
    });
    it('should create query with having not null', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).havingNotNull('numericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."numericValue" is not null');
        done();
    });
    it('should create query with having in', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingIn('name', ['user1', 'user2']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."name" in (\'user1\', \'user2\')');
        done();
    });
    it('should create query with having not in', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingNotIn('name', ['user1', 'user2']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."name" not in (\'user1\', \'user2\')');
        done();
    });
    it('should create query with having exists', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingExists(testEntities_1.UserSetting, (subQuery) => {
            subQuery.whereColumn('userId', '=', 'id');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create query with having not exists', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingNotExists(testEntities_1.UserSetting, (subQuery) => {
            subQuery.whereColumn('userId', '=', 'id');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having not exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create query with having raw', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingRaw('?? = ??', 'users.id', 'users.name');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."id" = "users"."name"');
        done();
    });
    it('should create query with having between', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingBetween('numericValue', [1, 10]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."numericValue" between 1 and 10');
        done();
    });
    it('should create query with having not between', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .havingNotBetween('numericValue', [1, 10]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" having "users"."numericValue" not between 1 and 10');
        done();
    });
    it('should create query with an union', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .select('id')
            .union(testEntities_1.User, subQuery => {
            subQuery.select('id').where('numericValue', 12);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."id" as "id" from "users" union select "users"."id" as "id" from "users" where "users"."numericValue" = 12');
        done();
    });
    it('should create query with an union all', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .select('id')
            .unionAll(testEntities_1.User, subQuery => {
            subQuery.select('id').where('numericValue', 12);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "users"."id" as "id" from "users" union all select "users"."id" as "id" from "users" where "users"."numericValue" = 12');
        done();
    });
    it('should create query with min', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .min('numericValue', 'minNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select min("users"."numericValue") as "minNumericValue" from "users"');
        done();
    });
    it('should create query with count', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .count('numericValue', 'countNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select count("users"."numericValue") as "countNumericValue" from "users"');
        done();
    });
    it('should create query with countDistinct', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .countDistinct('numericValue', 'countDistinctNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select count(distinct "users"."numericValue") as "countDistinctNumericValue" from "users"');
        done();
    });
    it('should create query with max', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .max('numericValue', 'maxNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select max("users"."numericValue") as "maxNumericValue" from "users"');
        done();
    });
    it('should create query with two max', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .max('numericValue', 'maxNumericValue')
            .max('someValue', 'maxSomeValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select max("users"."numericValue") as "maxNumericValue", max("users"."someValue") as "maxSomeValue" from "users"');
        done();
    });
    it('should create query with sum', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .sum('numericValue', 'sumNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select sum("users"."numericValue") as "sumNumericValue" from "users"');
        done();
    });
    it('should create query with sumDistinct', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .sumDistinct('numericValue', 'sumDistinctNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select sum(distinct "users"."numericValue") as "sumDistinctNumericValue" from "users"');
        done();
    });
    it('should create query with avg', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .avg('numericValue', 'avgNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select avg("users"."numericValue") as "avgNumericValue" from "users"');
        done();
    });
    it('should create query with avgDistinct', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .avgDistinct('numericValue', 'avgDistinctNumericValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select avg(distinct "users"."numericValue") as "avgDistinctNumericValue" from "users"');
        done();
    });
    it('should create query with order by', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).orderBy('id');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" order by "users"."id" asc');
        done();
    });
    it('should clear select', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .select('id')
            .clearSelect();
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users"');
        done();
    });
    it('should clear where', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .where('name', 'user1')
            .clearWhere();
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users"');
        done();
    });
    it('should clear order', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .orderBy('id')
            .clearOrder();
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users"');
        done();
    });
    it('should create query with distinct', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .select('id')
            .distinct();
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select distinct "users"."id" as "id" from "users"');
        done();
    });
    it('should clone and adjust only the clone', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).select('id');
        const clonedQuery = query.clone();
        clonedQuery.select('name');
        chai_1.assert.equal(query.toQuery(), 'select "users"."id" as "id" from "users"');
        chai_1.assert.equal(clonedQuery.toQuery(), 'select "users"."id" as "id", "users"."name" as "name" from "users"');
        done();
    });
    it('should create query with groupby raw', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).groupByRaw('year WITH ROLLUP');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" group by year WITH ROLLUP');
        done();
    });
    it('should create query with or where in', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereIn('name', ['user1', 'user2'])
            .orWhereIn('name', ['user3', 'user4']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" in (\'user1\', \'user2\') or "users"."name" in (\'user3\', \'user4\')');
        done();
    });
    it('should create query with or where not in', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereNotIn('name', ['user1', 'user2'])
            .orWhereNotIn('name', ['user3', 'user4']);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" not in (\'user1\', \'user2\') or "users"."name" not in (\'user3\', \'user4\')');
        done();
    });
    it('should create query with or where between', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereBetween('numericValue', [1, 10])
            .orWhereBetween('numericValue', [100, 1000]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."numericValue" between 1 and 10 or "users"."numericValue" between 100 and 1000');
        done();
    });
    it('should create query with or where not between', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereNotBetween('numericValue', [1, 10])
            .orWhereNotBetween('numericValue', [100, 1000]);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."numericValue" not between 1 and 10 or "users"."numericValue" not between 100 and 1000');
        done();
    });
    it('should create query with parentheses in where', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereParentheses(sub => sub.where('id', '1').orWhere('id', '2'))
            .orWhere('name', 'Tester');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where ("users"."id" = \'1\' or "users"."id" = \'2\') or "users"."name" = \'Tester\'');
        done();
    });
    it('should return metadata from Entities', done => {
        const entities = src_1.getEntities();
        chai_1.assert.equal(entities.length, 5);
        chai_1.assert.exists(entities.find(i => i.tableName === 'users'));
        chai_1.assert.exists(entities.find(i => i.tableName === 'correctTableName'));
        done();
    });
    it('should create query with where null', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).whereNull('name').orWhereNull('name');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" is null or "users"."name" is null');
        done();
    });
    it('should create query with where not null', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).whereNotNull('name').orWhereNotNull('name');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "users"."name" is not null or "users"."name" is not null');
        done();
    });
    it('should left outer join a table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinColumn('user');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "user" on "user"."id" = "userSettings"."userId"');
        done();
    });
    it('should return camelCase correctly', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.UserSetting).select('initialValue');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "userSettings"."initialValue" as "initialValue" from "userSettings"');
        done();
    });
    it('should left outer join with function with itself', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('evilTwin', testEntities_1.UserSetting, join => {
            join.on('id', '=', 'id');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "userSettings" as "evilTwin" on "userSettings"."id" = "evilTwin"."id"');
        done();
    });
    it('should left outer join with function with other table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('otherUser', testEntities_1.User, join => {
            join.on('id', '=', 'user2Id');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id"');
        done();
    });
    it('should left outer join with function with other table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('otherUser', testEntities_1.User, join => {
            join
                .on('id', '=', 'user2Id')
                .onNull('name');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id" and "otherUser"."name" is null');
        done();
    });
    it('should left outer join with function with other table with on and on or on', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('otherUser', testEntities_1.User, join => {
            join
                .on('id', '=', 'user2Id')
                .andOn('name', '=', 'user2Id')
                .orOn('someValue', '=', 'user2Id');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "userSettings"."user2Id" = "otherUser"."id" and "userSettings"."user2Id" = "otherUser"."name" or "userSettings"."user2Id" = "otherUser"."someValue"');
        done();
    });
    it('should left outer join with function with other table with onVal', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('otherUser', testEntities_1.User, join => {
            join
                .onVal('name', '=', '1')
                .andOnVal('name', '=', '2')
                .orOnVal('name', '=', '3');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "users" as "otherUser" on "otherUser"."name" = \'1\' and "otherUser"."name" = \'2\' or "otherUser"."name" = \'3\'');
        done();
    });
    it('should be able to use joined column in another leftOuterJoinTableOnFunction', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('evilTwin', testEntities_1.UserSetting, join => {
            join.on(i => i.id, '=', j => j.id);
        }).leftOuterJoinTableOnFunction('evilTwin2', testEntities_1.UserSetting, join => {
            join.on(i => i.id, '=', j => j.evilTwin.id);
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "userSettings" as "evilTwin" on "userSettings"."id" = "evilTwin"."id" left outer join "userSettings" as "evilTwin2" on "evilTwin"."id" = "evilTwin2"."id"');
        done();
    });
    it('should return select * from "users"', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).limit(10);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" limit 10');
        done();
    });
    it('should return select * from "users"', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User).offset(10);
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" offset 10');
        done();
    });
    it('should return select * from "users"', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(testEntities_1.User);
        query.useKnexQueryBuilder(queryBuilder => queryBuilder.where('somethingelse', 'value'));
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where "somethingelse" = \'value\'');
        done();
    });
    it('should removeNullObjects', done => {
        const result = {
            id: 'id',
            'element.id': null,
            'element.category.id': null,
            'unit.category.id': null,
            'category.name': 'cat name',
        };
        const flattened = unflatten_1.unflatten([result]);
        chai_1.assert.isNull(flattened[0].element.id);
        chai_1.assert.isNull(flattened[0].unit.category.id);
        chai_1.assert.equal(flattened[0].category.name, 'cat name');
        const nulled = unflatten_1.setToNull(flattened);
        chai_1.assert.isNull(nulled[0].element);
        chai_1.assert.equal(nulled[0].category.name, 'cat name');
        chai_1.assert.isNull(nulled[0].unit);
        done();
    });
    it('should return sub query in select', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserCategory)
            .select('id')
            .selectQuery('total', Number, testEntities_1.User, (subQuery) => {
            subQuery
                .count('id', 'total')
                .whereColumn('categoryId', '=', 'id');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "userCategories"."id" as "id", (select count("users"."id") as "total" from "users" where "users"."categoryId" = "userCategories"."id") as "total" from "userCategories"');
        done();
    });
    it('should left outer join with function with and in on', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('evilTwin', testEntities_1.UserSetting, join => {
            join.on('id', '=', 'id');
            join.on('key', '=', 'key');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "userSettings" left outer join "userSettings" as "evilTwin" on "userSettings"."id" = "evilTwin"."id" and "userSettings"."key" = "evilTwin"."key"');
        done();
    });
    it('should left outer join with function and selection of joined table', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.UserSetting)
            .leftOuterJoinTableOnFunction('evilTwin', testEntities_1.UserSetting, join => {
            join.on('id', '=', 'id');
        })
            .where('evilTwin.value', 'value')
            .select('evilTwin.key');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select "evilTwin"."key" as "evilTwin.key" from "userSettings" left outer join "userSettings" as "evilTwin" on "userSettings"."id" = "evilTwin"."id" where "evilTwin"."value" = \'value\'');
        done();
    });
    it('should get name of the table', done => {
        const tableName = src_1.getTableName(testEntities_1.User);
        chai_1.assert.equal(tableName, 'users');
        done();
    });
    it('should get name of the column', done => {
        const columnName = decorators_1.getColumnName(testEntities_1.User, 'id');
        chai_1.assert.equal(columnName, 'id');
        done();
    });
    it('should insert a select', async () => {
        const k = knex({ client: 'postgresql' });
        const typedKnex = new typedKnex_1.TypedKnex(k);
        const query = typedKnex
            .query(testEntities_1.User);
        try {
            await query
                .selectRaw('f', String, '\'fixedValue\'')
                .select('name')
                .distinct()
                .whereNotNull('name')
                .insertSelect(testEntities_1.UserSetting, 'id', 'initialValue');
        }
        catch (_e) {
            chai_1.assert.equal(query.toQuery(), `insert into "userSettings" ("userSettings"."id","userSettings"."initialValue") select distinct ('fixedValue') as "f", "users"."name" as "name" from "users" where "users"."name" is not null`);
        }
    });
    it('should create query with order by raw', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .orderByRaw('SUM(??) DESC', 'users.year');
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" order by SUM("users"."year") DESC');
        done();
    });
    it('should create query with where in with subquery', done => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(testEntities_1.User)
            .whereExists(testEntities_1.UserSetting, (subQuery) => {
            subQuery.whereColumn('userId', '=', 'id');
        });
        const queryString = query.toQuery();
        chai_1.assert.equal(queryString, 'select * from "users" where exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');
        done();
    });
    it('should create insert query', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.insertItem({ id: 'newId' });
        chai_1.assert.equal(query.queryLog.trim(), `insert into "users" ("id") values ('newId')`);
    });
    it('should create insert query with column name mapping', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.insertItem({ status: 'newStatus' });
        chai_1.assert.equal(query.queryLog.trim(), `insert into "users" ("weirdDatabaseName") values ('newStatus')`);
    });
    it('should create multiple insert queries', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.insertItems([{ id: 'newId1' }, { id: 'newId2' }]);
        chai_1.assert.equal(query.queryLog.trim(), `insert into "users" ("id") values ('newId1'), ('newId2')`);
    });
    it('should create multiple insert queries with column name mapping', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.insertItems([{ status: 'newStatus1' }, { status: 'newStatus2' }]);
        chai_1.assert.equal(query.queryLog.trim(), `insert into "users" ("weirdDatabaseName") values ('newStatus1'), ('newStatus2')`);
    });
    it('should create update query', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.updateItem({ id: 'newId' });
        chai_1.assert.equal(query.queryLog.trim(), `update "users" set "id" = 'newId'`);
    });
    it('should create update query with column name mapping', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.updateItem({ status: 'newStatus' });
        chai_1.assert.equal(query.queryLog.trim(), `update "users" set "weirdDatabaseName" = 'newStatus'`);
    });
    it('should create update query by id', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.updateItemByPrimaryKey('userId', { name: 'newName' });
        chai_1.assert.equal(query.queryLog.trim(), `update "users" set "name" = 'newName' where "id" = 'userId'`);
    });
    it('should create update query by id with column name mapping', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.updateItemByPrimaryKey('userId', { status: 'newStatus' });
        chai_1.assert.equal(query.queryLog.trim(), `update "users" set "weirdDatabaseName" = 'newStatus' where "id" = 'userId'`);
    });
    it('should create multiple update queries by id', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.updateItemsByPrimaryKey([
            { primaryKeyValue: 'userId1', data: { name: 'newName1' } },
            { primaryKeyValue: 'userId2', data: { name: 'newName2' } },
        ]);
        chai_1.assert.equal(query.queryLog.trim(), `update "users" set "name" = 'newName1' where "id" = 'userId1';\nupdate "users" set "name" = 'newName2' where "id" = 'userId2';`);
    });
    it('should create multiple update queries by id with column name mapping', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.updateItemsByPrimaryKey([
            { primaryKeyValue: 'userId1', data: { status: 'newStatus1' } },
            { primaryKeyValue: 'userId2', data: { status: 'newStatus2' } },
        ]);
        chai_1.assert.equal(query.queryLog.trim(), `update "users" set "weirdDatabaseName" = 'newStatus1' where "id" = 'userId1';\nupdate "users" set "weirdDatabaseName" = 'newStatus2' where "id" = 'userId2';`);
    });
    it('should create findByPrimaryKey query', async () => {
        const typedKnex = new typedKnex_1.TypedKnex(knex({ client: 'postgresql' }));
        typedKnex.onlyLogQuery = true;
        const query = typedKnex
            .query(testEntities_1.User);
        query.onlyLogQuery = true;
        await query.findByPrimaryKey('1', 'id', 'name');
        chai_1.assert.equal(query.queryLog.trim(), `select "users"."id" as "id", "users"."name" as "name" from "users" where "id" = '1'`);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZWRRdWVyeUJ1aWxkZXJUZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvdW5pdC90eXBlZFF1ZXJ5QnVpbGRlclRlc3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQThCO0FBQzlCLDZCQUE2QjtBQUM3QixtQ0FBc0Q7QUFDdEQscURBQXFEO0FBQ3JELG1EQUFnRDtBQUNoRCxtREFBMkQ7QUFDM0Qsa0RBQWtFO0FBRWxFLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7SUFDbkMsRUFBRSxDQUFDLHFDQUFxQyxFQUFFLElBQUksQ0FBQyxFQUFFO1FBQzdDLE1BQU0sU0FBUyxHQUFHLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsbUJBQUksQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNwQyxhQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBR25ELElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsd0NBQXdDLEVBQUUsSUFBSSxDQUFDLEVBQUU7UUFDaEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxxQkFBUyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEUsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxtQkFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4RCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7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Q0FBQztJQUlILEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRSxLQUFLLElBQUksRUFBRTtRQUNsRCxNQUFNLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvRCxTQUFpQixDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFdkMsTUFBTSxLQUFLLEdBQUcsU0FBUzthQUNsQixLQUFLLENBQUMsbUJBQUksQ0FBQyxDQUFDO1FBRWhCLEtBQWEsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBRW5DLE1BQU0sS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFaEQsYUFBTSxDQUFDLEtBQUssQ0FDUCxLQUFhLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUM5QixxRkFBcUYsQ0FDeEYsQ0FBQztJQUNOLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhc3NlcnQgfSBmcm9tICdjaGFpJztcbmltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG5pbXBvcnQgeyBnZXRFbnRpdGllcywgZ2V0VGFibGVOYW1lIH0gZnJvbSAnLi4vLi4vc3JjJztcbmltcG9ydCB7IGdldENvbHVtbk5hbWUgfSBmcm9tICcuLi8uLi9zcmMvZGVjb3JhdG9ycyc7XG5pbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi8uLi9zcmMvdHlwZWRLbmV4JztcbmltcG9ydCB7IHNldFRvTnVsbCwgdW5mbGF0dGVuIH0gZnJvbSAnLi4vLi4vc3JjL3VuZmxhdHRlbic7XG5pbXBvcnQgeyBVc2VyLCBVc2VyQ2F0ZWdvcnksIFVzZXJTZXR0aW5nIH0gZnJvbSAnLi4vdGVzdEVudGl0aWVzJztcblxuZGVzY3JpYmUoJ1R5cGVkS25leFF1ZXJ5QnVpbGRlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBzZWxlY3QgKiBmcm9tIFwidXNlcnNcIicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHF1ZXJ5U3RyaW5nLCAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCInKTtcblxuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHNlbGVjdCBcImlkXCIgZnJvbSBcInVzZXJzXCInLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leC5xdWVyeShVc2VyKS5zZWxlY3QoYyA9PiBbYy5pZF0pO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHF1ZXJ5U3RyaW5nLCAnc2VsZWN0IFwidXNlcnNcIi5cImlkXCIgYXMgXCJpZFwiIGZyb20gXCJ1c2Vyc1wiJyk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gY2FtZWxDYXNlIGNvcnJlY3RseScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAuc2VsZWN0KGMgPT4gW2MuaW5pdGlhbFZhbHVlXSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgXCJ1c2VyU2V0dGluZ3NcIi5cImluaXRpYWxWYWx1ZVwiIGFzIFwiaW5pdGlhbFZhbHVlXCIgZnJvbSBcInVzZXJTZXR0aW5nc1wiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggd2hlcmUgb24gY29sdW1uIG9mIG93biB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLndoZXJlKGMgPT4gYy5uYW1lLCAndXNlcjEnKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibmFtZVwiID0gXFwndXNlcjFcXCcnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBEYXRlIGNvbHVtbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuc2VsZWN0KGkgPT4gaS5iaXJ0aERhdGUpXG4gICAgICAgICAgICAud2hlcmUoYyA9PiBjLmJpcnRoRGF0ZSwgbmV3IERhdGUoMTk3OSwgMCwgMSkpO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgXCJ1c2Vyc1wiLlwiYmlydGhEYXRlXCIgYXMgXCJiaXJ0aERhdGVcIiBmcm9tIFwidXNlcnNcIiB3aGVyZSBcInVzZXJzXCIuXCJiaXJ0aERhdGVcIiA9IFxcJzE5NzktMDEtMDEgMDA6MDA6MDAuMDAwXFwnJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcblxuXG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggYXJyYXkgY29sdW1uJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXgucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5zZWxlY3QoaSA9PiBpLnRhZ3MpXG4gICAgICAgICAgICAud2hlcmUoYyA9PiBjLnRhZ3MsIFsndGFnMSddKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlcnNcIi5cInRhZ3NcIiBhcyBcInRhZ3NcIiBmcm9tIFwidXNlcnNcIiB3aGVyZSBcInVzZXJzXCIuXCJ0YWdzXCIgPSBcXCd7XCJ0YWcxXCJ9XFwnJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCB3aGVyZSBvbiBjb2x1bW4gb2Ygb3duIHRhYmxlIHdpdGggTElLRScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLndoZXJlKGMgPT4gYy5uYW1lLCAnbGlrZScsICcldXNlciUnKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibmFtZVwiIGxpa2UgXFwnJXVzZXIlXFwnJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgaGFuZGxlIG51bGxhYmxlIHByb3BlcnRpZXMnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyQ2F0ZWdvcnkpXG4gICAgICAgICAgICAuc2VsZWN0KGkgPT4gaS5waG9uZU51bWJlcilcbiAgICAgICAgICAgIC53aGVyZShjID0+IGMucGhvbmVOdW1iZXIsICd1c2VyMScpXG4gICAgICAgICAgICAuc2VsZWN0KGkgPT4gaS5iYWNrdXBSZWdpb24uY29kZSlcbiAgICAgICAgICAgIC50b1F1ZXJ5KCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBoYW5kbGUgbnVsbGFibGUgbGV2ZWwgMiBwcm9wZXJ0aWVzJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5zZWxlY3QoaSA9PiBpLmNhdGVnb3J5LnBob25lTnVtYmVyKVxuICAgICAgICAgICAgLndoZXJlKGMgPT4gYy5jYXRlZ29yeS5waG9uZU51bWJlciwgJ3VzZXIxJyk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG5cblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggd2hlcmUgbm90IG9uIGNvbHVtbiBvZiBvd24gdGFibGUnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leC5xdWVyeShVc2VyKS53aGVyZU5vdChjID0+IGMubmFtZSwgJ3VzZXIxJyk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIG5vdCBcInVzZXJzXCIuXCJuYW1lXCIgPSBcXCd1c2VyMVxcJydcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGpvaW4gYSB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXJTZXR0aW5nKS5pbm5lckpvaW5Db2x1bW4oYyA9PiBjLnVzZXIpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJTZXR0aW5nc1wiIGlubmVyIGpvaW4gXCJ1c2Vyc1wiIGFzIFwidXNlclwiIG9uIFwidXNlclwiLlwiaWRcIiA9IFwidXNlclNldHRpbmdzXCIuXCJ1c2VySWRcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGpvaW4gYSB0YWJsZSBhbmQgc2VsZWN0IGEgY29sdW1uIG9mIGpvaW5lZCB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAuc2VsZWN0KGMgPT4gW2MudXNlci5uYW1lXSlcbiAgICAgICAgICAgIC5pbm5lckpvaW5Db2x1bW4oYyA9PiBjLnVzZXIpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlclwiLlwibmFtZVwiIGFzIFwidXNlci5uYW1lXCIgZnJvbSBcInVzZXJTZXR0aW5nc1wiIGlubmVyIGpvaW4gXCJ1c2Vyc1wiIGFzIFwidXNlclwiIG9uIFwidXNlclwiLlwiaWRcIiA9IFwidXNlclNldHRpbmdzXCIuXCJ1c2VySWRcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGpvaW4gYSB0YWJsZSBhbmQgdXNlIHdoZXJlIG9uIGEgY29sdW1uIG9mIGpvaW5lZCB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAud2hlcmUoYyA9PiBjLnVzZXIubmFtZSwgJ3VzZXIxJylcbiAgICAgICAgICAgIC5pbm5lckpvaW5Db2x1bW4oYyA9PiBjLnVzZXIpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJTZXR0aW5nc1wiIGlubmVyIGpvaW4gXCJ1c2Vyc1wiIGFzIFwidXNlclwiIG9uIFwidXNlclwiLlwiaWRcIiA9IFwidXNlclNldHRpbmdzXCIuXCJ1c2VySWRcIiB3aGVyZSBcInVzZXJcIi5cIm5hbWVcIiA9IFxcJ3VzZXIxXFwnJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgam9pbiB0d28gbGV2ZWwgb2YgdGFibGVzJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyU2V0dGluZylcbiAgICAgICAgICAgIC5pbm5lckpvaW5Db2x1bW4oYyA9PiBjLnVzZXIpXG4gICAgICAgICAgICAuaW5uZXJKb2luQ29sdW1uKGMgPT4gYy51c2VyLmNhdGVnb3J5KTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiBpbm5lciBqb2luIFwidXNlcnNcIiBhcyBcInVzZXJcIiBvbiBcInVzZXJcIi5cImlkXCIgPSBcInVzZXJTZXR0aW5nc1wiLlwidXNlcklkXCIgaW5uZXIgam9pbiBcInVzZXJDYXRlZ29yaWVzXCIgYXMgXCJ1c2VyX2NhdGVnb3J5XCIgb24gXCJ1c2VyX2NhdGVnb3J5XCIuXCJpZFwiID0gXCJ1c2VyXCIuXCJjYXRlZ29yeUlkXCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBqb2luIHRocmVlIGxldmVsIG9mIHRhYmxlcycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAuaW5uZXJKb2luQ29sdW1uKGMgPT4gYy51c2VyLmNhdGVnb3J5LnJlZ2lvbik7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgaW5uZXIgam9pbiBcInJlZ2lvbnNcIiBhcyBcInVzZXJfY2F0ZWdvcnlfcmVnaW9uXCIgb24gXCJ1c2VyX2NhdGVnb3J5X3JlZ2lvblwiLlwiaWRcIiA9IFwidXNlcl9jYXRlZ29yeVwiLlwicmVnaW9uSWRcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGpvaW4gdHdvIGxldmVscyBvZiB0YWJsZXMgYW5kIHNlbGVjdCBhIGNvbHVtbiBvZiB0aGUgbGFzdCBqb2luZWQgdGFibGUnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLnNlbGVjdChjID0+IGMudXNlci5jYXRlZ29yeS5uYW1lKVxuICAgICAgICAgICAgLmlubmVySm9pbkNvbHVtbihjID0+IGMudXNlci5jYXRlZ29yeSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgXCJ1c2VyX2NhdGVnb3J5XCIuXCJuYW1lXCIgYXMgXCJ1c2VyLmNhdGVnb3J5Lm5hbWVcIiBmcm9tIFwidXNlclNldHRpbmdzXCIgaW5uZXIgam9pbiBcInVzZXJDYXRlZ29yaWVzXCIgYXMgXCJ1c2VyX2NhdGVnb3J5XCIgb24gXCJ1c2VyX2NhdGVnb3J5XCIuXCJpZFwiID0gXCJ1c2VyXCIuXCJjYXRlZ29yeUlkXCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBqb2luIHRocmVlIGxldmVscyBvZiB0YWJsZXMgYW5kIHNlbGVjdCBhIGNvbHVtbiBvZiB0aGUgbGFzdCBqb2luZWQgdGFibGUnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLnNlbGVjdChjID0+IFtjLnVzZXIuY2F0ZWdvcnkucmVnaW9uLmNvZGVdKVxuICAgICAgICAgICAgLmlubmVySm9pbkNvbHVtbihjID0+IGMudXNlci5jYXRlZ29yeS5yZWdpb24pO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlcl9jYXRlZ29yeV9yZWdpb25cIi5cImNvZGVcIiBhcyBcInVzZXIuY2F0ZWdvcnkucmVnaW9uLmNvZGVcIiBmcm9tIFwidXNlclNldHRpbmdzXCIgaW5uZXIgam9pbiBcInJlZ2lvbnNcIiBhcyBcInVzZXJfY2F0ZWdvcnlfcmVnaW9uXCIgb24gXCJ1c2VyX2NhdGVnb3J5X3JlZ2lvblwiLlwiaWRcIiA9IFwidXNlcl9jYXRlZ29yeVwiLlwicmVnaW9uSWRcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGpvaW4gdHdvIGxldmVscyBvZiB0YWJsZXMgYW5kIHVzZSB3aGVyZSBvbiBhIGNvbHVtbiBvZiBsYXN0IGpvaW5lZCB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAud2hlcmUoYyA9PiBjLnVzZXIuY2F0ZWdvcnkubmFtZSwgJ3VzZXIxJylcbiAgICAgICAgICAgIC5pbm5lckpvaW5Db2x1bW4oYyA9PiBjLnVzZXIuY2F0ZWdvcnkpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJTZXR0aW5nc1wiIGlubmVyIGpvaW4gXCJ1c2VyQ2F0ZWdvcmllc1wiIGFzIFwidXNlcl9jYXRlZ29yeVwiIG9uIFwidXNlcl9jYXRlZ29yeVwiLlwiaWRcIiA9IFwidXNlclwiLlwiY2F0ZWdvcnlJZFwiIHdoZXJlIFwidXNlcl9jYXRlZ29yeVwiLlwibmFtZVwiID0gXFwndXNlcjFcXCcnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBqb2luIHRocmVlIGxldmVscyBvZiB0YWJsZXMgYW5kIHVzZSB3aGVyZSBvbiBhIGNvbHVtbiBvZiBsYXN0IGpvaW5lZCB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAud2hlcmUoYyA9PiBjLnVzZXIuY2F0ZWdvcnkucmVnaW9uLmNvZGUsIDIpXG4gICAgICAgICAgICAuaW5uZXJKb2luQ29sdW1uKGMgPT4gYy51c2VyLmNhdGVnb3J5LnJlZ2lvbik7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgaW5uZXIgam9pbiBcInJlZ2lvbnNcIiBhcyBcInVzZXJfY2F0ZWdvcnlfcmVnaW9uXCIgb24gXCJ1c2VyX2NhdGVnb3J5X3JlZ2lvblwiLlwiaWRcIiA9IFwidXNlcl9jYXRlZ29yeVwiLlwicmVnaW9uSWRcIiB3aGVyZSBcInVzZXJfY2F0ZWdvcnlfcmVnaW9uXCIuXCJjb2RlXCIgPSAyJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuXG4gICAgaXQoJ3Nob3VsZCBpbm5lciBqb2luIHdpdGggZnVuY3Rpb24gd2l0aCBvdGhlciB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAuaW5uZXJKb2luVGFibGVPbkZ1bmN0aW9uKCdvdGhlclVzZXInLCBVc2VyLCBqb2luID0+IHtcbiAgICAgICAgICAgICAgICBqb2luLm9uKGkgPT4gaS5pZCwgJz0nLCBqID0+IGoudXNlcjJJZCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJTZXR0aW5nc1wiIGlubmVyIGpvaW4gXCJ1c2Vyc1wiIGFzIFwib3RoZXJVc2VyXCIgb24gXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXIySWRcIiA9IFwib3RoZXJVc2VyXCIuXCJpZFwiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgc2VsZWN0IDIgY29sdW1ucyBhdCBvbmNlJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXgucXVlcnkoVXNlcikuc2VsZWN0KGMgPT4gW2MuaWQsIGMubmFtZV0pO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlcnNcIi5cImlkXCIgYXMgXCJpZFwiLCBcInVzZXJzXCIuXCJuYW1lXCIgYXMgXCJuYW1lXCIgZnJvbSBcInVzZXJzXCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBzZWxlY3QgMiBjb2x1bW5zIGF0IG9uY2UgZnJvbSBwYXJlbnQnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLnNlbGVjdChjID0+IFtjLnVzZXIuaWQsIGMudXNlci5uYW1lXSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgXCJ1c2VyXCIuXCJpZFwiIGFzIFwidXNlci5pZFwiLCBcInVzZXJcIi5cIm5hbWVcIiBhcyBcInVzZXIubmFtZVwiIGZyb20gXCJ1c2VyU2V0dGluZ3NcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICAvLyBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHdoZXJlIG5vdCBvbiBjb2x1bW4gb2Ygb3duIHRhYmxlJywgKGRvbmUpID0+IHtcblxuICAgIC8vICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgLy8gICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgLy8gICAgICAgICAucXVlcnkoVXNlcilcbiAgICAvLyAgICAgICAgIC53aGVyZU5vdCgnbmFtZScsICd1c2VyMScpO1xuICAgIC8vICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAvLyAgICAgYXNzZXJ0LmVxdWFsKHF1ZXJ5U3RyaW5nLCAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgbm90IFwibmFtZVwiID0gXFwndXNlcjFcXCcnKTtcblxuICAgIC8vICAgICBkb25lKCk7XG4gICAgLy8gfSk7XG5cbiAgICBpdCgnc2hvdWxkIHNlbGVjdCBjb2x1bW4gZnJvbSB0YWJsZSB3aXRoIHRvLW1hbnkgcmVsYXRpb25zaGlwJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC8vIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLy8gLnNlbGVjdENvbHVtbldpdGhBcnJheXMoJ2NhdGVnb3J5JywgJ25hbWUnKTtcbiAgICAgICAgICAgIC8vIC5zZWxlY3QoWydjYXRlZ29yeTInLCAncmVnaW9uSWQnKV07XG4gICAgICAgICAgICAuc2VsZWN0KGMgPT4gW2MudXNlci5jYXRlZ29yeS5yZWdpb25JZF0pO1xuICAgICAgICAvLyAuc2VsZWN0KFsndXNlcjJzJywgJ2NhdGVnb3J5JyldO1xuICAgICAgICAvLyAuc2VsZWN0KFsnbmFtZScpXTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBcInVzZXJfY2F0ZWdvcnlcIi5cInJlZ2lvbklkXCIgYXMgXCJ1c2VyLmNhdGVnb3J5LnJlZ2lvbklkXCIgZnJvbSBcInVzZXJTZXR0aW5nc1wiJ1xuICAgICAgICApO1xuXG4gICAgICAgIC8vIGNvbnN0IGkgPSBhd2FpdCBxdWVyeS5maXJzdEl0ZW0oKTtcbiAgICAgICAgLy8gaWYgKGkpIHtcbiAgICAgICAgLy8gICAgIC8vIGNvbnN0IGkxID0gaS51c2VyU2V0dGluZ3M7XG4gICAgICAgIC8vICAgICBjb25zdCBpMSA9IGkuY2F0ZWdvcnkubmFtZTtcbiAgICAgICAgLy8gICAgIGNvbnN0IGkyID0gaS5jYXRlZ29yeS5pZDtcbiAgICAgICAgLy8gICAgIGNvbnN0IGkzID0gaS5pZDtcbiAgICAgICAgLy8gICAgIGNvbnN0IGk0ID0gaS5uYW1lO1xuICAgICAgICAvLyAgICAgaS51c2VyLmNhdGVnb3J5LnJlZ2lvbklkXG5cbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgc2VsZWN0IHJhdyBxdWVyeScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5zZWxlY3RSYXcoJ3N1YlF1ZXJ5JywgTnVtYmVyLCAnc2VsZWN0IG90aGVyLmlkIGZyb20gb3RoZXInKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAoc2VsZWN0IG90aGVyLmlkIGZyb20gb3RoZXIpIGFzIFwic3ViUXVlcnlcIiBmcm9tIFwidXNlcnNcIidcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBjb25zdCBpID0gYXdhaXQgcXVlcnkuZmlyc3RJdGVtKCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGkubmFtZSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGkuc3ViUXVlcnkgPT09IHRydWUpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhpLnN1YlF1ZXJ5ID09PSAndHJ1ZScpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhpLnN1YlF1ZXJ5ZCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBBTkQgaW4gd2hlcmUgY2xhdXNlJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlKGMgPT4gYy5uYW1lLCAndXNlcjEnKVxuICAgICAgICAgICAgLmFuZFdoZXJlKGMgPT4gYy5uYW1lLCAndXNlcjInKVxuICAgICAgICAgICAgLmFuZFdoZXJlKGMgPT4gYy5uYW1lLCAnbGlrZScsICcldXNlciUnKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibmFtZVwiID0gXFwndXNlcjFcXCcgYW5kIFwidXNlcnNcIi5cIm5hbWVcIiA9IFxcJ3VzZXIyXFwnIGFuZCBcInVzZXJzXCIuXCJuYW1lXCIgbGlrZSBcXCcldXNlciVcXCcnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBPUiBpbiB3aGVyZSBjbGF1c2UnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAud2hlcmUoYyA9PiBjLm5hbWUsICd1c2VyMScpXG4gICAgICAgICAgICAub3JXaGVyZShjID0+IGMubmFtZSwgJ3VzZXIyJylcbiAgICAgICAgICAgIC5vcldoZXJlKGMgPT4gYy5uYW1lLCAnbGlrZScsICcldXNlciUnKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibmFtZVwiID0gXFwndXNlcjFcXCcgb3IgXCJ1c2Vyc1wiLlwibmFtZVwiID0gXFwndXNlcjJcXCcgb3IgXCJ1c2Vyc1wiLlwibmFtZVwiIGxpa2UgXFwnJXVzZXIlXFwnJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggd2hlcmUgaW4nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAud2hlcmVJbihjID0+IGMubmFtZSwgWyd1c2VyMScsICd1c2VyMiddKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibmFtZVwiIGluIChcXCd1c2VyMVxcJywgXFwndXNlcjJcXCcpJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggd2hlcmUgbm90IGluJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlTm90SW4oYyA9PiBjLm5hbWUsIFsndXNlcjEnLCAndXNlcjInXSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm5hbWVcIiBub3QgaW4gKFxcJ3VzZXIxXFwnLCBcXCd1c2VyMlxcJyknXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCB3aGVyZSBiZXR3ZWVuJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlQmV0d2VlbihjID0+IGMubnVtZXJpY1ZhbHVlLCBbMSwgMTBdKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIgYmV0d2VlbiAxIGFuZCAxMCdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHdoZXJlIG5vdCBiZXR3ZWVuJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlTm90QmV0d2VlbihjID0+IGMubnVtZXJpY1ZhbHVlLCBbMSwgMTBdKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIgbm90IGJldHdlZW4gMSBhbmQgMTAnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCB3aGVyZSBleGlzdHMnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAud2hlcmVFeGlzdHMoVXNlclNldHRpbmcsIChzdWJRdWVyeSwgcGFyZW50Q29sdW1uKSA9PiB7XG4gICAgICAgICAgICAgICAgc3ViUXVlcnkud2hlcmVDb2x1bW4oYyA9PiBjLnVzZXJJZCwgJz0nLCBwYXJlbnRDb2x1bW4uaWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIGV4aXN0cyAoc2VsZWN0ICogZnJvbSBcInVzZXJTZXR0aW5nc1wiIHdoZXJlIFwidXNlclNldHRpbmdzXCIuXCJ1c2VySWRcIiA9IFwidXNlcnNcIi5cImlkXCIpJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggd2hlcmUgZXhpc3RzIHdpdGggY29sdW1uIG5hbWUgbWFwcGluZycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC53aGVyZUV4aXN0cyhVc2VyU2V0dGluZywgKHN1YlF1ZXJ5LCBwYXJlbnRDb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICBzdWJRdWVyeS53aGVyZUNvbHVtbihjID0+IGMudXNlci5ub3RVbmRlZmluZWRTdGF0dXMsICc9JywgcGFyZW50Q29sdW1uLm5vdFVuZGVmaW5lZFN0YXR1cyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgZXhpc3RzIChzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgd2hlcmUgXCJ1c2VyXCIuXCJ3ZWlyZERhdGFiYXNlTmFtZTJcIiA9IFwidXNlcnNcIi5cIndlaXJkRGF0YWJhc2VOYW1lMlwiKSdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIG9yIHdoZXJlIGV4aXN0cycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC53aGVyZShjID0+IGMubmFtZSwgJ25hbWUnKVxuICAgICAgICAgICAgLm9yV2hlcmVFeGlzdHMoVXNlclNldHRpbmcsIChzdWJRdWVyeSwgcGFyZW50Q29sdW1uKSA9PiB7XG4gICAgICAgICAgICAgICAgc3ViUXVlcnkud2hlcmVDb2x1bW4oYyA9PiBjLnVzZXJJZCwgJz0nLCBwYXJlbnRDb2x1bW4uaWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm5hbWVcIiA9IFxcJ25hbWVcXCcgb3IgZXhpc3RzIChzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgd2hlcmUgXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXJJZFwiID0gXCJ1c2Vyc1wiLlwiaWRcIiknXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCB3aGVyZSBub3QgZXhpc3RzJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlTm90RXhpc3RzKFVzZXJTZXR0aW5nLCAoc3ViUXVlcnksIHBhcmVudENvbHVtbikgPT4ge1xuICAgICAgICAgICAgICAgIHN1YlF1ZXJ5LndoZXJlQ29sdW1uKGMgPT4gYy51c2VySWQsICc9JywgcGFyZW50Q29sdW1uLmlkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiB3aGVyZSBub3QgZXhpc3RzIChzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgd2hlcmUgXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXJJZFwiID0gXCJ1c2Vyc1wiLlwiaWRcIiknXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBvciB3aGVyZSBub3QgZXhpc3RzJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlKGMgPT4gYy5uYW1lLCAnbmFtZScpXG4gICAgICAgICAgICAub3JXaGVyZU5vdEV4aXN0cyhVc2VyU2V0dGluZywgKHN1YlF1ZXJ5LCBwYXJlbnRDb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICBzdWJRdWVyeS53aGVyZUNvbHVtbihjID0+IGMudXNlcklkLCAnPScsIHBhcmVudENvbHVtbi5pZCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibmFtZVwiID0gXFwnbmFtZVxcJyBvciBub3QgZXhpc3RzIChzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgd2hlcmUgXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXJJZFwiID0gXCJ1c2Vyc1wiLlwiaWRcIiknXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCB3aGVyZSByYXcnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAud2hlcmVSYXcoJz8/ID0gPz8nLCAndXNlcnMuaWQnLCAndXNlcnMubmFtZScpO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiB3aGVyZSBcInVzZXJzXCIuXCJpZFwiID0gXCJ1c2Vyc1wiLlwibmFtZVwiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggZ3JvdXAgYnknLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuc2VsZWN0KGMgPT4gYy5zb21lVmFsdWUpXG4gICAgICAgICAgICAuc2VsZWN0UmF3KCd0b3RhbCcsIE51bWJlciwgJ1NVTShcIm51bWVyaWNWYWx1ZVwiKScpXG4gICAgICAgICAgICAuZ3JvdXBCeShjID0+IGMuc29tZVZhbHVlKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlcnNcIi5cInNvbWVWYWx1ZVwiIGFzIFwic29tZVZhbHVlXCIsIChTVU0oXCJudW1lcmljVmFsdWVcIikpIGFzIFwidG90YWxcIiBmcm9tIFwidXNlcnNcIiBncm91cCBieSBcInVzZXJzXCIuXCJzb21lVmFsdWVcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGhhdmluZycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5oYXZpbmcoYyA9PiBjLm51bWVyaWNWYWx1ZSwgJz4nLCAxMCk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIGhhdmluZyBcInVzZXJzXCIuXCJudW1lcmljVmFsdWVcIiA+IDEwJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggaGF2aW5nIG51bGwnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leC5xdWVyeShVc2VyKS5oYXZpbmdOdWxsKGMgPT4gYy5udW1lcmljVmFsdWUpO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiBoYXZpbmcgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIgaXMgbnVsbCdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGhhdmluZyBub3QgbnVsbCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLmhhdmluZ05vdE51bGwoYyA9PiBjLm51bWVyaWNWYWx1ZSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIGhhdmluZyBcInVzZXJzXCIuXCJudW1lcmljVmFsdWVcIiBpcyBub3QgbnVsbCdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGhhdmluZyBpbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5oYXZpbmdJbihjID0+IGMubmFtZSwgWyd1c2VyMScsICd1c2VyMiddKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgaGF2aW5nIFwidXNlcnNcIi5cIm5hbWVcIiBpbiAoXFwndXNlcjFcXCcsIFxcJ3VzZXIyXFwnKSdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGhhdmluZyBub3QgaW4nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuaGF2aW5nTm90SW4oYyA9PiBjLm5hbWUsIFsndXNlcjEnLCAndXNlcjInXSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIGhhdmluZyBcInVzZXJzXCIuXCJuYW1lXCIgbm90IGluIChcXCd1c2VyMVxcJywgXFwndXNlcjJcXCcpJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggaGF2aW5nIGV4aXN0cycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5oYXZpbmdFeGlzdHMoVXNlclNldHRpbmcsIChzdWJRdWVyeSwgcGFyZW50Q29sdW1uKSA9PiB7XG4gICAgICAgICAgICAgICAgc3ViUXVlcnkud2hlcmVDb2x1bW4oYyA9PiBjLnVzZXJJZCwgJz0nLCBwYXJlbnRDb2x1bW4uaWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIGhhdmluZyBleGlzdHMgKHNlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiB3aGVyZSBcInVzZXJTZXR0aW5nc1wiLlwidXNlcklkXCIgPSBcInVzZXJzXCIuXCJpZFwiKSdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGhhdmluZyBub3QgZXhpc3RzJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLmhhdmluZ05vdEV4aXN0cyhVc2VyU2V0dGluZywgKHN1YlF1ZXJ5LCBwYXJlbnRDb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICBzdWJRdWVyeS53aGVyZUNvbHVtbihjID0+IGMudXNlcklkLCAnPScsIHBhcmVudENvbHVtbi5pZCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgaGF2aW5nIG5vdCBleGlzdHMgKHNlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiB3aGVyZSBcInVzZXJTZXR0aW5nc1wiLlwidXNlcklkXCIgPSBcInVzZXJzXCIuXCJpZFwiKSdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGhhdmluZyByYXcnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuaGF2aW5nUmF3KCc/PyA9ID8/JywgJ3VzZXJzLmlkJywgJ3VzZXJzLm5hbWUnKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgaGF2aW5nIFwidXNlcnNcIi5cImlkXCIgPSBcInVzZXJzXCIuXCJuYW1lXCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBoYXZpbmcgYmV0d2VlbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5oYXZpbmdCZXR3ZWVuKGMgPT4gYy5udW1lcmljVmFsdWUsIFsxLCAxMF0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiBoYXZpbmcgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIgYmV0d2VlbiAxIGFuZCAxMCdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGhhdmluZyBub3QgYmV0d2VlbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5oYXZpbmdOb3RCZXR3ZWVuKGMgPT4gYy5udW1lcmljVmFsdWUsIFsxLCAxMF0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiBoYXZpbmcgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIgbm90IGJldHdlZW4gMSBhbmQgMTAnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBhbiB1bmlvbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5zZWxlY3QoYyA9PiBbYy5pZF0pXG4gICAgICAgICAgICAudW5pb24oVXNlciwgc3ViUXVlcnkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YlF1ZXJ5LnNlbGVjdChjID0+IFtjLmlkXSkud2hlcmUoYyA9PiBjLm51bWVyaWNWYWx1ZSwgMTIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBcInVzZXJzXCIuXCJpZFwiIGFzIFwiaWRcIiBmcm9tIFwidXNlcnNcIiB1bmlvbiBzZWxlY3QgXCJ1c2Vyc1wiLlwiaWRcIiBhcyBcImlkXCIgZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIgPSAxMidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGFuIHVuaW9uIGFsbCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5zZWxlY3QoYyA9PiBbYy5pZF0pXG4gICAgICAgICAgICAudW5pb25BbGwoVXNlciwgc3ViUXVlcnkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YlF1ZXJ5LnNlbGVjdChjID0+IFtjLmlkXSkud2hlcmUoYyA9PiBjLm51bWVyaWNWYWx1ZSwgMTIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBcInVzZXJzXCIuXCJpZFwiIGFzIFwiaWRcIiBmcm9tIFwidXNlcnNcIiB1bmlvbiBhbGwgc2VsZWN0IFwidXNlcnNcIi5cImlkXCIgYXMgXCJpZFwiIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiID0gMTInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBtaW4nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAubWluKGMgPT4gYy5udW1lcmljVmFsdWUsICdtaW5OdW1lcmljVmFsdWUnKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBtaW4oXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIpIGFzIFwibWluTnVtZXJpY1ZhbHVlXCIgZnJvbSBcInVzZXJzXCInXG4gICAgICAgICk7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggY291bnQnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuY291bnQoYyA9PiBjLm51bWVyaWNWYWx1ZSwgJ2NvdW50TnVtZXJpY1ZhbHVlJyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgY291bnQoXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIpIGFzIFwiY291bnROdW1lcmljVmFsdWVcIiBmcm9tIFwidXNlcnNcIidcbiAgICAgICAgKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBjb3VudERpc3RpbmN0JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLmNvdW50RGlzdGluY3QoYyA9PiBjLm51bWVyaWNWYWx1ZSwgJ2NvdW50RGlzdGluY3ROdW1lcmljVmFsdWUnKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBjb3VudChkaXN0aW5jdCBcInVzZXJzXCIuXCJudW1lcmljVmFsdWVcIikgYXMgXCJjb3VudERpc3RpbmN0TnVtZXJpY1ZhbHVlXCIgZnJvbSBcInVzZXJzXCInXG4gICAgICAgICk7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggbWF4JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLm1heChjID0+IGMubnVtZXJpY1ZhbHVlLCAnbWF4TnVtZXJpY1ZhbHVlJyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgbWF4KFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiKSBhcyBcIm1heE51bWVyaWNWYWx1ZVwiIGZyb20gXCJ1c2Vyc1wiJ1xuICAgICAgICApO1xuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHR3byBtYXgnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAubWF4KGMgPT4gYy5udW1lcmljVmFsdWUsICdtYXhOdW1lcmljVmFsdWUnKVxuICAgICAgICAgICAgLm1heChjID0+IGMuc29tZVZhbHVlLCAnbWF4U29tZVZhbHVlJyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgbWF4KFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiKSBhcyBcIm1heE51bWVyaWNWYWx1ZVwiLCBtYXgoXCJ1c2Vyc1wiLlwic29tZVZhbHVlXCIpIGFzIFwibWF4U29tZVZhbHVlXCIgZnJvbSBcInVzZXJzXCInXG4gICAgICAgICk7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggc3VtJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLnN1bShjID0+IGMubnVtZXJpY1ZhbHVlLCAnc3VtTnVtZXJpY1ZhbHVlJyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3Qgc3VtKFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiKSBhcyBcInN1bU51bWVyaWNWYWx1ZVwiIGZyb20gXCJ1c2Vyc1wiJ1xuICAgICAgICApO1xuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHN1bURpc3RpbmN0JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLnN1bURpc3RpbmN0KGMgPT4gYy5udW1lcmljVmFsdWUsICdzdW1EaXN0aW5jdE51bWVyaWNWYWx1ZScpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IHN1bShkaXN0aW5jdCBcInVzZXJzXCIuXCJudW1lcmljVmFsdWVcIikgYXMgXCJzdW1EaXN0aW5jdE51bWVyaWNWYWx1ZVwiIGZyb20gXCJ1c2Vyc1wiJ1xuICAgICAgICApO1xuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGF2ZycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5hdmcoYyA9PiBjLm51bWVyaWNWYWx1ZSwgJ2F2Z051bWVyaWNWYWx1ZScpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IGF2ZyhcInVzZXJzXCIuXCJudW1lcmljVmFsdWVcIikgYXMgXCJhdmdOdW1lcmljVmFsdWVcIiBmcm9tIFwidXNlcnNcIidcbiAgICAgICAgKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBhdmdEaXN0aW5jdCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5hdmdEaXN0aW5jdChjID0+IGMubnVtZXJpY1ZhbHVlLCAnYXZnRGlzdGluY3ROdW1lcmljVmFsdWUnKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBhdmcoZGlzdGluY3QgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIpIGFzIFwiYXZnRGlzdGluY3ROdW1lcmljVmFsdWVcIiBmcm9tIFwidXNlcnNcIidcbiAgICAgICAgKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBvcmRlciBieScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLm9yZGVyQnkoYyA9PiBjLmlkKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIG9yZGVyIGJ5IFwidXNlcnNcIi5cImlkXCIgYXNjJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY2xlYXIgc2VsZWN0JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLnNlbGVjdChjID0+IFtjLmlkXSlcbiAgICAgICAgICAgIC5jbGVhclNlbGVjdCgpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHF1ZXJ5U3RyaW5nLCAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCInKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNsZWFyIHdoZXJlJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlKGMgPT4gYy5uYW1lLCAndXNlcjEnKVxuICAgICAgICAgICAgLmNsZWFyV2hlcmUoKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHF1ZXJ5U3RyaW5nLCAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCInKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNsZWFyIG9yZGVyJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLm9yZGVyQnkoYyA9PiBjLmlkKVxuICAgICAgICAgICAgLmNsZWFyT3JkZXIoKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChxdWVyeVN0cmluZywgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiJyk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBkaXN0aW5jdCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5zZWxlY3QoYyA9PiBbYy5pZF0pXG4gICAgICAgICAgICAuZGlzdGluY3QoKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBkaXN0aW5jdCBcInVzZXJzXCIuXCJpZFwiIGFzIFwiaWRcIiBmcm9tIFwidXNlcnNcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNsb25lIGFuZCBhZGp1c3Qgb25seSB0aGUgY2xvbmUnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLnNlbGVjdChjID0+IFtjLmlkXSk7XG5cbiAgICAgICAgY29uc3QgY2xvbmVkUXVlcnkgPSBxdWVyeS5jbG9uZSgpO1xuXG4gICAgICAgIGNsb25lZFF1ZXJ5LnNlbGVjdChjID0+IFtjLm5hbWVdKTtcblxuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeS50b1F1ZXJ5KCksXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlcnNcIi5cImlkXCIgYXMgXCJpZFwiIGZyb20gXCJ1c2Vyc1wiJ1xuICAgICAgICApO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBjbG9uZWRRdWVyeS50b1F1ZXJ5KCksXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlcnNcIi5cImlkXCIgYXMgXCJpZFwiLCBcInVzZXJzXCIuXCJuYW1lXCIgYXMgXCJuYW1lXCIgZnJvbSBcInVzZXJzXCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBncm91cGJ5IHJhdycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLmdyb3VwQnlSYXcoJ3llYXIgV0lUSCBST0xMVVAnKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgZ3JvdXAgYnkgeWVhciBXSVRIIFJPTExVUCdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIG9yIHdoZXJlIGluJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlSW4oYyA9PiBjLm5hbWUsIFsndXNlcjEnLCAndXNlcjInXSlcbiAgICAgICAgICAgIC5vcldoZXJlSW4oYyA9PiBjLm5hbWUsIFsndXNlcjMnLCAndXNlcjQnXSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm5hbWVcIiBpbiAoXFwndXNlcjFcXCcsIFxcJ3VzZXIyXFwnKSBvciBcInVzZXJzXCIuXCJuYW1lXCIgaW4gKFxcJ3VzZXIzXFwnLCBcXCd1c2VyNFxcJyknXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBvciB3aGVyZSBub3QgaW4nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAud2hlcmVOb3RJbihjID0+IGMubmFtZSwgWyd1c2VyMScsICd1c2VyMiddKVxuICAgICAgICAgICAgLm9yV2hlcmVOb3RJbihjID0+IGMubmFtZSwgWyd1c2VyMycsICd1c2VyNCddKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibmFtZVwiIG5vdCBpbiAoXFwndXNlcjFcXCcsIFxcJ3VzZXIyXFwnKSBvciBcInVzZXJzXCIuXCJuYW1lXCIgbm90IGluIChcXCd1c2VyM1xcJywgXFwndXNlcjRcXCcpJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggb3Igd2hlcmUgYmV0d2VlbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC53aGVyZUJldHdlZW4oYyA9PiBjLm51bWVyaWNWYWx1ZSwgWzEsIDEwXSlcbiAgICAgICAgICAgIC5vcldoZXJlQmV0d2VlbihjID0+IGMubnVtZXJpY1ZhbHVlLCBbMTAwLCAxMDAwXSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiIGJldHdlZW4gMSBhbmQgMTAgb3IgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIgYmV0d2VlbiAxMDAgYW5kIDEwMDAnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBvciB3aGVyZSBub3QgYmV0d2VlbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC53aGVyZU5vdEJldHdlZW4oYyA9PiBjLm51bWVyaWNWYWx1ZSwgWzEsIDEwXSlcbiAgICAgICAgICAgIC5vcldoZXJlTm90QmV0d2VlbihjID0+IGMubnVtZXJpY1ZhbHVlLCBbMTAwLCAxMDAwXSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiIG5vdCBiZXR3ZWVuIDEgYW5kIDEwIG9yIFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiIG5vdCBiZXR3ZWVuIDEwMCBhbmQgMTAwMCdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHBhcmVudGhlc2VzIGluIHdoZXJlJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlUGFyZW50aGVzZXMoc3ViID0+XG4gICAgICAgICAgICAgICAgc3ViLndoZXJlKGMgPT4gYy5pZCwgJzEnKS5vcldoZXJlKGMgPT4gYy5pZCwgJzInKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLm9yV2hlcmUoYyA9PiBjLm5hbWUsICdUZXN0ZXInKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgKFwidXNlcnNcIi5cImlkXCIgPSBcXCcxXFwnIG9yIFwidXNlcnNcIi5cImlkXCIgPSBcXCcyXFwnKSBvciBcInVzZXJzXCIuXCJuYW1lXCIgPSBcXCdUZXN0ZXJcXCcnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gbWV0YWRhdGEgZnJvbSBFbnRpdGllcycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBlbnRpdGllcyA9IGdldEVudGl0aWVzKCk7XG5cbiAgICAgICAgYXNzZXJ0LmVxdWFsKGVudGl0aWVzLmxlbmd0aCwgNSk7XG4gICAgICAgIGFzc2VydC5leGlzdHMoZW50aXRpZXMuZmluZChpID0+IGkudGFibGVOYW1lID09PSAndXNlcnMnKSk7XG4gICAgICAgIGFzc2VydC5leGlzdHMoZW50aXRpZXMuZmluZChpID0+IGkudGFibGVOYW1lID09PSAnY29ycmVjdFRhYmxlTmFtZScpKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHdoZXJlIG51bGwnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leC5xdWVyeShVc2VyKS53aGVyZU51bGwoYyA9PiBjLm5hbWUpLm9yV2hlcmVOdWxsKGMgPT4gYy5uYW1lKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibmFtZVwiIGlzIG51bGwgb3IgXCJ1c2Vyc1wiLlwibmFtZVwiIGlzIG51bGwnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCB3aGVyZSBub3QgbnVsbCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLndoZXJlTm90TnVsbChjID0+IGMubmFtZSkub3JXaGVyZU5vdE51bGwoYyA9PiBjLm5hbWUpO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiB3aGVyZSBcInVzZXJzXCIuXCJuYW1lXCIgaXMgbm90IG51bGwgb3IgXCJ1c2Vyc1wiLlwibmFtZVwiIGlzIG5vdCBudWxsJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbGVmdCBvdXRlciBqb2luIGEgdGFibGUnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLmxlZnRPdXRlckpvaW5Db2x1bW4oaSA9PiBpLnVzZXIpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJTZXR0aW5nc1wiIGxlZnQgb3V0ZXIgam9pbiBcInVzZXJzXCIgYXMgXCJ1c2VyXCIgb24gXCJ1c2VyXCIuXCJpZFwiID0gXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXJJZFwiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIGNhbWVsQ2FzZSBjb3JyZWN0bHknLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leC5xdWVyeShVc2VyU2V0dGluZykuc2VsZWN0KGMgPT4gYy5pbml0aWFsVmFsdWUpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlclNldHRpbmdzXCIuXCJpbml0aWFsVmFsdWVcIiBhcyBcImluaXRpYWxWYWx1ZVwiIGZyb20gXCJ1c2VyU2V0dGluZ3NcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGxlZnQgb3V0ZXIgam9pbiB3aXRoIGZ1bmN0aW9uIHdpdGggaXRzZWxmJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyU2V0dGluZylcbiAgICAgICAgICAgIC5sZWZ0T3V0ZXJKb2luVGFibGVPbkZ1bmN0aW9uKCdldmlsVHdpbicsIFVzZXJTZXR0aW5nLCBqb2luID0+IHtcbiAgICAgICAgICAgICAgICBqb2luLm9uKGkgPT4gaS5pZCwgJz0nLCBqID0+IGouaWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiBsZWZ0IG91dGVyIGpvaW4gXCJ1c2VyU2V0dGluZ3NcIiBhcyBcImV2aWxUd2luXCIgb24gXCJ1c2VyU2V0dGluZ3NcIi5cImlkXCIgPSBcImV2aWxUd2luXCIuXCJpZFwiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbGVmdCBvdXRlciBqb2luIHdpdGggZnVuY3Rpb24gd2l0aCBvdGhlciB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAubGVmdE91dGVySm9pblRhYmxlT25GdW5jdGlvbignb3RoZXJVc2VyJywgVXNlciwgam9pbiA9PiB7XG4gICAgICAgICAgICAgICAgam9pbi5vbihpID0+IGkuaWQsICc9JywgaiA9PiBqLnVzZXIySWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiBsZWZ0IG91dGVyIGpvaW4gXCJ1c2Vyc1wiIGFzIFwib3RoZXJVc2VyXCIgb24gXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXIySWRcIiA9IFwib3RoZXJVc2VyXCIuXCJpZFwiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbGVmdCBvdXRlciBqb2luIHdpdGggZnVuY3Rpb24gd2l0aCBvdGhlciB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAubGVmdE91dGVySm9pblRhYmxlT25GdW5jdGlvbignb3RoZXJVc2VyJywgVXNlciwgam9pbiA9PiB7XG4gICAgICAgICAgICAgICAgam9pblxuICAgICAgICAgICAgICAgICAgICAub24oaSA9PiBpLmlkLCAnPScsIGogPT4gai51c2VyMklkKVxuICAgICAgICAgICAgICAgICAgICAub25OdWxsKGkgPT4gaS5uYW1lKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgbGVmdCBvdXRlciBqb2luIFwidXNlcnNcIiBhcyBcIm90aGVyVXNlclwiIG9uIFwidXNlclNldHRpbmdzXCIuXCJ1c2VyMklkXCIgPSBcIm90aGVyVXNlclwiLlwiaWRcIiBhbmQgXCJvdGhlclVzZXJcIi5cIm5hbWVcIiBpcyBudWxsJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbGVmdCBvdXRlciBqb2luIHdpdGggZnVuY3Rpb24gd2l0aCBvdGhlciB0YWJsZSB3aXRoIG9uIGFuZCBvbiBvciBvbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAubGVmdE91dGVySm9pblRhYmxlT25GdW5jdGlvbignb3RoZXJVc2VyJywgVXNlciwgam9pbiA9PiB7XG4gICAgICAgICAgICAgICAgam9pblxuICAgICAgICAgICAgICAgICAgICAub24oaiA9PiBqLmlkLCAnPScsIGkgPT4gaS51c2VyMklkKVxuICAgICAgICAgICAgICAgICAgICAuYW5kT24oaiA9PiBqLm5hbWUsICc9JywgaSA9PiBpLnVzZXIySWQpXG4gICAgICAgICAgICAgICAgICAgIC5vck9uKGogPT4gai5zb21lVmFsdWUsICc9JywgaSA9PiBpLnVzZXIySWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiBsZWZ0IG91dGVyIGpvaW4gXCJ1c2Vyc1wiIGFzIFwib3RoZXJVc2VyXCIgb24gXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXIySWRcIiA9IFwib3RoZXJVc2VyXCIuXCJpZFwiIGFuZCBcInVzZXJTZXR0aW5nc1wiLlwidXNlcjJJZFwiID0gXCJvdGhlclVzZXJcIi5cIm5hbWVcIiBvciBcInVzZXJTZXR0aW5nc1wiLlwidXNlcjJJZFwiID0gXCJvdGhlclVzZXJcIi5cInNvbWVWYWx1ZVwiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuXG4gICAgaXQoJ3Nob3VsZCBsZWZ0IG91dGVyIGpvaW4gd2l0aCBmdW5jdGlvbiB3aXRoIG90aGVyIHRhYmxlIHdpdGggb25WYWwnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLmxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24oJ290aGVyVXNlcicsIFVzZXIsIGpvaW4gPT4ge1xuICAgICAgICAgICAgICAgIGpvaW5cbiAgICAgICAgICAgICAgICAgICAgLm9uVmFsKGkgPT4gaS5uYW1lLCAnPScsICcxJylcbiAgICAgICAgICAgICAgICAgICAgLmFuZE9uVmFsKGkgPT4gaS5uYW1lLCAnPScsICcyJylcbiAgICAgICAgICAgICAgICAgICAgLm9yT25WYWwoaSA9PiBpLm5hbWUsICc9JywgJzMnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgbGVmdCBvdXRlciBqb2luIFwidXNlcnNcIiBhcyBcIm90aGVyVXNlclwiIG9uIFwib3RoZXJVc2VyXCIuXCJuYW1lXCIgPSBcXCcxXFwnIGFuZCBcIm90aGVyVXNlclwiLlwibmFtZVwiID0gXFwnMlxcJyBvciBcIm90aGVyVXNlclwiLlwibmFtZVwiID0gXFwnM1xcJydcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgYmUgYWJsZSB0byB1c2Ugam9pbmVkIGNvbHVtbiBpbiBhbm90aGVyIGxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLmxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24oJ2V2aWxUd2luJywgVXNlclNldHRpbmcsIGpvaW4gPT4ge1xuICAgICAgICAgICAgICAgIGpvaW4ub24oaSA9PiBpLmlkLCAnPScsIGogPT4gai5pZCk7XG4gICAgICAgICAgICB9KS5sZWZ0T3V0ZXJKb2luVGFibGVPbkZ1bmN0aW9uKCdldmlsVHdpbjInLCBVc2VyU2V0dGluZywgam9pbiA9PiB7XG4gICAgICAgICAgICAgICAgam9pbi5vbihpID0+IGkuaWQsICc9JywgaiA9PiBqLmV2aWxUd2luLmlkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgbGVmdCBvdXRlciBqb2luIFwidXNlclNldHRpbmdzXCIgYXMgXCJldmlsVHdpblwiIG9uIFwidXNlclNldHRpbmdzXCIuXCJpZFwiID0gXCJldmlsVHdpblwiLlwiaWRcIiBsZWZ0IG91dGVyIGpvaW4gXCJ1c2VyU2V0dGluZ3NcIiBhcyBcImV2aWxUd2luMlwiIG9uIFwiZXZpbFR3aW5cIi5cImlkXCIgPSBcImV2aWxUd2luMlwiLlwiaWRcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHNlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXgucXVlcnkoVXNlcikubGltaXQoMTApO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHF1ZXJ5U3RyaW5nLCAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgbGltaXQgMTAnKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBzZWxlY3QgKiBmcm9tIFwidXNlcnNcIicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLm9mZnNldCgxMCk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwocXVlcnlTdHJpbmcsICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiBvZmZzZXQgMTAnKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBzZWxlY3QgKiBmcm9tIFwidXNlcnNcIicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpO1xuICAgICAgICBxdWVyeS51c2VLbmV4UXVlcnlCdWlsZGVyKHF1ZXJ5QnVpbGRlciA9PlxuICAgICAgICAgICAgcXVlcnlCdWlsZGVyLndoZXJlKCdzb21ldGhpbmdlbHNlJywgJ3ZhbHVlJylcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwic29tZXRoaW5nZWxzZVwiID0gXFwndmFsdWVcXCcnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZW1vdmVOdWxsT2JqZWN0cycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICBpZDogJ2lkJyxcbiAgICAgICAgICAgICdlbGVtZW50LmlkJzogbnVsbCxcbiAgICAgICAgICAgICdlbGVtZW50LmNhdGVnb3J5LmlkJzogbnVsbCxcbiAgICAgICAgICAgICd1bml0LmNhdGVnb3J5LmlkJzogbnVsbCxcbiAgICAgICAgICAgICdjYXRlZ29yeS5uYW1lJzogJ2NhdCBuYW1lJyxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZmxhdHRlbmVkID0gdW5mbGF0dGVuKFtyZXN1bHRdKTtcbiAgICAgICAgYXNzZXJ0LmlzTnVsbChmbGF0dGVuZWRbMF0uZWxlbWVudC5pZCk7XG4gICAgICAgIGFzc2VydC5pc051bGwoZmxhdHRlbmVkWzBdLnVuaXQuY2F0ZWdvcnkuaWQpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoZmxhdHRlbmVkWzBdLmNhdGVnb3J5Lm5hbWUsICdjYXQgbmFtZScpO1xuICAgICAgICBjb25zdCBudWxsZWQgPSBzZXRUb051bGwoZmxhdHRlbmVkKTtcbiAgICAgICAgYXNzZXJ0LmlzTnVsbChudWxsZWRbMF0uZWxlbWVudCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChudWxsZWRbMF0uY2F0ZWdvcnkubmFtZSwgJ2NhdCBuYW1lJyk7XG4gICAgICAgIGFzc2VydC5pc051bGwobnVsbGVkWzBdLnVuaXQpO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHN1YiBxdWVyeSBpbiBzZWxlY3QnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJDYXRlZ29yeSlcbiAgICAgICAgICAgIC5zZWxlY3QoaSA9PiBpLmlkKVxuICAgICAgICAgICAgLnNlbGVjdFF1ZXJ5KCd0b3RhbCcsIE51bWJlciwgVXNlciwgKHN1YlF1ZXJ5LCBwYXJlbnRDb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICBzdWJRdWVyeVxuICAgICAgICAgICAgICAgICAgICAuY291bnQoaSA9PiBpLmlkLCAndG90YWwnKVxuICAgICAgICAgICAgICAgICAgICAud2hlcmVDb2x1bW4oYyA9PiBjLmNhdGVnb3J5SWQsICc9JywgcGFyZW50Q29sdW1uLmlkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgXCJ1c2VyQ2F0ZWdvcmllc1wiLlwiaWRcIiBhcyBcImlkXCIsIChzZWxlY3QgY291bnQoXCJ1c2Vyc1wiLlwiaWRcIikgYXMgXCJ0b3RhbFwiIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cImNhdGVnb3J5SWRcIiA9IFwidXNlckNhdGVnb3JpZXNcIi5cImlkXCIpIGFzIFwidG90YWxcIiBmcm9tIFwidXNlckNhdGVnb3JpZXNcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGxlZnQgb3V0ZXIgam9pbiB3aXRoIGZ1bmN0aW9uIHdpdGggYW5kIGluIG9uJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyU2V0dGluZylcbiAgICAgICAgICAgIC5sZWZ0T3V0ZXJKb2luVGFibGVPbkZ1bmN0aW9uKCdldmlsVHdpbicsIFVzZXJTZXR0aW5nLCBqb2luID0+IHtcbiAgICAgICAgICAgICAgICBqb2luLm9uKGkgPT4gaS5pZCwgJz0nLCBqID0+IGouaWQpO1xuICAgICAgICAgICAgICAgIGpvaW4ub24oaSA9PiBpLmtleSwgJz0nLCBqID0+IGoua2V5KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgbGVmdCBvdXRlciBqb2luIFwidXNlclNldHRpbmdzXCIgYXMgXCJldmlsVHdpblwiIG9uIFwidXNlclNldHRpbmdzXCIuXCJpZFwiID0gXCJldmlsVHdpblwiLlwiaWRcIiBhbmQgXCJ1c2VyU2V0dGluZ3NcIi5cImtleVwiID0gXCJldmlsVHdpblwiLlwia2V5XCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBsZWZ0IG91dGVyIGpvaW4gd2l0aCBmdW5jdGlvbiBhbmQgc2VsZWN0aW9uIG9mIGpvaW5lZCB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAubGVmdE91dGVySm9pblRhYmxlT25GdW5jdGlvbignZXZpbFR3aW4nLCBVc2VyU2V0dGluZywgam9pbiA9PiB7XG4gICAgICAgICAgICAgICAgam9pbi5vbihpID0+IGkuaWQsICc9JywgaiA9PiBqLmlkKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAud2hlcmUoaSA9PiBpLmV2aWxUd2luLnZhbHVlLCAndmFsdWUnKVxuICAgICAgICAgICAgLnNlbGVjdChpID0+IGkuZXZpbFR3aW4ua2V5KTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IFwiZXZpbFR3aW5cIi5cImtleVwiIGFzIFwiZXZpbFR3aW4ua2V5XCIgZnJvbSBcInVzZXJTZXR0aW5nc1wiIGxlZnQgb3V0ZXIgam9pbiBcInVzZXJTZXR0aW5nc1wiIGFzIFwiZXZpbFR3aW5cIiBvbiBcInVzZXJTZXR0aW5nc1wiLlwiaWRcIiA9IFwiZXZpbFR3aW5cIi5cImlkXCIgd2hlcmUgXCJldmlsVHdpblwiLlwidmFsdWVcIiA9IFxcJ3ZhbHVlXFwnJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgZ2V0IG5hbWUgb2YgdGhlIHRhYmxlJywgZG9uZSA9PiB7XG5cbiAgICAgICAgY29uc3QgdGFibGVOYW1lID0gZ2V0VGFibGVOYW1lKFVzZXIpO1xuXG4gICAgICAgIGFzc2VydC5lcXVhbCh0YWJsZU5hbWUsICd1c2VycycpO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgZ2V0IG5hbWUgb2YgdGhlIGNvbHVtbicsIGRvbmUgPT4ge1xuXG4gICAgICAgIGNvbnN0IGNvbHVtbk5hbWUgPSBnZXRDb2x1bW5OYW1lKFVzZXIsICdpZCcpO1xuXG4gICAgICAgIGFzc2VydC5lcXVhbChjb2x1bW5OYW1lLCAnaWQnKTtcblxuICAgICAgICBkb25lKCk7XG5cbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgaW5zZXJ0IGEgc2VsZWN0JywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBrID0ga25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pO1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGspO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpO1xuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICBhd2FpdCBxdWVyeVxuICAgICAgICAgICAgICAgIC5zZWxlY3RSYXcoJ2YnLCBTdHJpbmcsICdcXCdmaXhlZFZhbHVlXFwnJylcbiAgICAgICAgICAgICAgICAuc2VsZWN0KHUgPT4gW3UubmFtZV0pXG4gICAgICAgICAgICAgICAgLmRpc3RpbmN0KClcbiAgICAgICAgICAgICAgICAud2hlcmVOb3ROdWxsKHUgPT4gdS5uYW1lKVxuICAgICAgICAgICAgICAgIC5pbnNlcnRTZWxlY3QoVXNlclNldHRpbmcsIGkgPT4gW2kuaWQsIGkuaW5pdGlhbFZhbHVlXSk7XG4gICAgICAgIH0gY2F0Y2ggKF9lKSB7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICAgICAgcXVlcnkudG9RdWVyeSgpLFxuICAgICAgICAgICAgICAgIGBpbnNlcnQgaW50byBcInVzZXJTZXR0aW5nc1wiIChcInVzZXJTZXR0aW5nc1wiLlwiaWRcIixcInVzZXJTZXR0aW5nc1wiLlwiaW5pdGlhbFZhbHVlXCIpIHNlbGVjdCBkaXN0aW5jdCAoJ2ZpeGVkVmFsdWUnKSBhcyBcImZcIiwgXCJ1c2Vyc1wiLlwibmFtZVwiIGFzIFwibmFtZVwiIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm5hbWVcIiBpcyBub3QgbnVsbGBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggb3JkZXIgYnkgcmF3JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLm9yZGVyQnlSYXcoJ1NVTSg/PykgREVTQycsICd1c2Vycy55ZWFyJyk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIG9yZGVyIGJ5IFNVTShcInVzZXJzXCIuXCJ5ZWFyXCIpIERFU0MnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHdoZXJlIGluIHdpdGggc3VicXVlcnknLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAud2hlcmVFeGlzdHMoVXNlclNldHRpbmcsIChzdWJRdWVyeSwgcGFyZW50Q29sdW1uKSA9PiB7XG4gICAgICAgICAgICAgICAgc3ViUXVlcnkud2hlcmVDb2x1bW4oYyA9PiBjLnVzZXJJZCwgJz0nLCBwYXJlbnRDb2x1bW4uaWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIGV4aXN0cyAoc2VsZWN0ICogZnJvbSBcInVzZXJTZXR0aW5nc1wiIHdoZXJlIFwidXNlclNldHRpbmdzXCIuXCJ1c2VySWRcIiA9IFwidXNlcnNcIi5cImlkXCIpJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIGluc2VydCBxdWVyeScsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICAodHlwZWRLbmV4IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpO1xuXG4gICAgICAgIChxdWVyeSBhcyBhbnkpLm9ubHlMb2dRdWVyeSA9IHRydWU7XG5cbiAgICAgICAgYXdhaXQgcXVlcnkuaW5zZXJ0SXRlbSh7IGlkOiAnbmV3SWQnIH0pO1xuXG5cbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgKHF1ZXJ5IGFzIGFueSkucXVlcnlMb2cudHJpbSgpLFxuICAgICAgICAgICAgYGluc2VydCBpbnRvIFwidXNlcnNcIiAoXCJpZFwiKSB2YWx1ZXMgKCduZXdJZCcpYFxuICAgICAgICApO1xuXG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBpbnNlcnQgcXVlcnkgd2l0aCBjb2x1bW4gbmFtZSBtYXBwaW5nJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS5pbnNlcnRJdGVtKHsgc3RhdHVzOiAnbmV3U3RhdHVzJyB9KTtcblxuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGBpbnNlcnQgaW50byBcInVzZXJzXCIgKFwid2VpcmREYXRhYmFzZU5hbWVcIikgdmFsdWVzICgnbmV3U3RhdHVzJylgXG4gICAgICAgICk7XG5cbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIG11bHRpcGxlIGluc2VydCBxdWVyaWVzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS5pbnNlcnRJdGVtcyhbeyBpZDogJ25ld0lkMScgfSwgeyBpZDogJ25ld0lkMicgfV0pO1xuXG5cbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgKHF1ZXJ5IGFzIGFueSkucXVlcnlMb2cudHJpbSgpLFxuICAgICAgICAgICAgYGluc2VydCBpbnRvIFwidXNlcnNcIiAoXCJpZFwiKSB2YWx1ZXMgKCduZXdJZDEnKSwgKCduZXdJZDInKWBcbiAgICAgICAgKTtcblxuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgbXVsdGlwbGUgaW5zZXJ0IHF1ZXJpZXMgd2l0aCBjb2x1bW4gbmFtZSBtYXBwaW5nJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS5pbnNlcnRJdGVtcyhbeyBzdGF0dXM6ICduZXdTdGF0dXMxJyB9LCB7IHN0YXR1czogJ25ld1N0YXR1czInIH1dKTtcblxuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGBpbnNlcnQgaW50byBcInVzZXJzXCIgKFwid2VpcmREYXRhYmFzZU5hbWVcIikgdmFsdWVzICgnbmV3U3RhdHVzMScpLCAoJ25ld1N0YXR1czInKWBcbiAgICAgICAgKTtcblxuICAgIH0pO1xuXG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSB1cGRhdGUgcXVlcnknLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgKHR5cGVkS25leCBhcyBhbnkpLm9ubHlMb2dRdWVyeSA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKTtcblxuICAgICAgICAocXVlcnkgYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGF3YWl0IHF1ZXJ5LnVwZGF0ZUl0ZW0oeyBpZDogJ25ld0lkJyB9KTtcblxuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGB1cGRhdGUgXCJ1c2Vyc1wiIHNldCBcImlkXCIgPSAnbmV3SWQnYFxuICAgICAgICApO1xuXG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSB1cGRhdGUgcXVlcnkgd2l0aCBjb2x1bW4gbmFtZSBtYXBwaW5nJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS51cGRhdGVJdGVtKHsgc3RhdHVzOiAnbmV3U3RhdHVzJyB9KTtcblxuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGB1cGRhdGUgXCJ1c2Vyc1wiIHNldCBcIndlaXJkRGF0YWJhc2VOYW1lXCIgPSAnbmV3U3RhdHVzJ2BcbiAgICAgICAgKTtcblxuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgdXBkYXRlIHF1ZXJ5IGJ5IGlkJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS51cGRhdGVJdGVtQnlQcmltYXJ5S2V5KCd1c2VySWQnLCB7IG5hbWU6ICduZXdOYW1lJyB9KTtcblxuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGB1cGRhdGUgXCJ1c2Vyc1wiIHNldCBcIm5hbWVcIiA9ICduZXdOYW1lJyB3aGVyZSBcImlkXCIgPSAndXNlcklkJ2BcbiAgICAgICAgKTtcblxuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgdXBkYXRlIHF1ZXJ5IGJ5IGlkIHdpdGggY29sdW1uIG5hbWUgbWFwcGluZycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICAodHlwZWRLbmV4IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpO1xuXG4gICAgICAgIChxdWVyeSBhcyBhbnkpLm9ubHlMb2dRdWVyeSA9IHRydWU7XG5cbiAgICAgICAgYXdhaXQgcXVlcnkudXBkYXRlSXRlbUJ5UHJpbWFyeUtleSgndXNlcklkJywgeyBzdGF0dXM6ICduZXdTdGF0dXMnIH0pO1xuXG5cbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgKHF1ZXJ5IGFzIGFueSkucXVlcnlMb2cudHJpbSgpLFxuICAgICAgICAgICAgYHVwZGF0ZSBcInVzZXJzXCIgc2V0IFwid2VpcmREYXRhYmFzZU5hbWVcIiA9ICduZXdTdGF0dXMnIHdoZXJlIFwiaWRcIiA9ICd1c2VySWQnYFxuICAgICAgICApO1xuXG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIG11bHRpcGxlIHVwZGF0ZSBxdWVyaWVzIGJ5IGlkJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS51cGRhdGVJdGVtc0J5UHJpbWFyeUtleShcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICB7IHByaW1hcnlLZXlWYWx1ZTogJ3VzZXJJZDEnLCBkYXRhOiB7IG5hbWU6ICduZXdOYW1lMScgfSB9LFxuICAgICAgICAgICAgICAgIHsgcHJpbWFyeUtleVZhbHVlOiAndXNlcklkMicsIGRhdGE6IHsgbmFtZTogJ25ld05hbWUyJyB9IH0sXG4gICAgICAgICAgICBdXG4gICAgICAgICk7XG5cblxuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICAocXVlcnkgYXMgYW55KS5xdWVyeUxvZy50cmltKCksXG4gICAgICAgICAgICBgdXBkYXRlIFwidXNlcnNcIiBzZXQgXCJuYW1lXCIgPSAnbmV3TmFtZTEnIHdoZXJlIFwiaWRcIiA9ICd1c2VySWQxJztcXG51cGRhdGUgXCJ1c2Vyc1wiIHNldCBcIm5hbWVcIiA9ICduZXdOYW1lMicgd2hlcmUgXCJpZFwiID0gJ3VzZXJJZDInO2BcbiAgICAgICAgKTtcblxuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgbXVsdGlwbGUgdXBkYXRlIHF1ZXJpZXMgYnkgaWQgd2l0aCBjb2x1bW4gbmFtZSBtYXBwaW5nJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS51cGRhdGVJdGVtc0J5UHJpbWFyeUtleShcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICB7IHByaW1hcnlLZXlWYWx1ZTogJ3VzZXJJZDEnLCBkYXRhOiB7IHN0YXR1czogJ25ld1N0YXR1czEnIH0gfSxcbiAgICAgICAgICAgICAgICB7IHByaW1hcnlLZXlWYWx1ZTogJ3VzZXJJZDInLCBkYXRhOiB7IHN0YXR1czogJ25ld1N0YXR1czInIH0gfSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgKTtcblxuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGB1cGRhdGUgXCJ1c2Vyc1wiIHNldCBcIndlaXJkRGF0YWJhc2VOYW1lXCIgPSAnbmV3U3RhdHVzMScgd2hlcmUgXCJpZFwiID0gJ3VzZXJJZDEnO1xcbnVwZGF0ZSBcInVzZXJzXCIgc2V0IFwid2VpcmREYXRhYmFzZU5hbWVcIiA9ICduZXdTdGF0dXMyJyB3aGVyZSBcImlkXCIgPSAndXNlcklkMic7YFxuICAgICAgICApO1xuXG4gICAgfSk7XG5cblxuXG5cbiAgICAvLyBpdCgnc2hvdWxkIHN0YXkgY29tbWVudGVkIG91dCcsIGFzeW5jIGRvbmUgPT4ge1xuICAgIC8vICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG5cbiAgICAvLyAgICAgLy8gY29uc3QgaXRlbSA9IGF3YWl0IHR5cGVkS25leFxuICAgIC8vICAgICAvLyAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgIC8vICAgICAvLyAgICAgLmluc2VydEl0ZW0oeyBpZDogJzEnLCBrZXk6ICB9KTtcblxuICAgIC8vICAgICBjb25zdCBpdGVtID0gYXdhaXQgdHlwZWRLbmV4XG4gICAgLy8gICAgICAgICAucXVlcnkoVXNlcilcbiAgICAvLyAgICAgICAgIC5zZWxlY3QoaSA9PiBpLmNhdGVnb3J5Lm5hbWUpXG4gICAgLy8gICAgICAgICAub3JkZXJCeShpID0+IGkuYmlydGhEYXRlKVxuICAgIC8vICAgICAgICAgLmdldEZpcnN0KCk7XG5cbiAgICAvLyAgICAgY29uc29sZS5sb2coJ2l0ZW06ICcsIGl0ZW0uY2F0ZWdvcnkubmFtZSk7XG5cbiAgICAvLyAgICAgLy8gaWYgKGl0ZW0gIT09IHVuZGVmaW5lZCkge1xuICAgIC8vICAgICAvLyAgICAgY29uc29sZS5sb2coaXRlbS51c2VyMi5udW1lcmljVmFsdWUpO1xuICAgIC8vICAgICAvLyAgICAgY29uc29sZS5sb2coaXRlbS5vdGhlclVzZXIubmFtZSk7XG4gICAgLy8gICAgIC8vIH1cblxuICAgIC8vICAgICBkb25lKCk7XG4gICAgLy8gfSk7XG59KTtcblxuXG5kZXNjcmliZSgnVHlwZWRLbmV4UXVlcnlCdWlsZGVyIHdpdGggc3RyaW5nIHBhcmFtZXRlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gc2VsZWN0ICogZnJvbSBcInVzZXJzXCInLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leC5xdWVyeShVc2VyKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChxdWVyeVN0cmluZywgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiJyk7XG5cblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBzZWxlY3QgXCJpZFwiIGZyb20gXCJ1c2Vyc1wiJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXgucXVlcnkoVXNlcikuc2VsZWN0KCdpZCcpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHF1ZXJ5U3RyaW5nLCAnc2VsZWN0IFwidXNlcnNcIi5cImlkXCIgYXMgXCJpZFwiIGZyb20gXCJ1c2Vyc1wiJyk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gY2FtZWxDYXNlIGNvcnJlY3RseScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAuc2VsZWN0KCdpbml0aWFsVmFsdWUnKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBcInVzZXJTZXR0aW5nc1wiLlwiaW5pdGlhbFZhbHVlXCIgYXMgXCJpbml0aWFsVmFsdWVcIiBmcm9tIFwidXNlclNldHRpbmdzXCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCB3aGVyZSBvbiBjb2x1bW4gb2Ygb3duIHRhYmxlJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXgucXVlcnkoVXNlcikud2hlcmUoJ25hbWUnLCAndXNlcjEnKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibmFtZVwiID0gXFwndXNlcjFcXCcnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBEYXRlIGNvbHVtbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuc2VsZWN0KCdiaXJ0aERhdGUnKVxuICAgICAgICAgICAgLndoZXJlKCdiaXJ0aERhdGUnLCBuZXcgRGF0ZSgxOTc5LCAwLCAxKSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBcInVzZXJzXCIuXCJiaXJ0aERhdGVcIiBhcyBcImJpcnRoRGF0ZVwiIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cImJpcnRoRGF0ZVwiID0gXFwnMTk3OS0wMS0wMSAwMDowMDowMC4wMDBcXCcnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBhcnJheSBjb2x1bW4nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLnNlbGVjdCgndGFncycpXG4gICAgICAgICAgICAud2hlcmUoJ3RhZ3MnLCBbJ3RhZzEnXSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBcInVzZXJzXCIuXCJ0YWdzXCIgYXMgXCJ0YWdzXCIgZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwidGFnc1wiID0gXFwne1widGFnMVwifVxcJydcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggd2hlcmUgb24gY29sdW1uIG9mIG93biB0YWJsZSB3aXRoIExJS0UnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leC5xdWVyeShVc2VyKS53aGVyZSgnbmFtZScsICdsaWtlJywgJyV1c2VyJScpO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiB3aGVyZSBcInVzZXJzXCIuXCJuYW1lXCIgbGlrZSBcXCcldXNlciVcXCcnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBoYW5kbGUgbnVsbGFibGUgcHJvcGVydGllcycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJDYXRlZ29yeSlcbiAgICAgICAgICAgIC5zZWxlY3QoJ3Bob25lTnVtYmVyJylcbiAgICAgICAgICAgIC53aGVyZSgncGhvbmVOdW1iZXInLCAndXNlcjEnKVxuICAgICAgICAgICAgLnNlbGVjdCgnYmFja3VwUmVnaW9uLmNvZGUnKVxuICAgICAgICAgICAgLnRvUXVlcnkoKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGhhbmRsZSBudWxsYWJsZSBsZXZlbCAyIHByb3BlcnRpZXMnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLnNlbGVjdCgnY2F0ZWdvcnkucGhvbmVOdW1iZXInKVxuICAgICAgICAgICAgLndoZXJlKCdjYXRlZ29yeS5waG9uZU51bWJlcicsICd1c2VyMScpO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuXG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHdoZXJlIG5vdCBvbiBjb2x1bW4gb2Ygb3duIHRhYmxlJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXgucXVlcnkoVXNlcikud2hlcmVOb3QoJ25hbWUnLCAndXNlcjEnKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgbm90IFwidXNlcnNcIi5cIm5hbWVcIiA9IFxcJ3VzZXIxXFwnJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgam9pbiBhIHRhYmxlJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXgucXVlcnkoVXNlclNldHRpbmcpLmlubmVySm9pbkNvbHVtbigndXNlcicpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJTZXR0aW5nc1wiIGlubmVyIGpvaW4gXCJ1c2Vyc1wiIGFzIFwidXNlclwiIG9uIFwidXNlclwiLlwiaWRcIiA9IFwidXNlclNldHRpbmdzXCIuXCJ1c2VySWRcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGpvaW4gYSB0YWJsZSBhbmQgc2VsZWN0IGEgY29sdW1uIG9mIGpvaW5lZCB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAuc2VsZWN0KCd1c2VyLm5hbWUnKVxuICAgICAgICAgICAgLmlubmVySm9pbkNvbHVtbigndXNlcicpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlclwiLlwibmFtZVwiIGFzIFwidXNlci5uYW1lXCIgZnJvbSBcInVzZXJTZXR0aW5nc1wiIGlubmVyIGpvaW4gXCJ1c2Vyc1wiIGFzIFwidXNlclwiIG9uIFwidXNlclwiLlwiaWRcIiA9IFwidXNlclNldHRpbmdzXCIuXCJ1c2VySWRcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGpvaW4gYSB0YWJsZSBhbmQgdXNlIHdoZXJlIG9uIGEgY29sdW1uIG9mIGpvaW5lZCB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAud2hlcmUoJ3VzZXIubmFtZScsICd1c2VyMScpXG4gICAgICAgICAgICAuaW5uZXJKb2luQ29sdW1uKCd1c2VyJyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgaW5uZXIgam9pbiBcInVzZXJzXCIgYXMgXCJ1c2VyXCIgb24gXCJ1c2VyXCIuXCJpZFwiID0gXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXJJZFwiIHdoZXJlIFwidXNlclwiLlwibmFtZVwiID0gXFwndXNlcjFcXCcnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBqb2luIHR3byBsZXZlbCBvZiB0YWJsZXMnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLmlubmVySm9pbkNvbHVtbigndXNlcicpXG4gICAgICAgICAgICAuaW5uZXJKb2luQ29sdW1uKCd1c2VyLmNhdGVnb3J5Jyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgaW5uZXIgam9pbiBcInVzZXJzXCIgYXMgXCJ1c2VyXCIgb24gXCJ1c2VyXCIuXCJpZFwiID0gXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXJJZFwiIGlubmVyIGpvaW4gXCJ1c2VyQ2F0ZWdvcmllc1wiIGFzIFwidXNlcl9jYXRlZ29yeVwiIG9uIFwidXNlcl9jYXRlZ29yeVwiLlwiaWRcIiA9IFwidXNlclwiLlwiY2F0ZWdvcnlJZFwiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgam9pbiB0aHJlZSBsZXZlbCBvZiB0YWJsZXMnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLmlubmVySm9pbkNvbHVtbigndXNlci5jYXRlZ29yeS5yZWdpb24nKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiBpbm5lciBqb2luIFwicmVnaW9uc1wiIGFzIFwidXNlcl9jYXRlZ29yeV9yZWdpb25cIiBvbiBcInVzZXJfY2F0ZWdvcnlfcmVnaW9uXCIuXCJpZFwiID0gXCJ1c2VyX2NhdGVnb3J5XCIuXCJyZWdpb25JZFwiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgam9pbiB0d28gbGV2ZWxzIG9mIHRhYmxlcyBhbmQgc2VsZWN0IGEgY29sdW1uIG9mIHRoZSBsYXN0IGpvaW5lZCB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAuc2VsZWN0KCd1c2VyLmNhdGVnb3J5Lm5hbWUnKVxuICAgICAgICAgICAgLmlubmVySm9pbkNvbHVtbigndXNlci5jYXRlZ29yeScpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlcl9jYXRlZ29yeVwiLlwibmFtZVwiIGFzIFwidXNlci5jYXRlZ29yeS5uYW1lXCIgZnJvbSBcInVzZXJTZXR0aW5nc1wiIGlubmVyIGpvaW4gXCJ1c2VyQ2F0ZWdvcmllc1wiIGFzIFwidXNlcl9jYXRlZ29yeVwiIG9uIFwidXNlcl9jYXRlZ29yeVwiLlwiaWRcIiA9IFwidXNlclwiLlwiY2F0ZWdvcnlJZFwiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgam9pbiB0aHJlZSBsZXZlbHMgb2YgdGFibGVzIGFuZCBzZWxlY3QgYSBjb2x1bW4gb2YgdGhlIGxhc3Qgam9pbmVkIHRhYmxlJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyU2V0dGluZylcbiAgICAgICAgICAgIC5zZWxlY3QoJ3VzZXIuY2F0ZWdvcnkucmVnaW9uLmNvZGUnKVxuICAgICAgICAgICAgLmlubmVySm9pbkNvbHVtbigndXNlci5jYXRlZ29yeS5yZWdpb24nKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBcInVzZXJfY2F0ZWdvcnlfcmVnaW9uXCIuXCJjb2RlXCIgYXMgXCJ1c2VyLmNhdGVnb3J5LnJlZ2lvbi5jb2RlXCIgZnJvbSBcInVzZXJTZXR0aW5nc1wiIGlubmVyIGpvaW4gXCJyZWdpb25zXCIgYXMgXCJ1c2VyX2NhdGVnb3J5X3JlZ2lvblwiIG9uIFwidXNlcl9jYXRlZ29yeV9yZWdpb25cIi5cImlkXCIgPSBcInVzZXJfY2F0ZWdvcnlcIi5cInJlZ2lvbklkXCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBqb2luIHR3byBsZXZlbHMgb2YgdGFibGVzIGFuZCB1c2Ugd2hlcmUgb24gYSBjb2x1bW4gb2YgbGFzdCBqb2luZWQgdGFibGUnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLndoZXJlKCd1c2VyLmNhdGVnb3J5Lm5hbWUnLCAndXNlcjEnKVxuICAgICAgICAgICAgLmlubmVySm9pbkNvbHVtbigndXNlci5jYXRlZ29yeScpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJTZXR0aW5nc1wiIGlubmVyIGpvaW4gXCJ1c2VyQ2F0ZWdvcmllc1wiIGFzIFwidXNlcl9jYXRlZ29yeVwiIG9uIFwidXNlcl9jYXRlZ29yeVwiLlwiaWRcIiA9IFwidXNlclwiLlwiY2F0ZWdvcnlJZFwiIHdoZXJlIFwidXNlcl9jYXRlZ29yeVwiLlwibmFtZVwiID0gXFwndXNlcjFcXCcnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBqb2luIHRocmVlIGxldmVscyBvZiB0YWJsZXMgYW5kIHVzZSB3aGVyZSBvbiBhIGNvbHVtbiBvZiBsYXN0IGpvaW5lZCB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAud2hlcmUoJ3VzZXIuY2F0ZWdvcnkucmVnaW9uLmNvZGUnLCAyKVxuICAgICAgICAgICAgLmlubmVySm9pbkNvbHVtbihjID0+IGMudXNlci5jYXRlZ29yeS5yZWdpb24pO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJTZXR0aW5nc1wiIGlubmVyIGpvaW4gXCJyZWdpb25zXCIgYXMgXCJ1c2VyX2NhdGVnb3J5X3JlZ2lvblwiIG9uIFwidXNlcl9jYXRlZ29yeV9yZWdpb25cIi5cImlkXCIgPSBcInVzZXJfY2F0ZWdvcnlcIi5cInJlZ2lvbklkXCIgd2hlcmUgXCJ1c2VyX2NhdGVnb3J5X3JlZ2lvblwiLlwiY29kZVwiID0gMidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgaW5uZXIgam9pbiB3aXRoIGZ1bmN0aW9uIHdpdGggb3RoZXIgdGFibGUnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLmlubmVySm9pblRhYmxlT25GdW5jdGlvbignb3RoZXJVc2VyJywgVXNlciwgam9pbiA9PiB7XG4gICAgICAgICAgICAgICAgam9pbi5vbignaWQnLCAnPScsICd1c2VyMklkJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJTZXR0aW5nc1wiIGlubmVyIGpvaW4gXCJ1c2Vyc1wiIGFzIFwib3RoZXJVc2VyXCIgb24gXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXIySWRcIiA9IFwib3RoZXJVc2VyXCIuXCJpZFwiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgc2VsZWN0IDIgY29sdW1ucyBhdCBvbmNlJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXgucXVlcnkoVXNlcikuc2VsZWN0KCdpZCcsICduYW1lJyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgXCJ1c2Vyc1wiLlwiaWRcIiBhcyBcImlkXCIsIFwidXNlcnNcIi5cIm5hbWVcIiBhcyBcIm5hbWVcIiBmcm9tIFwidXNlcnNcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHNlbGVjdCAyIGNvbHVtbnMgYXQgb25jZSBmcm9tIHBhcmVudCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAuc2VsZWN0KCd1c2VyLmlkJywgJ3VzZXIubmFtZScpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlclwiLlwiaWRcIiBhcyBcInVzZXIuaWRcIiwgXCJ1c2VyXCIuXCJuYW1lXCIgYXMgXCJ1c2VyLm5hbWVcIiBmcm9tIFwidXNlclNldHRpbmdzXCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBzZWxlY3QgcmF3IHF1ZXJ5JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLnNlbGVjdFJhdygnc3ViUXVlcnknLCBOdW1iZXIsICdzZWxlY3Qgb3RoZXIuaWQgZnJvbSBvdGhlcicpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IChzZWxlY3Qgb3RoZXIuaWQgZnJvbSBvdGhlcikgYXMgXCJzdWJRdWVyeVwiIGZyb20gXCJ1c2Vyc1wiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggQU5EIGluIHdoZXJlIGNsYXVzZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC53aGVyZSgnbmFtZScsICd1c2VyMScpXG4gICAgICAgICAgICAuYW5kV2hlcmUoJ25hbWUnLCAndXNlcjInKVxuICAgICAgICAgICAgLmFuZFdoZXJlKCduYW1lJywgJ2xpa2UnLCAnJXVzZXIlJyk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm5hbWVcIiA9IFxcJ3VzZXIxXFwnIGFuZCBcInVzZXJzXCIuXCJuYW1lXCIgPSBcXCd1c2VyMlxcJyBhbmQgXCJ1c2Vyc1wiLlwibmFtZVwiIGxpa2UgXFwnJXVzZXIlXFwnJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggT1IgaW4gd2hlcmUgY2xhdXNlJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlKCduYW1lJywgJ3VzZXIxJylcbiAgICAgICAgICAgIC5vcldoZXJlKCduYW1lJywgJ3VzZXIyJylcbiAgICAgICAgICAgIC5vcldoZXJlKCduYW1lJywgJ2xpa2UnLCAnJXVzZXIlJyk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm5hbWVcIiA9IFxcJ3VzZXIxXFwnIG9yIFwidXNlcnNcIi5cIm5hbWVcIiA9IFxcJ3VzZXIyXFwnIG9yIFwidXNlcnNcIi5cIm5hbWVcIiBsaWtlIFxcJyV1c2VyJVxcJydcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHdoZXJlIGluJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlSW4oJ25hbWUnLCBbJ3VzZXIxJywgJ3VzZXIyJ10pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiB3aGVyZSBcInVzZXJzXCIuXCJuYW1lXCIgaW4gKFxcJ3VzZXIxXFwnLCBcXCd1c2VyMlxcJyknXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCB3aGVyZSBub3QgaW4nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAud2hlcmVOb3RJbignbmFtZScsIFsndXNlcjEnLCAndXNlcjInXSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm5hbWVcIiBub3QgaW4gKFxcJ3VzZXIxXFwnLCBcXCd1c2VyMlxcJyknXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCB3aGVyZSBiZXR3ZWVuJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlQmV0d2VlbignbnVtZXJpY1ZhbHVlJywgWzEsIDEwXSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiIGJldHdlZW4gMSBhbmQgMTAnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCB3aGVyZSBub3QgYmV0d2VlbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC53aGVyZU5vdEJldHdlZW4oJ251bWVyaWNWYWx1ZScsIFsxLCAxMF0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiB3aGVyZSBcInVzZXJzXCIuXCJudW1lcmljVmFsdWVcIiBub3QgYmV0d2VlbiAxIGFuZCAxMCdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHdoZXJlIGV4aXN0cycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC53aGVyZUV4aXN0cyhVc2VyU2V0dGluZywgKHN1YlF1ZXJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgc3ViUXVlcnkud2hlcmVDb2x1bW4oJ3VzZXJJZCcsICc9JywgJ2lkJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgZXhpc3RzIChzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgd2hlcmUgXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXJJZFwiID0gXCJ1c2Vyc1wiLlwiaWRcIiknXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCB3aGVyZSBleGlzdHMgd2l0aCBjb2x1bW4gbmFtZSBtYXBwaW5nJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlRXhpc3RzKFVzZXJTZXR0aW5nLCAoc3ViUXVlcnkpID0+IHtcbiAgICAgICAgICAgICAgICBzdWJRdWVyeS53aGVyZUNvbHVtbigndXNlci5ub3RVbmRlZmluZWRTdGF0dXMnLCAnPScsICdub3RVbmRlZmluZWRTdGF0dXMnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiB3aGVyZSBleGlzdHMgKHNlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiB3aGVyZSBcInVzZXJcIi5cIndlaXJkRGF0YWJhc2VOYW1lMlwiID0gXCJ1c2Vyc1wiLlwid2VpcmREYXRhYmFzZU5hbWUyXCIpJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggb3Igd2hlcmUgZXhpc3RzJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlKGMgPT4gYy5uYW1lLCAnbmFtZScpXG4gICAgICAgICAgICAub3JXaGVyZUV4aXN0cyhVc2VyU2V0dGluZywgKHN1YlF1ZXJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgc3ViUXVlcnkud2hlcmVDb2x1bW4oJ3VzZXJJZCcsICc9JywgJ2lkJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibmFtZVwiID0gXFwnbmFtZVxcJyBvciBleGlzdHMgKHNlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiB3aGVyZSBcInVzZXJTZXR0aW5nc1wiLlwidXNlcklkXCIgPSBcInVzZXJzXCIuXCJpZFwiKSdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHdoZXJlIG5vdCBleGlzdHMnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAud2hlcmVOb3RFeGlzdHMoVXNlclNldHRpbmcsIChzdWJRdWVyeSkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YlF1ZXJ5LndoZXJlQ29sdW1uKCd1c2VySWQnLCAnPScsICdpZCcpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIG5vdCBleGlzdHMgKHNlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiB3aGVyZSBcInVzZXJTZXR0aW5nc1wiLlwidXNlcklkXCIgPSBcInVzZXJzXCIuXCJpZFwiKSdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIG9yIHdoZXJlIG5vdCBleGlzdHMnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAud2hlcmUoYyA9PiBjLm5hbWUsICduYW1lJylcbiAgICAgICAgICAgIC5vcldoZXJlTm90RXhpc3RzKFVzZXJTZXR0aW5nLCAoc3ViUXVlcnkpID0+IHtcbiAgICAgICAgICAgICAgICBzdWJRdWVyeS53aGVyZUNvbHVtbigndXNlcklkJywgJz0nLCAnaWQnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiB3aGVyZSBcInVzZXJzXCIuXCJuYW1lXCIgPSBcXCduYW1lXFwnIG9yIG5vdCBleGlzdHMgKHNlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiB3aGVyZSBcInVzZXJTZXR0aW5nc1wiLlwidXNlcklkXCIgPSBcInVzZXJzXCIuXCJpZFwiKSdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHdoZXJlIHJhdycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC53aGVyZVJhdygnPz8gPSA/PycsICd1c2Vycy5pZCcsICd1c2Vycy5uYW1lJyk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cImlkXCIgPSBcInVzZXJzXCIuXCJuYW1lXCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBncm91cCBieScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5zZWxlY3QoJ3NvbWVWYWx1ZScpXG4gICAgICAgICAgICAuc2VsZWN0UmF3KCd0b3RhbCcsIE51bWJlciwgJ1NVTShcIm51bWVyaWNWYWx1ZVwiKScpXG4gICAgICAgICAgICAuZ3JvdXBCeSgnc29tZVZhbHVlJyk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBcInVzZXJzXCIuXCJzb21lVmFsdWVcIiBhcyBcInNvbWVWYWx1ZVwiLCAoU1VNKFwibnVtZXJpY1ZhbHVlXCIpKSBhcyBcInRvdGFsXCIgZnJvbSBcInVzZXJzXCIgZ3JvdXAgYnkgXCJ1c2Vyc1wiLlwic29tZVZhbHVlXCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBoYXZpbmcnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuaGF2aW5nKCdudW1lcmljVmFsdWUnLCAnPicsIDEwKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgaGF2aW5nIFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiID4gMTAnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBoYXZpbmcgbnVsbCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLmhhdmluZ051bGwoJ251bWVyaWNWYWx1ZScpO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiBoYXZpbmcgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIgaXMgbnVsbCdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGhhdmluZyBub3QgbnVsbCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLmhhdmluZ05vdE51bGwoJ251bWVyaWNWYWx1ZScpO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiBoYXZpbmcgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIgaXMgbm90IG51bGwnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBoYXZpbmcgaW4nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuaGF2aW5nSW4oJ25hbWUnLCBbJ3VzZXIxJywgJ3VzZXIyJ10pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiBoYXZpbmcgXCJ1c2Vyc1wiLlwibmFtZVwiIGluIChcXCd1c2VyMVxcJywgXFwndXNlcjJcXCcpJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggaGF2aW5nIG5vdCBpbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5oYXZpbmdOb3RJbignbmFtZScsIFsndXNlcjEnLCAndXNlcjInXSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIGhhdmluZyBcInVzZXJzXCIuXCJuYW1lXCIgbm90IGluIChcXCd1c2VyMVxcJywgXFwndXNlcjJcXCcpJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggaGF2aW5nIGV4aXN0cycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5oYXZpbmdFeGlzdHMoVXNlclNldHRpbmcsIChzdWJRdWVyeSkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YlF1ZXJ5LndoZXJlQ29sdW1uKCd1c2VySWQnLCAnPScsICdpZCcpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIGhhdmluZyBleGlzdHMgKHNlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiB3aGVyZSBcInVzZXJTZXR0aW5nc1wiLlwidXNlcklkXCIgPSBcInVzZXJzXCIuXCJpZFwiKSdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGhhdmluZyBub3QgZXhpc3RzJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLmhhdmluZ05vdEV4aXN0cyhVc2VyU2V0dGluZywgKHN1YlF1ZXJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgc3ViUXVlcnkud2hlcmVDb2x1bW4oJ3VzZXJJZCcsICc9JywgJ2lkJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgaGF2aW5nIG5vdCBleGlzdHMgKHNlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiB3aGVyZSBcInVzZXJTZXR0aW5nc1wiLlwidXNlcklkXCIgPSBcInVzZXJzXCIuXCJpZFwiKSdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGhhdmluZyByYXcnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuaGF2aW5nUmF3KCc/PyA9ID8/JywgJ3VzZXJzLmlkJywgJ3VzZXJzLm5hbWUnKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgaGF2aW5nIFwidXNlcnNcIi5cImlkXCIgPSBcInVzZXJzXCIuXCJuYW1lXCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBoYXZpbmcgYmV0d2VlbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5oYXZpbmdCZXR3ZWVuKCdudW1lcmljVmFsdWUnLCBbMSwgMTBdKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgaGF2aW5nIFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiIGJldHdlZW4gMSBhbmQgMTAnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBoYXZpbmcgbm90IGJldHdlZW4nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuaGF2aW5nTm90QmV0d2VlbignbnVtZXJpY1ZhbHVlJywgWzEsIDEwXSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIGhhdmluZyBcInVzZXJzXCIuXCJudW1lcmljVmFsdWVcIiBub3QgYmV0d2VlbiAxIGFuZCAxMCdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGFuIHVuaW9uJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLnNlbGVjdCgnaWQnKVxuICAgICAgICAgICAgLnVuaW9uKFVzZXIsIHN1YlF1ZXJ5ID0+IHtcbiAgICAgICAgICAgICAgICBzdWJRdWVyeS5zZWxlY3QoJ2lkJykud2hlcmUoJ251bWVyaWNWYWx1ZScsIDEyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgXCJ1c2Vyc1wiLlwiaWRcIiBhcyBcImlkXCIgZnJvbSBcInVzZXJzXCIgdW5pb24gc2VsZWN0IFwidXNlcnNcIi5cImlkXCIgYXMgXCJpZFwiIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiID0gMTInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBhbiB1bmlvbiBhbGwnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuc2VsZWN0KCdpZCcpXG4gICAgICAgICAgICAudW5pb25BbGwoVXNlciwgc3ViUXVlcnkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YlF1ZXJ5LnNlbGVjdCgnaWQnKS53aGVyZSgnbnVtZXJpY1ZhbHVlJywgMTIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBcInVzZXJzXCIuXCJpZFwiIGFzIFwiaWRcIiBmcm9tIFwidXNlcnNcIiB1bmlvbiBhbGwgc2VsZWN0IFwidXNlcnNcIi5cImlkXCIgYXMgXCJpZFwiIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiID0gMTInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBtaW4nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAubWluKCdudW1lcmljVmFsdWUnLCAnbWluTnVtZXJpY1ZhbHVlJyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgbWluKFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiKSBhcyBcIm1pbk51bWVyaWNWYWx1ZVwiIGZyb20gXCJ1c2Vyc1wiJ1xuICAgICAgICApO1xuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGNvdW50JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLmNvdW50KCdudW1lcmljVmFsdWUnLCAnY291bnROdW1lcmljVmFsdWUnKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBjb3VudChcInVzZXJzXCIuXCJudW1lcmljVmFsdWVcIikgYXMgXCJjb3VudE51bWVyaWNWYWx1ZVwiIGZyb20gXCJ1c2Vyc1wiJ1xuICAgICAgICApO1xuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIGNvdW50RGlzdGluY3QnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuY291bnREaXN0aW5jdCgnbnVtZXJpY1ZhbHVlJywgJ2NvdW50RGlzdGluY3ROdW1lcmljVmFsdWUnKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBjb3VudChkaXN0aW5jdCBcInVzZXJzXCIuXCJudW1lcmljVmFsdWVcIikgYXMgXCJjb3VudERpc3RpbmN0TnVtZXJpY1ZhbHVlXCIgZnJvbSBcInVzZXJzXCInXG4gICAgICAgICk7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggbWF4JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLm1heCgnbnVtZXJpY1ZhbHVlJywgJ21heE51bWVyaWNWYWx1ZScpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IG1heChcInVzZXJzXCIuXCJudW1lcmljVmFsdWVcIikgYXMgXCJtYXhOdW1lcmljVmFsdWVcIiBmcm9tIFwidXNlcnNcIidcbiAgICAgICAgKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCB0d28gbWF4JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLm1heCgnbnVtZXJpY1ZhbHVlJywgJ21heE51bWVyaWNWYWx1ZScpXG4gICAgICAgICAgICAubWF4KCdzb21lVmFsdWUnLCAnbWF4U29tZVZhbHVlJyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgbWF4KFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiKSBhcyBcIm1heE51bWVyaWNWYWx1ZVwiLCBtYXgoXCJ1c2Vyc1wiLlwic29tZVZhbHVlXCIpIGFzIFwibWF4U29tZVZhbHVlXCIgZnJvbSBcInVzZXJzXCInXG4gICAgICAgICk7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggc3VtJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLnN1bSgnbnVtZXJpY1ZhbHVlJywgJ3N1bU51bWVyaWNWYWx1ZScpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IHN1bShcInVzZXJzXCIuXCJudW1lcmljVmFsdWVcIikgYXMgXCJzdW1OdW1lcmljVmFsdWVcIiBmcm9tIFwidXNlcnNcIidcbiAgICAgICAgKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBzdW1EaXN0aW5jdCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5zdW1EaXN0aW5jdCgnbnVtZXJpY1ZhbHVlJywgJ3N1bURpc3RpbmN0TnVtZXJpY1ZhbHVlJyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3Qgc3VtKGRpc3RpbmN0IFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiKSBhcyBcInN1bURpc3RpbmN0TnVtZXJpY1ZhbHVlXCIgZnJvbSBcInVzZXJzXCInXG4gICAgICAgICk7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggYXZnJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLmF2ZygnbnVtZXJpY1ZhbHVlJywgJ2F2Z051bWVyaWNWYWx1ZScpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IGF2ZyhcInVzZXJzXCIuXCJudW1lcmljVmFsdWVcIikgYXMgXCJhdmdOdW1lcmljVmFsdWVcIiBmcm9tIFwidXNlcnNcIidcbiAgICAgICAgKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBhdmdEaXN0aW5jdCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5hdmdEaXN0aW5jdCgnbnVtZXJpY1ZhbHVlJywgJ2F2Z0Rpc3RpbmN0TnVtZXJpY1ZhbHVlJyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgYXZnKGRpc3RpbmN0IFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiKSBhcyBcImF2Z0Rpc3RpbmN0TnVtZXJpY1ZhbHVlXCIgZnJvbSBcInVzZXJzXCInXG4gICAgICAgICk7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggb3JkZXIgYnknLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leC5xdWVyeShVc2VyKS5vcmRlckJ5KCdpZCcpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgb3JkZXIgYnkgXCJ1c2Vyc1wiLlwiaWRcIiBhc2MnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjbGVhciBzZWxlY3QnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAuc2VsZWN0KCdpZCcpXG4gICAgICAgICAgICAuY2xlYXJTZWxlY3QoKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChxdWVyeVN0cmluZywgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiJyk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjbGVhciB3aGVyZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC53aGVyZSgnbmFtZScsICd1c2VyMScpXG4gICAgICAgICAgICAuY2xlYXJXaGVyZSgpO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwocXVlcnlTdHJpbmcsICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIicpO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY2xlYXIgb3JkZXInLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAub3JkZXJCeSgnaWQnKVxuICAgICAgICAgICAgLmNsZWFyT3JkZXIoKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChxdWVyeVN0cmluZywgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiJyk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBkaXN0aW5jdCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC5zZWxlY3QoJ2lkJylcbiAgICAgICAgICAgIC5kaXN0aW5jdCgpO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0IGRpc3RpbmN0IFwidXNlcnNcIi5cImlkXCIgYXMgXCJpZFwiIGZyb20gXCJ1c2Vyc1wiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY2xvbmUgYW5kIGFkanVzdCBvbmx5IHRoZSBjbG9uZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXgucXVlcnkoVXNlcikuc2VsZWN0KCdpZCcpO1xuXG4gICAgICAgIGNvbnN0IGNsb25lZFF1ZXJ5ID0gcXVlcnkuY2xvbmUoKTtcblxuICAgICAgICBjbG9uZWRRdWVyeS5zZWxlY3QoJ25hbWUnKTtcblxuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeS50b1F1ZXJ5KCksXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlcnNcIi5cImlkXCIgYXMgXCJpZFwiIGZyb20gXCJ1c2Vyc1wiJ1xuICAgICAgICApO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBjbG9uZWRRdWVyeS50b1F1ZXJ5KCksXG4gICAgICAgICAgICAnc2VsZWN0IFwidXNlcnNcIi5cImlkXCIgYXMgXCJpZFwiLCBcInVzZXJzXCIuXCJuYW1lXCIgYXMgXCJuYW1lXCIgZnJvbSBcInVzZXJzXCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBncm91cGJ5IHJhdycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLmdyb3VwQnlSYXcoJ3llYXIgV0lUSCBST0xMVVAnKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgZ3JvdXAgYnkgeWVhciBXSVRIIFJPTExVUCdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIG9yIHdoZXJlIGluJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLndoZXJlSW4oJ25hbWUnLCBbJ3VzZXIxJywgJ3VzZXIyJ10pXG4gICAgICAgICAgICAub3JXaGVyZUluKCduYW1lJywgWyd1c2VyMycsICd1c2VyNCddKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibmFtZVwiIGluIChcXCd1c2VyMVxcJywgXFwndXNlcjJcXCcpIG9yIFwidXNlcnNcIi5cIm5hbWVcIiBpbiAoXFwndXNlcjNcXCcsIFxcJ3VzZXI0XFwnKSdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIG9yIHdoZXJlIG5vdCBpbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC53aGVyZU5vdEluKCduYW1lJywgWyd1c2VyMScsICd1c2VyMiddKVxuICAgICAgICAgICAgLm9yV2hlcmVOb3RJbignbmFtZScsIFsndXNlcjMnLCAndXNlcjQnXSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm5hbWVcIiBub3QgaW4gKFxcJ3VzZXIxXFwnLCBcXCd1c2VyMlxcJykgb3IgXCJ1c2Vyc1wiLlwibmFtZVwiIG5vdCBpbiAoXFwndXNlcjNcXCcsIFxcJ3VzZXI0XFwnKSdcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIG9yIHdoZXJlIGJldHdlZW4nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAud2hlcmVCZXR3ZWVuKCdudW1lcmljVmFsdWUnLCBbMSwgMTBdKVxuICAgICAgICAgICAgLm9yV2hlcmVCZXR3ZWVuKCdudW1lcmljVmFsdWUnLCBbMTAwLCAxMDAwXSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm51bWVyaWNWYWx1ZVwiIGJldHdlZW4gMSBhbmQgMTAgb3IgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIgYmV0d2VlbiAxMDAgYW5kIDEwMDAnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgcXVlcnkgd2l0aCBvciB3aGVyZSBub3QgYmV0d2VlbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgIC53aGVyZU5vdEJldHdlZW4oJ251bWVyaWNWYWx1ZScsIFsxLCAxMF0pXG4gICAgICAgICAgICAub3JXaGVyZU5vdEJldHdlZW4oJ251bWVyaWNWYWx1ZScsIFsxMDAsIDEwMDBdKTtcblxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgcXVlcnlTdHJpbmcsXG4gICAgICAgICAgICAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIgbm90IGJldHdlZW4gMSBhbmQgMTAgb3IgXCJ1c2Vyc1wiLlwibnVtZXJpY1ZhbHVlXCIgbm90IGJldHdlZW4gMTAwIGFuZCAxMDAwJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggcGFyZW50aGVzZXMgaW4gd2hlcmUnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAud2hlcmVQYXJlbnRoZXNlcyhzdWIgPT5cbiAgICAgICAgICAgICAgICBzdWIud2hlcmUoJ2lkJywgJzEnKS5vcldoZXJlKCdpZCcsICcyJylcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5vcldoZXJlKCduYW1lJywgJ1Rlc3RlcicpO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiB3aGVyZSAoXCJ1c2Vyc1wiLlwiaWRcIiA9IFxcJzFcXCcgb3IgXCJ1c2Vyc1wiLlwiaWRcIiA9IFxcJzJcXCcpIG9yIFwidXNlcnNcIi5cIm5hbWVcIiA9IFxcJ1Rlc3RlclxcJydcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBtZXRhZGF0YSBmcm9tIEVudGl0aWVzJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IGVudGl0aWVzID0gZ2V0RW50aXRpZXMoKTtcblxuICAgICAgICBhc3NlcnQuZXF1YWwoZW50aXRpZXMubGVuZ3RoLCA1KTtcbiAgICAgICAgYXNzZXJ0LmV4aXN0cyhlbnRpdGllcy5maW5kKGkgPT4gaS50YWJsZU5hbWUgPT09ICd1c2VycycpKTtcbiAgICAgICAgYXNzZXJ0LmV4aXN0cyhlbnRpdGllcy5maW5kKGkgPT4gaS50YWJsZU5hbWUgPT09ICdjb3JyZWN0VGFibGVOYW1lJykpO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggd2hlcmUgbnVsbCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLndoZXJlTnVsbCgnbmFtZScpLm9yV2hlcmVOdWxsKCduYW1lJyk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm5hbWVcIiBpcyBudWxsIG9yIFwidXNlcnNcIi5cIm5hbWVcIiBpcyBudWxsJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggd2hlcmUgbm90IG51bGwnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leC5xdWVyeShVc2VyKS53aGVyZU5vdE51bGwoJ25hbWUnKS5vcldoZXJlTm90TnVsbCgnbmFtZScpO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiB3aGVyZSBcInVzZXJzXCIuXCJuYW1lXCIgaXMgbm90IG51bGwgb3IgXCJ1c2Vyc1wiLlwibmFtZVwiIGlzIG5vdCBudWxsJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbGVmdCBvdXRlciBqb2luIGEgdGFibGUnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLmxlZnRPdXRlckpvaW5Db2x1bW4oJ3VzZXInKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiBsZWZ0IG91dGVyIGpvaW4gXCJ1c2Vyc1wiIGFzIFwidXNlclwiIG9uIFwidXNlclwiLlwiaWRcIiA9IFwidXNlclNldHRpbmdzXCIuXCJ1c2VySWRcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBjYW1lbENhc2UgY29ycmVjdGx5JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXgucXVlcnkoVXNlclNldHRpbmcpLnNlbGVjdCgnaW5pdGlhbFZhbHVlJyk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgXCJ1c2VyU2V0dGluZ3NcIi5cImluaXRpYWxWYWx1ZVwiIGFzIFwiaW5pdGlhbFZhbHVlXCIgZnJvbSBcInVzZXJTZXR0aW5nc1wiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbGVmdCBvdXRlciBqb2luIHdpdGggZnVuY3Rpb24gd2l0aCBpdHNlbGYnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLmxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24oJ2V2aWxUd2luJywgVXNlclNldHRpbmcsIGpvaW4gPT4ge1xuICAgICAgICAgICAgICAgIGpvaW4ub24oJ2lkJywgJz0nLCAnaWQnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgbGVmdCBvdXRlciBqb2luIFwidXNlclNldHRpbmdzXCIgYXMgXCJldmlsVHdpblwiIG9uIFwidXNlclNldHRpbmdzXCIuXCJpZFwiID0gXCJldmlsVHdpblwiLlwiaWRcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGxlZnQgb3V0ZXIgam9pbiB3aXRoIGZ1bmN0aW9uIHdpdGggb3RoZXIgdGFibGUnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLmxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24oJ290aGVyVXNlcicsIFVzZXIsIGpvaW4gPT4ge1xuICAgICAgICAgICAgICAgIGpvaW4ub24oJ2lkJywgJz0nLCAndXNlcjJJZCcpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiBsZWZ0IG91dGVyIGpvaW4gXCJ1c2Vyc1wiIGFzIFwib3RoZXJVc2VyXCIgb24gXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXIySWRcIiA9IFwib3RoZXJVc2VyXCIuXCJpZFwiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbGVmdCBvdXRlciBqb2luIHdpdGggZnVuY3Rpb24gd2l0aCBvdGhlciB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAubGVmdE91dGVySm9pblRhYmxlT25GdW5jdGlvbignb3RoZXJVc2VyJywgVXNlciwgam9pbiA9PiB7XG4gICAgICAgICAgICAgICAgam9pblxuICAgICAgICAgICAgICAgICAgICAub24oJ2lkJywgJz0nLCAndXNlcjJJZCcpXG4gICAgICAgICAgICAgICAgICAgIC5vbk51bGwoJ25hbWUnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgbGVmdCBvdXRlciBqb2luIFwidXNlcnNcIiBhcyBcIm90aGVyVXNlclwiIG9uIFwidXNlclNldHRpbmdzXCIuXCJ1c2VyMklkXCIgPSBcIm90aGVyVXNlclwiLlwiaWRcIiBhbmQgXCJvdGhlclVzZXJcIi5cIm5hbWVcIiBpcyBudWxsJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbGVmdCBvdXRlciBqb2luIHdpdGggZnVuY3Rpb24gd2l0aCBvdGhlciB0YWJsZSB3aXRoIG9uIGFuZCBvbiBvciBvbicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAubGVmdE91dGVySm9pblRhYmxlT25GdW5jdGlvbignb3RoZXJVc2VyJywgVXNlciwgam9pbiA9PiB7XG4gICAgICAgICAgICAgICAgam9pblxuICAgICAgICAgICAgICAgICAgICAub24oJ2lkJywgJz0nLCAndXNlcjJJZCcpXG4gICAgICAgICAgICAgICAgICAgIC5hbmRPbignbmFtZScsICc9JywgJ3VzZXIySWQnKVxuICAgICAgICAgICAgICAgICAgICAub3JPbignc29tZVZhbHVlJywgJz0nLCAndXNlcjJJZCcpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiBsZWZ0IG91dGVyIGpvaW4gXCJ1c2Vyc1wiIGFzIFwib3RoZXJVc2VyXCIgb24gXCJ1c2VyU2V0dGluZ3NcIi5cInVzZXIySWRcIiA9IFwib3RoZXJVc2VyXCIuXCJpZFwiIGFuZCBcInVzZXJTZXR0aW5nc1wiLlwidXNlcjJJZFwiID0gXCJvdGhlclVzZXJcIi5cIm5hbWVcIiBvciBcInVzZXJTZXR0aW5nc1wiLlwidXNlcjJJZFwiID0gXCJvdGhlclVzZXJcIi5cInNvbWVWYWx1ZVwiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuXG4gICAgaXQoJ3Nob3VsZCBsZWZ0IG91dGVyIGpvaW4gd2l0aCBmdW5jdGlvbiB3aXRoIG90aGVyIHRhYmxlIHdpdGggb25WYWwnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLmxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24oJ290aGVyVXNlcicsIFVzZXIsIGpvaW4gPT4ge1xuICAgICAgICAgICAgICAgIGpvaW5cbiAgICAgICAgICAgICAgICAgICAgLm9uVmFsKCduYW1lJywgJz0nLCAnMScpXG4gICAgICAgICAgICAgICAgICAgIC5hbmRPblZhbCgnbmFtZScsICc9JywgJzInKVxuICAgICAgICAgICAgICAgICAgICAub3JPblZhbCgnbmFtZScsICc9JywgJzMnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgbGVmdCBvdXRlciBqb2luIFwidXNlcnNcIiBhcyBcIm90aGVyVXNlclwiIG9uIFwib3RoZXJVc2VyXCIuXCJuYW1lXCIgPSBcXCcxXFwnIGFuZCBcIm90aGVyVXNlclwiLlwibmFtZVwiID0gXFwnMlxcJyBvciBcIm90aGVyVXNlclwiLlwibmFtZVwiID0gXFwnM1xcJydcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgYmUgYWJsZSB0byB1c2Ugam9pbmVkIGNvbHVtbiBpbiBhbm90aGVyIGxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLmxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24oJ2V2aWxUd2luJywgVXNlclNldHRpbmcsIGpvaW4gPT4ge1xuICAgICAgICAgICAgICAgIGpvaW4ub24oaSA9PiBpLmlkLCAnPScsIGogPT4gai5pZCk7XG4gICAgICAgICAgICB9KS5sZWZ0T3V0ZXJKb2luVGFibGVPbkZ1bmN0aW9uKCdldmlsVHdpbjInLCBVc2VyU2V0dGluZywgam9pbiA9PiB7XG4gICAgICAgICAgICAgICAgam9pbi5vbihpID0+IGkuaWQsICc9JywgaiA9PiBqLmV2aWxUd2luLmlkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgbGVmdCBvdXRlciBqb2luIFwidXNlclNldHRpbmdzXCIgYXMgXCJldmlsVHdpblwiIG9uIFwidXNlclNldHRpbmdzXCIuXCJpZFwiID0gXCJldmlsVHdpblwiLlwiaWRcIiBsZWZ0IG91dGVyIGpvaW4gXCJ1c2VyU2V0dGluZ3NcIiBhcyBcImV2aWxUd2luMlwiIG9uIFwiZXZpbFR3aW5cIi5cImlkXCIgPSBcImV2aWxUd2luMlwiLlwiaWRcIidcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHNlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXgucXVlcnkoVXNlcikubGltaXQoMTApO1xuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHF1ZXJ5LnRvUXVlcnkoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHF1ZXJ5U3RyaW5nLCAnc2VsZWN0ICogZnJvbSBcInVzZXJzXCIgbGltaXQgMTAnKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBzZWxlY3QgKiBmcm9tIFwidXNlcnNcIicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpLm9mZnNldCgxMCk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwocXVlcnlTdHJpbmcsICdzZWxlY3QgKiBmcm9tIFwidXNlcnNcIiBvZmZzZXQgMTAnKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBzZWxlY3QgKiBmcm9tIFwidXNlcnNcIicsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4LnF1ZXJ5KFVzZXIpO1xuICAgICAgICBxdWVyeS51c2VLbmV4UXVlcnlCdWlsZGVyKHF1ZXJ5QnVpbGRlciA9PlxuICAgICAgICAgICAgcXVlcnlCdWlsZGVyLndoZXJlKCdzb21ldGhpbmdlbHNlJywgJ3ZhbHVlJylcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwic29tZXRoaW5nZWxzZVwiID0gXFwndmFsdWVcXCcnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZW1vdmVOdWxsT2JqZWN0cycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICBpZDogJ2lkJyxcbiAgICAgICAgICAgICdlbGVtZW50LmlkJzogbnVsbCxcbiAgICAgICAgICAgICdlbGVtZW50LmNhdGVnb3J5LmlkJzogbnVsbCxcbiAgICAgICAgICAgICd1bml0LmNhdGVnb3J5LmlkJzogbnVsbCxcbiAgICAgICAgICAgICdjYXRlZ29yeS5uYW1lJzogJ2NhdCBuYW1lJyxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZmxhdHRlbmVkID0gdW5mbGF0dGVuKFtyZXN1bHRdKTtcbiAgICAgICAgYXNzZXJ0LmlzTnVsbChmbGF0dGVuZWRbMF0uZWxlbWVudC5pZCk7XG4gICAgICAgIGFzc2VydC5pc051bGwoZmxhdHRlbmVkWzBdLnVuaXQuY2F0ZWdvcnkuaWQpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoZmxhdHRlbmVkWzBdLmNhdGVnb3J5Lm5hbWUsICdjYXQgbmFtZScpO1xuICAgICAgICBjb25zdCBudWxsZWQgPSBzZXRUb051bGwoZmxhdHRlbmVkKTtcbiAgICAgICAgYXNzZXJ0LmlzTnVsbChudWxsZWRbMF0uZWxlbWVudCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChudWxsZWRbMF0uY2F0ZWdvcnkubmFtZSwgJ2NhdCBuYW1lJyk7XG4gICAgICAgIGFzc2VydC5pc051bGwobnVsbGVkWzBdLnVuaXQpO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHN1YiBxdWVyeSBpbiBzZWxlY3QnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJDYXRlZ29yeSlcbiAgICAgICAgICAgIC5zZWxlY3QoJ2lkJylcbiAgICAgICAgICAgIC5zZWxlY3RRdWVyeSgndG90YWwnLCBOdW1iZXIsIFVzZXIsIChzdWJRdWVyeSkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YlF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgIC5jb3VudCgnaWQnLCAndG90YWwnKVxuICAgICAgICAgICAgICAgICAgICAud2hlcmVDb2x1bW4oJ2NhdGVnb3J5SWQnLCAnPScsICdpZCcpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBcInVzZXJDYXRlZ29yaWVzXCIuXCJpZFwiIGFzIFwiaWRcIiwgKHNlbGVjdCBjb3VudChcInVzZXJzXCIuXCJpZFwiKSBhcyBcInRvdGFsXCIgZnJvbSBcInVzZXJzXCIgd2hlcmUgXCJ1c2Vyc1wiLlwiY2F0ZWdvcnlJZFwiID0gXCJ1c2VyQ2F0ZWdvcmllc1wiLlwiaWRcIikgYXMgXCJ0b3RhbFwiIGZyb20gXCJ1c2VyQ2F0ZWdvcmllc1wiJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbGVmdCBvdXRlciBqb2luIHdpdGggZnVuY3Rpb24gd2l0aCBhbmQgaW4gb24nLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgLmxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24oJ2V2aWxUd2luJywgVXNlclNldHRpbmcsIGpvaW4gPT4ge1xuICAgICAgICAgICAgICAgIGpvaW4ub24oJ2lkJywgJz0nLCAnaWQnKTtcbiAgICAgICAgICAgICAgICBqb2luLm9uKCdrZXknLCAnPScsICdrZXknKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkudG9RdWVyeSgpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICBxdWVyeVN0cmluZyxcbiAgICAgICAgICAgICdzZWxlY3QgKiBmcm9tIFwidXNlclNldHRpbmdzXCIgbGVmdCBvdXRlciBqb2luIFwidXNlclNldHRpbmdzXCIgYXMgXCJldmlsVHdpblwiIG9uIFwidXNlclNldHRpbmdzXCIuXCJpZFwiID0gXCJldmlsVHdpblwiLlwiaWRcIiBhbmQgXCJ1c2VyU2V0dGluZ3NcIi5cImtleVwiID0gXCJldmlsVHdpblwiLlwia2V5XCInXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBsZWZ0IG91dGVyIGpvaW4gd2l0aCBmdW5jdGlvbiBhbmQgc2VsZWN0aW9uIG9mIGpvaW5lZCB0YWJsZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAubGVmdE91dGVySm9pblRhYmxlT25GdW5jdGlvbignZXZpbFR3aW4nLCBVc2VyU2V0dGluZywgam9pbiA9PiB7XG4gICAgICAgICAgICAgICAgam9pbi5vbignaWQnLCAnPScsICdpZCcpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC53aGVyZSgnZXZpbFR3aW4udmFsdWUnLCAndmFsdWUnKVxuICAgICAgICAgICAgLnNlbGVjdCgnZXZpbFR3aW4ua2V5Jyk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCBcImV2aWxUd2luXCIuXCJrZXlcIiBhcyBcImV2aWxUd2luLmtleVwiIGZyb20gXCJ1c2VyU2V0dGluZ3NcIiBsZWZ0IG91dGVyIGpvaW4gXCJ1c2VyU2V0dGluZ3NcIiBhcyBcImV2aWxUd2luXCIgb24gXCJ1c2VyU2V0dGluZ3NcIi5cImlkXCIgPSBcImV2aWxUd2luXCIuXCJpZFwiIHdoZXJlIFwiZXZpbFR3aW5cIi5cInZhbHVlXCIgPSBcXCd2YWx1ZVxcJydcbiAgICAgICAgKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGdldCBuYW1lIG9mIHRoZSB0YWJsZScsIGRvbmUgPT4ge1xuXG4gICAgICAgIGNvbnN0IHRhYmxlTmFtZSA9IGdldFRhYmxlTmFtZShVc2VyKTtcblxuICAgICAgICBhc3NlcnQuZXF1YWwodGFibGVOYW1lLCAndXNlcnMnKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGdldCBuYW1lIG9mIHRoZSBjb2x1bW4nLCBkb25lID0+IHtcblxuICAgICAgICBjb25zdCBjb2x1bW5OYW1lID0gZ2V0Q29sdW1uTmFtZShVc2VyLCAnaWQnKTtcblxuICAgICAgICBhc3NlcnQuZXF1YWwoY29sdW1uTmFtZSwgJ2lkJyk7XG5cbiAgICAgICAgZG9uZSgpO1xuXG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGluc2VydCBhIHNlbGVjdCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgayA9IGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KTtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKTtcbiAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgYXdhaXQgcXVlcnlcbiAgICAgICAgICAgICAgICAuc2VsZWN0UmF3KCdmJywgU3RyaW5nLCAnXFwnZml4ZWRWYWx1ZVxcJycpXG4gICAgICAgICAgICAgICAgLnNlbGVjdCgnbmFtZScpXG4gICAgICAgICAgICAgICAgLmRpc3RpbmN0KClcbiAgICAgICAgICAgICAgICAud2hlcmVOb3ROdWxsKCduYW1lJylcbiAgICAgICAgICAgICAgICAuaW5zZXJ0U2VsZWN0KFVzZXJTZXR0aW5nLCAnaWQnLCAnaW5pdGlhbFZhbHVlJyk7XG4gICAgICAgIH0gY2F0Y2ggKF9lKSB7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICAgICAgcXVlcnkudG9RdWVyeSgpLFxuICAgICAgICAgICAgICAgIGBpbnNlcnQgaW50byBcInVzZXJTZXR0aW5nc1wiIChcInVzZXJTZXR0aW5nc1wiLlwiaWRcIixcInVzZXJTZXR0aW5nc1wiLlwiaW5pdGlhbFZhbHVlXCIpIHNlbGVjdCBkaXN0aW5jdCAoJ2ZpeGVkVmFsdWUnKSBhcyBcImZcIiwgXCJ1c2Vyc1wiLlwibmFtZVwiIGFzIFwibmFtZVwiIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIFwidXNlcnNcIi5cIm5hbWVcIiBpcyBub3QgbnVsbGBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHF1ZXJ5IHdpdGggb3JkZXIgYnkgcmF3JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgLm9yZGVyQnlSYXcoJ1NVTSg/PykgREVTQycsICd1c2Vycy55ZWFyJyk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIG9yZGVyIGJ5IFNVTShcInVzZXJzXCIuXCJ5ZWFyXCIpIERFU0MnXG4gICAgICAgICk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBxdWVyeSB3aXRoIHdoZXJlIGluIHdpdGggc3VicXVlcnknLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAud2hlcmVFeGlzdHMoVXNlclNldHRpbmcsIChzdWJRdWVyeSkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YlF1ZXJ5LndoZXJlQ29sdW1uKCd1c2VySWQnLCAnPScsICdpZCcpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeS50b1F1ZXJ5KCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgJ3NlbGVjdCAqIGZyb20gXCJ1c2Vyc1wiIHdoZXJlIGV4aXN0cyAoc2VsZWN0ICogZnJvbSBcInVzZXJTZXR0aW5nc1wiIHdoZXJlIFwidXNlclNldHRpbmdzXCIuXCJ1c2VySWRcIiA9IFwidXNlcnNcIi5cImlkXCIpJ1xuICAgICAgICApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIGluc2VydCBxdWVyeScsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICAodHlwZWRLbmV4IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpO1xuXG4gICAgICAgIChxdWVyeSBhcyBhbnkpLm9ubHlMb2dRdWVyeSA9IHRydWU7XG5cbiAgICAgICAgYXdhaXQgcXVlcnkuaW5zZXJ0SXRlbSh7IGlkOiAnbmV3SWQnIH0pO1xuXG5cbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgKHF1ZXJ5IGFzIGFueSkucXVlcnlMb2cudHJpbSgpLFxuICAgICAgICAgICAgYGluc2VydCBpbnRvIFwidXNlcnNcIiAoXCJpZFwiKSB2YWx1ZXMgKCduZXdJZCcpYFxuICAgICAgICApO1xuXG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBpbnNlcnQgcXVlcnkgd2l0aCBjb2x1bW4gbmFtZSBtYXBwaW5nJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS5pbnNlcnRJdGVtKHsgc3RhdHVzOiAnbmV3U3RhdHVzJyB9KTtcblxuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGBpbnNlcnQgaW50byBcInVzZXJzXCIgKFwid2VpcmREYXRhYmFzZU5hbWVcIikgdmFsdWVzICgnbmV3U3RhdHVzJylgXG4gICAgICAgICk7XG5cbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIG11bHRpcGxlIGluc2VydCBxdWVyaWVzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS5pbnNlcnRJdGVtcyhbeyBpZDogJ25ld0lkMScgfSwgeyBpZDogJ25ld0lkMicgfV0pO1xuXG5cbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgKHF1ZXJ5IGFzIGFueSkucXVlcnlMb2cudHJpbSgpLFxuICAgICAgICAgICAgYGluc2VydCBpbnRvIFwidXNlcnNcIiAoXCJpZFwiKSB2YWx1ZXMgKCduZXdJZDEnKSwgKCduZXdJZDInKWBcbiAgICAgICAgKTtcblxuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgbXVsdGlwbGUgaW5zZXJ0IHF1ZXJpZXMgd2l0aCBjb2x1bW4gbmFtZSBtYXBwaW5nJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS5pbnNlcnRJdGVtcyhbeyBzdGF0dXM6ICduZXdTdGF0dXMxJyB9LCB7IHN0YXR1czogJ25ld1N0YXR1czInIH1dKTtcblxuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGBpbnNlcnQgaW50byBcInVzZXJzXCIgKFwid2VpcmREYXRhYmFzZU5hbWVcIikgdmFsdWVzICgnbmV3U3RhdHVzMScpLCAoJ25ld1N0YXR1czInKWBcbiAgICAgICAgKTtcblxuICAgIH0pO1xuXG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSB1cGRhdGUgcXVlcnknLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgKHR5cGVkS25leCBhcyBhbnkpLm9ubHlMb2dRdWVyeSA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKTtcblxuICAgICAgICAocXVlcnkgYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGF3YWl0IHF1ZXJ5LnVwZGF0ZUl0ZW0oeyBpZDogJ25ld0lkJyB9KTtcblxuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGB1cGRhdGUgXCJ1c2Vyc1wiIHNldCBcImlkXCIgPSAnbmV3SWQnYFxuICAgICAgICApO1xuXG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSB1cGRhdGUgcXVlcnkgd2l0aCBjb2x1bW4gbmFtZSBtYXBwaW5nJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS51cGRhdGVJdGVtKHsgc3RhdHVzOiAnbmV3U3RhdHVzJyB9KTtcblxuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGB1cGRhdGUgXCJ1c2Vyc1wiIHNldCBcIndlaXJkRGF0YWJhc2VOYW1lXCIgPSAnbmV3U3RhdHVzJ2BcbiAgICAgICAgKTtcblxuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgdXBkYXRlIHF1ZXJ5IGJ5IGlkJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS51cGRhdGVJdGVtQnlQcmltYXJ5S2V5KCd1c2VySWQnLCB7IG5hbWU6ICduZXdOYW1lJyB9KTtcblxuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGB1cGRhdGUgXCJ1c2Vyc1wiIHNldCBcIm5hbWVcIiA9ICduZXdOYW1lJyB3aGVyZSBcImlkXCIgPSAndXNlcklkJ2BcbiAgICAgICAgKTtcblxuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgdXBkYXRlIHF1ZXJ5IGJ5IGlkIHdpdGggY29sdW1uIG5hbWUgbWFwcGluZycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICAodHlwZWRLbmV4IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpO1xuXG4gICAgICAgIChxdWVyeSBhcyBhbnkpLm9ubHlMb2dRdWVyeSA9IHRydWU7XG5cbiAgICAgICAgYXdhaXQgcXVlcnkudXBkYXRlSXRlbUJ5UHJpbWFyeUtleSgndXNlcklkJywgeyBzdGF0dXM6ICduZXdTdGF0dXMnIH0pO1xuXG5cbiAgICAgICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgICAgICAgKHF1ZXJ5IGFzIGFueSkucXVlcnlMb2cudHJpbSgpLFxuICAgICAgICAgICAgYHVwZGF0ZSBcInVzZXJzXCIgc2V0IFwid2VpcmREYXRhYmFzZU5hbWVcIiA9ICduZXdTdGF0dXMnIHdoZXJlIFwiaWRcIiA9ICd1c2VySWQnYFxuICAgICAgICApO1xuXG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIG11bHRpcGxlIHVwZGF0ZSBxdWVyaWVzIGJ5IGlkJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS51cGRhdGVJdGVtc0J5UHJpbWFyeUtleShcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICB7IHByaW1hcnlLZXlWYWx1ZTogJ3VzZXJJZDEnLCBkYXRhOiB7IG5hbWU6ICduZXdOYW1lMScgfSB9LFxuICAgICAgICAgICAgICAgIHsgcHJpbWFyeUtleVZhbHVlOiAndXNlcklkMicsIGRhdGE6IHsgbmFtZTogJ25ld05hbWUyJyB9IH0sXG4gICAgICAgICAgICBdXG4gICAgICAgICk7XG5cblxuICAgICAgICBhc3NlcnQuZXF1YWwoXG4gICAgICAgICAgICAocXVlcnkgYXMgYW55KS5xdWVyeUxvZy50cmltKCksXG4gICAgICAgICAgICBgdXBkYXRlIFwidXNlcnNcIiBzZXQgXCJuYW1lXCIgPSAnbmV3TmFtZTEnIHdoZXJlIFwiaWRcIiA9ICd1c2VySWQxJztcXG51cGRhdGUgXCJ1c2Vyc1wiIHNldCBcIm5hbWVcIiA9ICduZXdOYW1lMicgd2hlcmUgXCJpZFwiID0gJ3VzZXJJZDInO2BcbiAgICAgICAgKTtcblxuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgbXVsdGlwbGUgdXBkYXRlIHF1ZXJpZXMgYnkgaWQgd2l0aCBjb2x1bW4gbmFtZSBtYXBwaW5nJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICh0eXBlZEtuZXggYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAucXVlcnkoVXNlcik7XG5cbiAgICAgICAgKHF1ZXJ5IGFzIGFueSkub25seUxvZ1F1ZXJ5ID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCBxdWVyeS51cGRhdGVJdGVtc0J5UHJpbWFyeUtleShcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICB7IHByaW1hcnlLZXlWYWx1ZTogJ3VzZXJJZDEnLCBkYXRhOiB7IHN0YXR1czogJ25ld1N0YXR1czEnIH0gfSxcbiAgICAgICAgICAgICAgICB7IHByaW1hcnlLZXlWYWx1ZTogJ3VzZXJJZDInLCBkYXRhOiB7IHN0YXR1czogJ25ld1N0YXR1czInIH0gfSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgKTtcblxuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGB1cGRhdGUgXCJ1c2Vyc1wiIHNldCBcIndlaXJkRGF0YWJhc2VOYW1lXCIgPSAnbmV3U3RhdHVzMScgd2hlcmUgXCJpZFwiID0gJ3VzZXJJZDEnO1xcbnVwZGF0ZSBcInVzZXJzXCIgc2V0IFwid2VpcmREYXRhYmFzZU5hbWVcIiA9ICduZXdTdGF0dXMyJyB3aGVyZSBcImlkXCIgPSAndXNlcklkMic7YFxuICAgICAgICApO1xuICAgIH0pO1xuXG5cblxuICAgIGl0KCdzaG91bGQgY3JlYXRlIGZpbmRCeVByaW1hcnlLZXkgcXVlcnknLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgKHR5cGVkS25leCBhcyBhbnkpLm9ubHlMb2dRdWVyeSA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgIC5xdWVyeShVc2VyKTtcblxuICAgICAgICAocXVlcnkgYXMgYW55KS5vbmx5TG9nUXVlcnkgPSB0cnVlO1xuXG4gICAgICAgIGF3YWl0IHF1ZXJ5LmZpbmRCeVByaW1hcnlLZXkoJzEnLCAnaWQnLCAnbmFtZScpO1xuXG4gICAgICAgIGFzc2VydC5lcXVhbChcbiAgICAgICAgICAgIChxdWVyeSBhcyBhbnkpLnF1ZXJ5TG9nLnRyaW0oKSxcbiAgICAgICAgICAgIGBzZWxlY3QgXCJ1c2Vyc1wiLlwiaWRcIiBhcyBcImlkXCIsIFwidXNlcnNcIi5cIm5hbWVcIiBhcyBcIm5hbWVcIiBmcm9tIFwidXNlcnNcIiB3aGVyZSBcImlkXCIgPSAnMSdgXG4gICAgICAgICk7XG4gICAgfSk7XG5cbn0pO1xuIl19