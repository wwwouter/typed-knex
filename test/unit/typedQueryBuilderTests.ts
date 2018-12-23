import { assert } from 'chai';
import * as knex from 'knex';
import { TypedKnex } from '../../src/typedKnex';
import { User, UserSetting } from '../testEntities';



// function  <Model, Prev extends {}, K1 extends FilterObjectsOnly<Model>, K2 extends FilterNonObjects<Model[K1]>> trans(newPropertyClass: new () => Model, key1: K1, keys2: K2[]): any { //ITypedQueryBuilder < Model, TransformAll<Pick<Model, K1>, Pick<Model[K1], K2>> & Prev > {
//     return {} as any;
// }


// function trans<Model, K1 extends keyof Model>(_m: new () => Model, _key1: K1): Pick<Model, K1> {
//     return {} as any;
// }

// const a = trans(User, 'id');
// console.log(a.id);
// console.log(a.name);
// console.log(a.NOOO);

// const root = {
//     id: ({} as any) as Pick<User, 'id'>,
//     id2: ({} as any) as () => Pick<User, 'id'>,
//     id3: { return: ({} as any) as () => Pick<User, 'id'> },
//     category: {
//         id3: { getColumn: ({} as any) as () => Pick<User, 'id'> },
//         id: ({} as any) as Pick<UserCategory, 'id'>,
//     },
// };

// // root.id()  vs root.id
// // root.category.id.id
// console.log('root.category.id.id: ', root.category.id.id);
// root.id2();
// // moet het returnen, zonder het te returnen ...

// // function kan een wrap .. of unwrap doen ...

// // offfff ... juist wel een function, maar dat om keren.

// // root.id2;
// console.log('root.id2: ', root.id2);
// console.log(root.id3.return());
// console.log(root.id3.return);
// console.log(root.category.id3.getColumn());

// volgorde mooist
// - root.category.id
// - root.category.id()
// - root('category', 'id') (dit kan soort van ... is mooier dan zo maar overal '','','' ...)
//      - select(c=>c('category','id'))
//      - selectColumns(c=>[c('category','id'), c('id')])
//      - where(c=>c('category','id'), 12)
// - root.category.id.getColumn() (is lastig als je root.category.id kan typen .. least suprise)
// - root.category.id.return (wel makkelijk in gebruik)




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
            .selectColumn(c => c('id'));
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "users"."id" as "id" from "users"');

        done();
    });


    it('should return camelCase correctly', (done) => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .selectColumn(c => c('initialValue'));
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
            .selectColumn(c => c('user', 'name'))
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
            .selectColumn(c => c('user', 'category', 'name'))
            .innerJoinColumn('user', 'category');
        const queryString = query.toQuery();
        assert.equal(queryString, 'select "user_category"."name" as "user.category.name" from "userSettings" inner join "userCategories" as "user_category" on "user_category"."id" = "user"."categoryId"');

        done();
    });

    it('should join three levels of tables and select a column of the last joined table', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(UserSetting)
            .selectColumn(c => c('user', 'category', 'region', 'code'))
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
            .selectColumn(c => c('user', 'category', 'regionId'));
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

    it('should create query with AND in where clause', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .where('name', 'user1')
            .andWhere('name', 'user2');

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\' and "users"."name" = \'user2\'');

        done();
    });

    it('should create query with OR in where clause', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .where('name', 'user1')
            .orWhere('name', 'user2');

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" = \'user1\' or "users"."name" = \'user2\'');

        done();
    });

    it('should create query with where in', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereIn('name', ['user1', 'user2']);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" in (\'user1\', \'user2\')');

        done();
    });

    it('should create query with where not in', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereNotIn('name', ['user1', 'user2']);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" not in (\'user1\', \'user2\')');

        done();
    });


    it('should create query with where between', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereBetween('numericValue', [1, 10]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."numericValue" between 1 and 10');

        done();
    });

    it('should create query with where not between', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereNotBetween('numericValue', [1, 10]);

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."numericValue" not between 1 and 10');

        done();
    });


    it('should create query with where exists', (done) => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereExists(UserSetting, (subQuery, parentColumn) => {
                subQuery.whereColumns(['userId'], '=', parentColumn('id'));
            });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');

        done();
    });

    it('should create query with or where exists', (done) => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .where('name', 'name')
            .orWhereExists(UserSetting, (subQuery, parentColumn) => {
                subQuery.whereColumns(['userId'], '=', parentColumn('id'));
            });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" = \'name\' or exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');

        done();
    });


    it('should create query with where not exists', (done) => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereNotExists(UserSetting, (subQuery, parentColumn) => {
                subQuery.whereColumns(['userId'], '=', parentColumn('id'));
            });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where not exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');

        done();
    });

    it('should create query with or where not exists', (done) => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .where('name', 'name')
            .orWhereNotExists(UserSetting, (subQuery, parentColumn) => {
                subQuery.whereColumns(['userId'], '=', parentColumn('id'));
            });

        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."name" = \'name\' or not exists (select * from "userSettings" where "userSettings"."userId" = "users"."id")');

        done();
    });


    it('should create query with where raw', (done) => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .whereRaw('?? = ??', 'users.id', 'users.name');


        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" where "users"."id" = "users"."name"');

        done();
    });


    it('should create query with group by', (done) => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .selectColumn(c => c('someValue'))
            .selectRaw('total', Number, 'SUM("numericValue")')
            .groupBy('someValue');


        const queryString = query.toQuery();
        assert.equal(queryString, 'select "users"."someValue" as "someValue", (SUM("numericValue")) as "total" from "users" group by "users"."someValue"');

        done();
    });


    it('should create query with having', (done) => {
        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        const query = typedKnex
            .query(User)
            .having('numericValue', '>', 10);


        const queryString = query.toQuery();
        assert.equal(queryString, 'select * from "users" having "users"."numericValue" > 10');

        done();
    });



});
