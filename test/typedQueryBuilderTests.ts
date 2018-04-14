import { assert } from 'chai';
import * as knex from 'knex';
import { column, table } from '../src/decorators';
import { TypedKnex } from '../src/typedKnex';


@table('users')
class User {
    public id!: string;
    public name!: string;
    public someValue!: string;

}

@table('userSettings')
class UserSetting {
    public id!: string;
    public userId!: string;
    @column()
    public user!: User;
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
            .selectWithName('id');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "id" from "users"');
        done();
    });

    it('should return camelCase correctly', (done) => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .selectWithName('intitialValue');
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
            .innerJoin('user');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "userSettings" inner join "users" as "user" on "user"."id" = "userSettings"."userId"');
        done();
    });


});
