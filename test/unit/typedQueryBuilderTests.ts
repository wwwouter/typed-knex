import { assert } from 'chai';
import * as knex from 'knex';
import { getEntities } from '../../src';
import { TypedKnex } from '../../src/typedKnex';
import { User, UserSetting } from '../testEntities';

describe('TypedKnexQueryBuilder', () => {
    it('should return select * from "users"', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(User);
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users"');

        done();
    });

    it('should return select "id" from "users"', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(User).select([c => c.id]);
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "users"."id" as "id" from "users"');

        done();
    });

    it('should return camelCase correctly', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .select([c => c.initialValue]);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "userSettings"."initialValue" as "initialValue" from "userSettings"'
        );

        done();
    });

    it('should create query with where on column of own table', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(User).where(c => c.name, 'user1');

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."name" = \'user1\''
        );

        done();
    });

    it('should create query with where not on column of own table', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(User).whereNot(c => c.name, 'user1');

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where not "users"."name" = \'user1\''
        );

        done();
    });

    it('should join a table', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(UserSetting).innerJoinColumn(c => c.user);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId"'
        );

        done();
    });

    it('should join a table and select a column of joined table', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .select([c => c.user.name])
            .innerJoinColumn(c => c.user);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "user"."name" as "user.name" from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId"'
        );

        done();
    });

    it('should join a table and use where on a column of joined table', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .where(c => c.user.name, 'user1')
            .innerJoinColumn(c => c.user);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId" where "user"."name" = \'user1\''
        );

        done();
    });

    it('should join two level of tables', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .innerJoinColumn(c => c.user)
            .innerJoinColumn(c => c.user.category);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId"'
        );

        done();
    });

    it('should join three level of tables', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .innerJoinColumn(c => c.user.category.region);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId"'
        );

        done();
    });

    it('should join two levels of tables and select a column of the last joined table', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .select([c => c.user.category.name])
            .innerJoinColumn(c => c.user.category);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "user_category"."name" as "user.category.name" from "userSettings" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId"'
        );

        done();
    });

    it('should join three levels of tables and select a column of the last joined table', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .select([c => c.user.category.region.code])
            .innerJoinColumn(c => c.user.category.region);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "user_category_region"."code" as "user.category.region.code" from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId"'
        );

        done();
    });

    it('should join two levels of tables and use where on a column of last joined table', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .where(c => c.user.category.name, 'user1')
            .innerJoinColumn(c => c.user.category);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "userSettings" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId" where "user_category"."name" = \'user1\''
        );

        done();
    });

    it('should join three levels of tables and use where on a column of last joined table', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .where(c => c.user.category.region.code, 2)
            .innerJoinColumn(c => c.user.category.region);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId" where "user_category_region"."code" = 2'
        );

        done();
    });

    it('should select 2 columns at once', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(User).select([c => c.id, c => c.name]);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "users"."id" as "id", "users"."name" as "name" from "users"'
        );

        done();
    });

    it('should select 2 columns at once from parent', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .select([c => c.user.id, c => c.user.name]);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "user"."id" as "user.id", "user"."name" as "user.name" from "userSettings"'
        );

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
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            // .query(User)
            .query(UserSetting)
            // .selectColumnWithArrays('category', 'name');
            // .select(['category2', 'regionId')];
            .select([c => c.user.category.regionId]);
        // .select(['user2s', 'category')];
        // .select(['name')];
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "user_category"."regionId" as "user.category.regionId" from "userSettings"'
        );

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
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .selectRaw('subQuery', Number, 'select other.id from other');
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select (select other.id from other) as "subQuery" from "users"'
        );

        // const i = await query.firstItem();
        // console.log(i.name);
        // console.log(i.subQuery === true);
        // console.log(i.subQuery === 'true');
        // console.log(i.subQueryd);

        done();
    });

    it('should create query with AND in where clause', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .where(c => c.name, 'user1')
            .andWhere(c => c.name, 'user2');

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."name" = \'user1\' and "users"."name" = \'user2\''
        );

        done();
    });

    it('should create query with OR in where clause', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .where(c => c.name, 'user1')
            .orWhere(c => c.name, 'user2');

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."name" = \'user1\' or "users"."name" = \'user2\''
        );

        done();
    });

    it('should create query with where in', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereIn(c => c.name, ['user1', 'user2']);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."name" in (\'user1\', \'user2\')'
        );

        done();
    });

    it('should create query with where not in', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereNotIn(c => c.name, ['user1', 'user2']);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."name" not in (\'user1\', \'user2\')'
        );

        done();
    });

    it('should create query with where between', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereBetween(c => c.numericValue, [1, 10]);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."numericValue" between 1 and 10'
        );

        done();
    });

    it('should create query with where not between', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereNotBetween(c => c.numericValue, [1, 10]);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."numericValue" not between 1 and 10'
        );

        done();
    });

    it('should create query with where exists', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereExists(UserSetting, (subQuery, parentColumn) => {
                subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
            });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")'
        );

        done();
    });

    it('should create query with or where exists', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .where(c => c.name, 'name')
            .orWhereExists(UserSetting, (subQuery, parentColumn) => {
                subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
            });
        // .orWhereExists(UserSetting, (subQuery, parentColumn) => {
        //     subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
        // });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."name" = \'name\' or exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")'
        );

        done();
    });

    it('should create query with where not exists', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereNotExists(UserSetting, (subQuery, parentColumn) => {
                subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
            });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where not exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")'
        );

        done();
    });

    it('should create query with or where not exists', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .where(c => c.name, 'name')
            .orWhereNotExists(UserSetting, (subQuery, parentColumn) => {
                subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
            });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."name" = \'name\' or not exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")'
        );

        done();
    });

    it('should create query with where raw', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereRaw('?? = ??', 'users.id', 'users.name');

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."id" = "users"."name"'
        );

        done();
    });

    it('should create query with group by', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .select([c => c.someValue])
            .selectRaw('total', Number, 'SUM("numericValue")')
            .groupBy(c => c.someValue);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "users"."someValue" as "someValue", (SUM("numericValue")) as "total" from "users" group by "users"."someValue"'
        );

        done();
    });

    it('should create query with having', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .having(c => c.numericValue, '>', 10);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" having "users"."numericValue" > 10'
        );

        done();
    });

    it('should create query with having null', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(User).havingNull(c => c.numericValue);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" having "users"."numericValue" is null'
        );

        done();
    });

    it('should create query with having not null', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(User).havingNotNull(c => c.numericValue);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" having "users"."numericValue" is not null'
        );

        done();
    });

    it('should create query with having in', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .havingIn(c => c.name, ['user1', 'user2']);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" having "users"."name" in (\'user1\', \'user2\')'
        );

        done();
    });

    it('should create query with having not in', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .havingNotIn(c => c.name, ['user1', 'user2']);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" having "users"."name" not in (\'user1\', \'user2\')'
        );

        done();
    });

    it('should create query with having exists', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .havingExists(UserSetting, (subQuery, parentColumn) => {
                subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
            });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" having exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")'
        );

        done();
    });

    it('should create query with having not exists', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .havingNotExists(UserSetting, (subQuery, parentColumn) => {
                subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
            });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" having not exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")'
        );

        done();
    });

    it('should create query with having raw', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .havingRaw('?? = ??', 'users.id', 'users.name');

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" having "users"."id" = "users"."name"'
        );

        done();
    });

    it('should create query with having between', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .havingBetween(c => c.numericValue, [1, 10]);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" having "users"."numericValue" between 1 and 10'
        );

        done();
    });

    it('should create query with having not between', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .havingNotBetween(c => c.numericValue, [1, 10]);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" having "users"."numericValue" not between 1 and 10'
        );

        done();
    });

    it('should create query with an union', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .select([c => c.id])
            .union(User, subQuery => {
                subQuery.select([c => c.id]).where(c => c.numericValue, 12);
            });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "users"."id" as "id" from "users" union select "users"."id" as "id" from "users" where "users"."numericValue" = 12'
        );

        done();
    });

    it('should create query with an union all', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .select([c => c.id])
            .unionAll(User, subQuery => {
                subQuery.select([c => c.id]).where(c => c.numericValue, 12);
            });

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select "users"."id" as "id" from "users" union all select "users"."id" as "id" from "users" where "users"."numericValue" = 12'
        );

        done();
    });

    it('should create query with min', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .min(c => c.numericValue, 'minNumericValue');
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select min("users"."numericValue") as "minNumericValue" from "users"'
        );
        done();
    });

    it('should create query with count', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .count(c => c.numericValue, 'countNumericValue');
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select count("users"."numericValue") as "countNumericValue" from "users"'
        );
        done();
    });

    it('should create query with countDistinct', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .countDistinct(c => c.numericValue, 'countDistinctNumericValue');
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select count(distinct "users"."numericValue") as "countDistinctNumericValue" from "users"'
        );
        done();
    });

    it('should create query with max', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .max(c => c.numericValue, 'maxNumericValue');
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select max("users"."numericValue") as "maxNumericValue" from "users"'
        );
        done();
    });

    it('should create query with sum', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .sum(c => c.numericValue, 'sumNumericValue');
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select sum("users"."numericValue") as "sumNumericValue" from "users"'
        );
        done();
    });

    it('should create query with sumDistinct', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .sumDistinct(c => c.numericValue, 'sumDistinctNumericValue');
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select sum(distinct "users"."numericValue") as "sumDistinctNumericValue" from "users"'
        );
        done();
    });

    it('should create query with avg', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .avg(c => c.numericValue, 'avgNumericValue');
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select avg("users"."numericValue") as "avgNumericValue" from "users"'
        );
        done();
    });

    it('should create query with avgDistinct', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .avgDistinct(c => c.numericValue, 'avgDistinctNumericValue');
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select avg(distinct "users"."numericValue") as "avgDistinctNumericValue" from "users"'
        );
        done();
    });

    it('should create query with order by', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(User).orderBy(c => c.id);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" order by "users"."id" asc'
        );

        done();
    });

    it('should clear select', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .select([c => c.id])
            .clearSelect();
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users"');

        done();
    });

    it('should clear where', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .where(c => c.name, 'user1')
            .clearWhere();

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users"');

        done();
    });

    it('should clear order', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .orderBy(c => c.id)
            .clearOrder();
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users"');

        done();
    });

    it('should create query with distinct', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .select([c => c.id])
            .distinct();
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select distinct "users"."id" as "id" from "users"'
        );

        done();
    });

    it('should clone and adjust only the clone', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

        const query = typedKnex.query(User).select([c => c.id]);

        const clonedQuery = query.clone();

        clonedQuery.select([c => c.name]);

        assert.equal(
            query.toQuery(),
            'select "users"."id" as "id" from "users"'
        );
        assert.equal(
            clonedQuery.toQuery(),
            'select "users"."id" as "id", "users"."name" as "name" from "users"'
        );

        done();
    });

    it('should create query with groupby raw', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(User).groupByRaw('year WITH ROLLUP');

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" group by year WITH ROLLUP'
        );

        done();
    });

    it('should create query with or where in', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereIn(c => c.name, ['user1', 'user2'])
            .orWhereIn(c => c.name, ['user3', 'user4']);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."name" in (\'user1\', \'user2\') or "users"."name" in (\'user3\', \'user4\')'
        );

        done();
    });

    it('should create query with or where not in', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereNotIn(c => c.name, ['user1', 'user2'])
            .orWhereNotIn(c => c.name, ['user3', 'user4']);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."name" not in (\'user1\', \'user2\') or "users"."name" not in (\'user3\', \'user4\')'
        );

        done();
    });

    it('should create query with or where between', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereBetween(c => c.numericValue, [1, 10])
            .orWhereBetween(c => c.numericValue, [100, 1000]);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."numericValue" between 1 and 10 or "users"."numericValue" between 100 and 1000'
        );

        done();
    });

    it('should create query with or where not between', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereNotBetween(c => c.numericValue, [1, 10])
            .orWhereNotBetween(c => c.numericValue, [100, 1000]);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."numericValue" not between 1 and 10 or "users"."numericValue" not between 100 and 1000'
        );

        done();
    });

    it('should create query with parentheses in where', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereParentheses(sub =>
                sub.where(c => c.id, '1').orWhere(c => c.id, '2')
            )
            .orWhere(c => c.name, 'Tester');

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where ("users"."id" = \'1\' or "users"."id" = \'2\') or "users"."name" = \'Tester\''
        );

        done();
    });

    it('should return metadata from Entities', done => {
        const entities = getEntities();

        assert.equal(entities.length, 4);
        assert.exists(entities.find(i => i.tableName === 'users'));

        done();
    });

    it('should create query with where null', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(User).whereNull(c => c.name);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."name" is null'
        );

        done();
    });

    it('should create query with where not null', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(User).whereNotNull(c => c.name);

        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "users" where "users"."name" is not null'
        );

        done();
    });

    it('should left outer join a table', done => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .leftOuterJoinColumn(i => i.user);
        const queryString = query.toQuery();
        assert.equal(
            queryString,
            'select * from "userSettings" left outer join "users" as "user" on "user"."id" = "userSettings"."userId"'
        );

        done();
    });
    // it('should stay commented out', async done => {
    //     const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

    //     const item = await typedKnex
    //         .query(User)
    //         .findByPrimaryKey('id', [c => c.categoryId]);

    //     if (item !== undefined) {
    //         console.log(item);
    //     }

    //     done();
    // });
});
