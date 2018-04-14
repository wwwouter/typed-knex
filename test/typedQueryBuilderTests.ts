import { assert } from 'chai';
import * as knex from 'knex';
import { column, table } from '../src/decorators';
import { TypedKnex } from '../src/typedKnex';


@table('regions')
class Region {
    public id!: string;
    public code!: number;
}

@table('userCategories')
class UserCategory {
    public id!: string;
    public name!: string;
    @column()
    public region!: Region;
}


@table('users')
class User {
    public id!: string;
    public name!: string;
    public someValue!: string;
    @column()
    public category!: UserCategory;

}

@table('userSettings')
class UserSetting {
    @column()
    public id!: string;
    public userId!: string;
    @column()
    public user!: User;
    @column()
    public user2!: User;
    public key!: string;
    public value!: string;
    public intitialValue!: string;
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
        assert.equal(queryString, 'select "id" from "users"');

        done();
    });

    it('should return camelCase correctly', (done) => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .selectColumn('intitialValue');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "intitialValue" from "userSettings"');

        done();
    });

    it('should create query with where on column of own table', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .where('name', 'user1');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "name" = \'user1\'');

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
        assert.equal(queryString, 'select "user"."name" as "user_name" from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId"');

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
        assert.equal(queryString, 'select "user_category"."name" as "user_category_name" from "userSettings" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId"');

        done();
    });

    it('should join three levels of tables and select a column of the last joined table', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .selectColumn('user', 'category', 'region', 'code')
            .innerJoinColumn('user', 'category', 'region');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "user_category_region"."code" as "user_category_region_code" from "userSettings" inner join "regions" as "user_category_region" on "user_category_region"."id" = "user_category"."regionId"');

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

});
