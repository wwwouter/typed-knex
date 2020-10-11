// tslint:disable:no-multiline-string
import { assert } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const testFilename = path.join(__dirname, '..', 'test.ts');

function getDiagnostics(code: string) {
    fs.writeFileSync(testFilename, code);

    const options: ts.CompilerOptions = {

        'module': ts.ModuleKind.CommonJS,
        'sourceMap': false,
        'target': ts.ScriptTarget.ES2017,
        'experimentalDecorators': true,
        'strict': true,
        'strictPropertyInitialization': false,
        'noUnusedLocals': true,
        'emitDecoratorMetadata': true,
        'skipLibCheck': true,
        'outDir': 'build',
        'noUnusedParameters': true,
        'inlineSourceMap': true,
        'inlineSources': true,
        'noImplicitReturns': true,
        'noImplicitThis': true,
        'declaration': true,
    }


    const program = ts.createProgram([testFilename], options);
    const emitResult = program.emit();

    const allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

    return allDiagnostics;
}



describe('compile time typed-knex string column parameters', function() {
    this.timeout(1000000);


    afterEach(() => {
        try {
            fs.unlinkSync(testFilename);
            // tslint:disable-next-line: no-empty
        } catch (_e) { }
    });

    it('should return type with properties from the selectColumn method', done => {

        const allDiagnostics = getDiagnostics(`
        import * as knex from 'knex';
        import { TypedKnex } from '../src/typedKnex';
        import { User } from './testEntities';


        (async () => {

            const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
            const result = await typedKnex
                .query(User)
                .select('id')
                .getFirst();

            console.log(result.id);

        })();
    `);


        assert.equal(allDiagnostics.length, 0);

        done();
    });

    it('should error on calling property not used in selectColumn method', done => {

        const allDiagnostics = getDiagnostics(`
        import * as knex from 'knex';
        import { TypedKnex } from '../src/typedKnex';
        import { User } from './testEntities';


        (async () => {

            const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
            const result = await typedKnex
                .query(User)
                .select('id')
                .getFirst();

            console.log(result.name);

        })();
    `);

        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should return type with properties from the select method', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .select('id')
                    .getFirst();

                console.log(result.id);

            })();
            `);

        assert.equal(allDiagnostics.length, 0);

        done();
    });

    it('should error on calling property not used in select method', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .select('id')
                    .getFirst();

                console.log(result.name);

            })();
            `);

        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should allow to call whereIn with type of property', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const query = typedKnex
                .query(User)
                .whereIn('name', ['user1', 'user2']);


            })();
            `);

        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should error on calling whereIn with different type', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const query = typedKnex
                .query(User)
                .whereIn('name', [1]);

            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should allow to call whereBetween with type of property', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const query = typedKnex
                .query(User)
                .whereBetween('numericValue', [1,10]);


            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should error on calling whereBetween with different type', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const query = typedKnex
                .query(User)
                .whereBetween('numericValue', ['','']);

            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should error on calling whereBetween with array of more than 2', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const query = typedKnex
                .query(User)
                .whereBetween('numericValue', [1,2,3]);

            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should allow property of parent query in where exists', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User, UserSetting } from './testEntities';


            (async () => {

                const query = typedKnex
                .query(User)
                .whereExists(UserSetting, (subQuery) => {

                    subQuery.whereColumns('user.id', '=', 'someValue');
                });


            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should not allow unknown property of parent query in where exists', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User, UserSetting } from './testEntities';


            (async () => {

                const query = typedKnex
                .query(User)
                .whereExists(UserSetting, (subQuery) => {

                    subQuery.whereColumns('user.id', '=', 'unknown');
                });


            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should return type with properties from the min method', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .min('numericValue', 'minNumericValue')
                    .getFirst();

                console.log(result.minNumericValue);

            })();
        `);
        assert.equal(allDiagnostics.length, 0);

        done();
    });

    it('should error on calling property not used in min method', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .min('numericValue', 'minNumericValue')
                    .getFirst();

                console.log(result.id);

            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should return all Model properties after clearSelect', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .select('id')
                    .clearSelect()
                    .getFirst();

                    console.log(result.id);
                    console.log(result.name);

            })();
        `);
        assert.equal(allDiagnostics.length, 0);

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
    //             .findByColumn('numericValue', 1, 'name');

    //             if (item !== undefined) {
    //                 console.log(item.name);
    //             }

    //         })();
    //     `
    //     );

    //     assert.equal(allDiagnostics.length, 0);

    //     done();
    // });

    it('should return correct type from findByPrimaryKey', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", 'name');

                if (item !== undefined) {
                    console.log(item.name);
                }

            })();
        `);
        assert.equal(allDiagnostics.length, 0);

        done();
    });

    it('should findByPrimaryKey not accept objects in select', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", 'category');

                if (item !== undefined) {
                    console.log(item.category);
                }

            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should findByPrimaryKey not accept optional objects in select', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", 'optionalCategory');

                if (item !== undefined) {
                    console.log(item.optionalCategory);
                }

            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should findByPrimaryKey not accept nullable objects in select', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", 'nullableCategory');

                if (item !== undefined) {
                    console.log(item.nullableCategory);
                }

            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });


    it('should findByPrimaryKey accept Date objects in select', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", 'birthDate');

                if (item !== undefined) {
                    console.log(item.birthDate);
                }

            })();
        `);
        assert.equal(allDiagnostics.length, 0);

        done();
    });

    it('should findByPrimaryKey accept unknown objects in select', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", 'extraData');

                if (item !== undefined) {
                    console.log(item.extraData);
                }

            })();
        `);
        assert.equal(allDiagnostics.length, 0);

        done();
    });


    it('should findByPrimaryKey accept nullable Date objects in select', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", 'deathDate');

                if (item !== undefined) {
                    console.log(item.deathDate);
                }

            })();
        `);
        assert.equal(allDiagnostics.length, 0);

        done();
    });

    it('should findByPrimaryKey accept nullable string objects in select', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", 'someNullableValue');

                if (item !== undefined) {
                    console.log(item.someNullableValue);
                }

            })();
        `);
        assert.equal(allDiagnostics.length, 0);

        done();
    });


    it('should findByPrimaryKey accept optional string objects in select', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(User)
                .findByPrimaryKey("id", 'someOptionalValue');

                if (item !== undefined) {
                    console.log(item.someOptionalValue);
                }

            })();
        `);
        assert.equal(allDiagnostics.length, 0);

        done();
    });

    it('should return correct type from leftOuterJoinTableOnFunction', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User, UserSetting } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(UserSetting)
                .leftOuterJoinTableOnFunction('otherUser', User, join => {
                    join.on('id', '=', 'user2Id');
                })
                .select('otherUser.name', 'user2.numericValue')
                .getFirst();

                if (item !== undefined) {
                    console.log(item.user2.numericValue);
                    console.log(item.otherUser.name);
                }

            })();
        `);
        assert.equal(allDiagnostics.length, 0);

        done();
    });

    it('should not return type from leftOuterJoinTableOnFunction with not selected from joined table', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User, UserSetting } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(UserSetting)
                .leftOuterJoinTableOnFunction('otherUser', User, join => {
                    join.on('id', '=', 'user2Id');
                })
                .select('otherUser.name', 'user2.numericValue')
                .getFirst();

                if (item !== undefined) {
                    console.log(item.otherUser.id);
                }

            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });

    it('should not return type from leftOuterJoinTableOnFunction with not selected from main table', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User, UserSetting } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(UserSetting)
                .leftOuterJoinTableOnFunction('otherUser', User, join => {
                    join.on('id', '=', 'user2Id');
                })
                .select('otherUser.name', 'user2.numericValue')
                .getFirst();

                if (item !== undefined) {
                    console.log(item.id);
                }

            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });


    it('should  return any when keepFlat() is used', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User, UserSetting } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));

                const item = await typedKnex
                .query(UserSetting)
                .leftOuterJoinTableOnFunction('otherUser', User, join => {
                    join.on('id', '=', 'user2Id');
                })
                .select('otherUser.name', 'user2.numericValue')
                .keepFlat()
                .getSingle();


                console.log(item.doesNotExist);


            })();
        `);
        assert.equal(allDiagnostics.length, 0);

        done();
    });

    it('should accept string column in orderBy', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .orderBy(c=>c.id)
                    .getMany();

                console.log(result.length);

            })();
        `);
        assert.equal(allDiagnostics.length, 0);

        done();
    });

    it('should accept Date column in orderBy', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .orderBy(c=>c.birthDate)
                    .getMany();

                console.log(result.length);

            })();
        `);
        assert.equal(allDiagnostics.length, 0);

        done();
    });

    it('should accept nullable Date column in orderBy', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .orderBy(c=>c.deathDate)
                    .getMany();

                console.log(result.length);

            })();
        `);
        assert.equal(allDiagnostics.length, 0);

        done();
    });

    it('should not accept foreign key column in orderBy', done => {
        const allDiagnostics = getDiagnostics(`
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .orderBy(c=>c.category)
                    .getMany();

                console.log(result.length);

            })();
        `);
        assert.notEqual(allDiagnostics.length, 0);

        done();
    });
});
