// tslint:disable:no-multiline-string
import { assert } from 'chai';
import { Project, SourceFile } from 'ts-morph';

describe('compile time typed-knex', function() {
    this.timeout(1000000);

    const project = new Project({
        tsConfigFilePath: './tsconfig.json'
    });

    let file: SourceFile;
    afterEach(() => {
        try {
            file.delete();
            // tslint:disable-next-line: no-empty
        } catch (_e) { }
    });

    it('should return type with properties from the selectColumn method', done => {
        file = project.createSourceFile(
            'test/test.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .select(c=>[c.id])
                    .getFirst();

                console.log(result.id);

            })();
        `
        );

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should error on calling property not used in selectColumn method', done => {
        file = project.createSourceFile(
            'test/test.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .select(c=>[c.id])
                    .getFirst();

                console.log(result.name);

            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should return type with properties from the select method', done => {
        file = project.createSourceFile(
            'test/test.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .select(c=>[c.id])
                    .getFirst();

                console.log(result.id);

            })();
        `
        );

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should error on calling property not used in select method', done => {
        file = project.createSourceFile(
            'test/test.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .select(c=>[c.id])
                    .getFirst();

                console.log(result.name);

            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should allow to call whereIn with type of property', done => {
        file = project.createSourceFile(
            'test/test.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const query = typedKnex
                .query(User)
                .whereIn('name', ['user1', 'user2']);


            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should error on calling whereIn with different type', done => {
        file = project.createSourceFile(
            'test/test.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const query = typedKnex
                .query(User)
                .whereIn('name', [1]);

            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should allow to call whereBetween with type of property', done => {
        file = project.createSourceFile(
            'test/test.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const query = typedKnex
                .query(User)
                .whereBetween('numericValue', [1,10]);


            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should error on calling whereBetween with different type', done => {
        file = project.createSourceFile(
            'test/test.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const query = typedKnex
                .query(User)
                .whereBetween('numericValue', ['','']);

            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should error on calling whereBetween with array of more than 2', done => {
        file = project.createSourceFile(
            'test/test.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const query = typedKnex
                .query(User)
                .whereBetween('numericValue', [1,2,3]);

            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should allow property of parent query in where exists', done => {
        file = project.createSourceFile(
            'test/test.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User, UserSetting } from './testEntities';


            (async () => {

                const query = typedKnex
                .query(User)
                .whereExists(UserSetting, (subQuery, parentColumn) => {

                    subQuery.whereColumns(['user', 'id'], '=', parentColumn('someValue'));
                });


            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should not allow unknown property of parent query in where exists', done => {
        file = project.createSourceFile(
            'test/test.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User, UserSetting } from './testEntities';


            (async () => {

                const query = typedKnex
                .query(User)
                .whereExists(UserSetting, (subQuery, parentColumn) => {

                    subQuery.whereColumns(['user', 'id'], '=', parentColumn('unknown'));
                });


            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should return type with properties from the min method', done => {
        file = project.createSourceFile(
            'test/test1.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .min(c => c.numericValue, 'minNumericValue')
                    .getFirst();

                console.log(result.minNumericValue);

            })();
        `
        );

        assert.equal(project.getPreEmitDiagnostics().length, 0);
        file.delete();

        done();
    });

    it('should error on calling property not used in min method', done => {
        file = project.createSourceFile(
            'test/test2.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .min(c => c('numericValue'), 'minNumericValue')
                    .getFirst();

                console.log(result.id);

            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);
        file.delete();

        done();
    });

    it('should return all Model properties after clearSelect', done => {
        file = project.createSourceFile(
            'test/test3.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .select(c=>[c.id])
                    .clearSelect()
                    .getFirst();

                    console.log(result.id);
                    console.log(result.name);

            })();
        `
        );

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    // it('should return correct type from findByColumn', done => {
    //     file = project.createSourceFile(
    //         'test/test4.ts',
    //         `
    //         import * as knex from 'knex';
    //         import { TypedKnex } from '../src/typedKnex';
    //         import { User } from './testEntities';

    //         (async () => {

    //             const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

    //             const item = await typedKnex
    //             .query(User)
    //             .findByColumn(c => c.numericValue, 1, c => [c.name]);

    //             if (item !== undefined) {
    //                 console.log(item.name);
    //             }

    //         })();
    //     `
    //     );

    //     assert.equal(project.getPreEmitDiagnostics().length, 0);

    //     file.delete();
    //     done();
    // });

    it('should return correct type from findByPrimaryKey', done => {
        file = project.createSourceFile(
            'test/test4.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", c => [c.name]);

                if (item !== undefined) {
                    console.log(item.name);
                }

            })();
        `
        );

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should findByPrimaryKey not accept objects in select', done => {
        file = project.createSourceFile(
            'test/test4.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", c => [c.category]);

                if (item !== undefined) {
                    console.log(item.category);
                }

            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should findByPrimaryKey not accept optional objects in select', done => {
        file = project.createSourceFile(
            'test/test4.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", c => [c.optionalCategory]);

                if (item !== undefined) {
                    console.log(item.optionalCategory);
                }

            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should findByPrimaryKey not accept nullable objects in select', done => {
        file = project.createSourceFile(
            'test/test4.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", c => [c.nullableCategory]);

                if (item !== undefined) {
                    console.log(item.nullableCategory);
                }

            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });


    it('should findByPrimaryKey accept Date objects in select', done => {
        file = project.createSourceFile(
            'test/test4.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", c => [c.birthDate]);

                if (item !== undefined) {
                    console.log(item.birthDate);
                }

            })();
        `
        );

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });


    it('should findByPrimaryKey accept nullable Date objects in select', done => {
        file = project.createSourceFile(
            'test/test4.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", c => [c.deathDate]);

                if (item !== undefined) {
                    console.log(item.deathDate);
                }

            })();
        `
        );

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should findByPrimaryKey accept nullable string objects in select', done => {
        file = project.createSourceFile(
            'test/test4.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", c => [c.someNullableValue]);

                if (item !== undefined) {
                    console.log(item.someNullableValue);
                }

            })();
        `
        );

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });


    it('should findByPrimaryKey accept optional string objects in select', done => {
        file = project.createSourceFile(
            'test/test4.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", c => [c.someOptionalValue]);

                if (item !== undefined) {
                    console.log(item.someOptionalValue);
                }

            })();
        `
        );

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should return correct type from leftOuterJoinTableOnFunction', done => {
        file = project.createSourceFile(
            'test/test4.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User, UserSetting } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(UserSetting)
                .leftOuterJoinTableOnFunction('otherUser', User, join => {
                    join.on(i => i.id, '=', j => j.user2Id);
                })
                .select(i => [i.otherUser.name, i.user2.numericValue])
                .getFirst();

                if (item !== undefined) {
                    console.log(item.user2.numericValue);
                    console.log(item.otherUser.name);
                }

            })();
        `
        );

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should not return type from leftOuterJoinTableOnFunction with not selected from joined table', done => {
        file = project.createSourceFile(
            'test/test4.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User, UserSetting } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(UserSetting)
                .leftOuterJoinTableOnFunction('otherUser', User, join => {
                    join.on(i => i.id, '=', j => j.user2Id);
                })
                .select(i => [i.otherUser.name, i.user2.numericValue])
                .getFirst();

                if (item !== undefined) {
                    console.log(item.otherUser.id);
                }

            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });

    it('should not return type from leftOuterJoinTableOnFunction with not selected from main table', done => {
        file = project.createSourceFile(
            'test/test4.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User, UserSetting } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(UserSetting)
                .leftOuterJoinTableOnFunction('otherUser', User, join => {
                    join.on(i => i.id, '=', j => j.user2Id);
                })
                .select(i => [i.otherUser.name, i.user2.numericValue])
                .getFirst();

                if (item !== undefined) {
                    console.log(item.id);
                }

            })();
        `
        );

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });


    it('should  return any when keepFlat() is used', done => {
        file = project.createSourceFile(
            'test/test4.ts',
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User, UserSetting } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(UserSetting)
                .leftOuterJoinTableOnFunction('otherUser', User, join => {
                    join.on(i => i.id, '=', j => j.user2Id);
                })
                .select(i => [i.otherUser.name, i.user2.numericValue])
                .keepFlat()
                .getSingle();


                console.log(item.doesNotExist);


            })();
        `
        );

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        file.delete();
        done();
    });
});
