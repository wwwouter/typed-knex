import { assert } from 'chai';
import * as knex from 'knex';
import { column, table } from '../src/decorators';
import { TypedKnex } from '../src/typedKnex';


@table('regions')
class Region {
    public id!: string;
    public code: number;
}

@table('userCategories')
class UserCategory {
    public id!: string;
    public name!: string;
    @column()
    public region!: Region;
    public regionId!: string;
    public year!: number;
}


@table('users')
class User {
    public id!: string;
    public name!: string;
    public someValue!: string;
    @column()
    public category!: UserCategory;
    public categoryId!: string;
    @column()
    public category2!: UserCategory;

}

@table('userSettings')
class UserSetting {
    @column()
    public id!: string;
    @column()
    public user!: User;
    public userId!: string;
    @column()
    public user2!: User;
    public user2Id!: string;
    public key!: string;
    public value!: string;
    public initialValue!: string;
}



describe('TypedKnexQueryBuilder', () => {

    it('should return select * from "users"', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex.query(User);
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users"');

        done();
    });

    it('should return select "id" from "users"', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .selectColumn('id');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "users"."id" as "id" from "users"');

        done();
    });

    it('should return camelCase correctly', (done) => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .selectColumn('initialValue');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "userSettings"."initialValue" as "initialValue" from "userSettings"');

        done();
    });

    it('should create query with where on column of own table', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .where('name', 'user1');

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\'');

        done();
    });

    it('should create query with where not on column of own table', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereNot('name', 'user1');

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where not "users"."name" = \'user1\'');

        done();
    });


    it('should join a table', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .innerJoinColumn('user');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId"');

        done();
    });

    it('should join a table and select a column of joined table', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .selectColumn('user', 'name')
            .innerJoinColumn('user');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "user"."name" as "user.name" from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId"');

        done();
    });

    it('should join a table and use where on a column of joined table', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .where('user', 'name', 'user1')
            .innerJoinColumn('user');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId" where "user"."name" = \'user1\'');

        done();
    });

    it('should join two level of tables', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .innerJoinColumn('user')
            .innerJoinColumn('user', 'category');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId"');

        done();
    });


    it('should join three level of tables', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .innerJoinColumn('user', 'category', 'region');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId"');

        done();
    });


    it('should join two levels of tables and select a column of the last joined table', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .selectColumn('user', 'category', 'name')
            .innerJoinColumn('user', 'category');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "user_category"."name" as "user.category.name" from "userSettings" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId"');

        done();
    });

    it('should join three levels of tables and select a column of the last joined table', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .selectColumn('user', 'category', 'region', 'code')
            .innerJoinColumn('user', 'category', 'region');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "user_category_region"."code" as "user.category.region.code" from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId"');

        done();
    });


    it('should join two levels of tables and use where on a column of last joined table', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .where('user', 'category', 'name', 'user1')
            .innerJoinColumn('user', 'category');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId" where "user_category"."name" = \'user1\'');

        done();
    });

    it('should join three levels of tables and use where on a column of last joined table', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .where('user', 'category', 'region', 'code', 2)
            .innerJoinColumn('user', 'category', 'region');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId" where "user_category_region"."code" = 2');

        done();
    });

    it('should select 2 columns at once', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .selectColumns(['id', 'name']);
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "users"."id", "users"."name" from "users"');

        done();
    });


    it('should select 2 columns at once from parent', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .selectColumns('user', ['id', 'name']);
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "user"."id" as "user.id", "user"."name" as "user.name" from "userSettings"');

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

    it('should select column from table with to-many relationship', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            // .query(User)
            .query(UserSetting)
            // .selectColumnWithArrays('category', 'name');
            // .selectColumn('category2', 'regionId');
            .selectColumn('user', 'category', 'regionId');
        // .selectColumn('user2s', 'category');
        // .selectColumn('name');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "user_category"."regionId" as "user.category.regionId" from "userSettings"');

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

    it('should select raw query', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .selectRaw('subQuery', Number, 'select other.id from other');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select (select other.id from other) as "subQuery" from "users"');

        // const i = await query.firstItem();
        // console.log(i.name);
        // console.log(i.subQuery === true);
        // console.log(i.subQuery === 'true');
        // console.log(i.subQueryd);



        done();
    });

    it('should create query with and in where clause', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .where('name', 'user1')
            .andWhere('name', 'user2');

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\' and "users"."name" = \'user2\'');

        done();
    });


});
