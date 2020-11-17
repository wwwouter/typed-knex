"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-multiline-string
const chai_1 = require("chai");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const testFilename = path.join(__dirname, '..', 'test.ts');
function getDiagnostics(code) {
    fs.writeFileSync(testFilename, code);
    const options = {
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
    };
    const program = ts.createProgram([testFilename], options);
    const emitResult = program.emit();
    const allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);
    return allDiagnostics;
}
describe('compile time typed-knex string column parameters', function () {
    this.timeout(1000000);
    afterEach(() => {
        try {
            fs.unlinkSync(testFilename);
            // tslint:disable-next-line: no-empty
        }
        catch (_e) { }
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.equal(allDiagnostics.length, 0);
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
        chai_1.assert.notEqual(allDiagnostics.length, 0);
        done();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsYXRpb25UZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tcGlsYXRpb24vY29tcGlsYXRpb25UZXN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFxQztBQUNyQywrQkFBOEI7QUFDOUIseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3QixpQ0FBaUM7QUFFakMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBRTNELFNBQVMsY0FBYyxDQUFDLElBQVk7SUFDaEMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFckMsTUFBTSxPQUFPLEdBQXVCO1FBRWhDLFFBQVEsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVE7UUFDaEMsV0FBVyxFQUFFLEtBQUs7UUFDbEIsUUFBUSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTTtRQUNoQyx3QkFBd0IsRUFBRSxJQUFJO1FBQzlCLFFBQVEsRUFBRSxJQUFJO1FBQ2QsOEJBQThCLEVBQUUsS0FBSztRQUNyQyxnQkFBZ0IsRUFBRSxJQUFJO1FBQ3RCLHVCQUF1QixFQUFFLElBQUk7UUFDN0IsY0FBYyxFQUFFLElBQUk7UUFDcEIsUUFBUSxFQUFFLE9BQU87UUFDakIsb0JBQW9CLEVBQUUsSUFBSTtRQUMxQixpQkFBaUIsRUFBRSxJQUFJO1FBQ3ZCLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLG1CQUFtQixFQUFFLElBQUk7UUFDekIsZ0JBQWdCLEVBQUUsSUFBSTtRQUN0QixhQUFhLEVBQUUsSUFBSTtLQUN0QixDQUFBO0lBR0QsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzFELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUs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OztTQWlCckMsQ0FBQyxDQUFDO1FBQ0gsYUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXZDLElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsc0NBQXNDLEVBQUUsSUFBSSxDQUFDLEVBQUU7UUFDOUMsTUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztTQWlCckMsQ0FBQyxDQUFDO1FBQ0gsYUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXZDLElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsK0NBQStDLEVBQUUsSUFBSSxDQUFDLEVBQUU7UUFDdkQsTUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztTQWlCckMsQ0FBQyxDQUFDO1FBQ0gsYUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXZDLElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsaURBQWlELEVBQUUsSUFBSSxDQUFDLEVBQUU7UUFDekQsTUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztTQWlCckMsQ0FBQyxDQUFDO1FBQ0gsYUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTFDLElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHRzbGludDpkaXNhYmxlOm5vLW11bHRpbGluZS1zdHJpbmdcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJ2NoYWknO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5jb25zdCB0ZXN0RmlsZW5hbWUgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAndGVzdC50cycpO1xuXG5mdW5jdGlvbiBnZXREaWFnbm9zdGljcyhjb2RlOiBzdHJpbmcpIHtcbiAgICBmcy53cml0ZUZpbGVTeW5jKHRlc3RGaWxlbmFtZSwgY29kZSk7XG5cbiAgICBjb25zdCBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMgPSB7XG5cbiAgICAgICAgJ21vZHVsZSc6IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlMsXG4gICAgICAgICdzb3VyY2VNYXAnOiBmYWxzZSxcbiAgICAgICAgJ3RhcmdldCc6IHRzLlNjcmlwdFRhcmdldC5FUzIwMTcsXG4gICAgICAgICdleHBlcmltZW50YWxEZWNvcmF0b3JzJzogdHJ1ZSxcbiAgICAgICAgJ3N0cmljdCc6IHRydWUsXG4gICAgICAgICdzdHJpY3RQcm9wZXJ0eUluaXRpYWxpemF0aW9uJzogZmFsc2UsXG4gICAgICAgICdub1VudXNlZExvY2Fscyc6IHRydWUsXG4gICAgICAgICdlbWl0RGVjb3JhdG9yTWV0YWRhdGEnOiB0cnVlLFxuICAgICAgICAnc2tpcExpYkNoZWNrJzogdHJ1ZSxcbiAgICAgICAgJ291dERpcic6ICdidWlsZCcsXG4gICAgICAgICdub1VudXNlZFBhcmFtZXRlcnMnOiB0cnVlLFxuICAgICAgICAnaW5saW5lU291cmNlTWFwJzogdHJ1ZSxcbiAgICAgICAgJ2lubGluZVNvdXJjZXMnOiB0cnVlLFxuICAgICAgICAnbm9JbXBsaWNpdFJldHVybnMnOiB0cnVlLFxuICAgICAgICAnbm9JbXBsaWNpdFRoaXMnOiB0cnVlLFxuICAgICAgICAnZGVjbGFyYXRpb24nOiB0cnVlLFxuICAgIH1cblxuXG4gICAgY29uc3QgcHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0oW3Rlc3RGaWxlbmFtZV0sIG9wdGlvbnMpO1xuICAgIGNvbnN0IGVtaXRSZXN1bHQgPSBwcm9ncmFtLmVtaXQoKTtcblxuICAgIGNvbnN0IGFsbERpYWdub3N0aWNzID0gdHNcbiAgICAgICAgLmdldFByZUVtaXREaWFnbm9zdGljcyhwcm9ncmFtKVxuICAgICAgICAuY29uY2F0KGVtaXRSZXN1bHQuZGlhZ25vc3RpY3MpO1xuXG4gICAgcmV0dXJuIGFsbERpYWdub3N0aWNzO1xufVxuXG5cblxuZGVzY3JpYmUoJ2NvbXBpbGUgdGltZSB0eXBlZC1rbmV4IHN0cmluZyBjb2x1bW4gcGFyYW1ldGVycycsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGltZW91dCgxMDAwMDAwKTtcblxuXG4gICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnVubGlua1N5bmModGVzdEZpbGVuYW1lKTtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tZW1wdHlcbiAgICAgICAgfSBjYXRjaCAoX2UpIHsgfVxuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHlwZSB3aXRoIHByb3BlcnRpZXMgZnJvbSB0aGUgc2VsZWN0Q29sdW1uIG1ldGhvZCcsIGRvbmUgPT4ge1xuXG4gICAgICAgIGNvbnN0IGFsbERpYWdub3N0aWNzID0gZ2V0RGlhZ25vc3RpY3MoYFxuICAgICAgICBpbXBvcnQgKiBhcyBrbmV4IGZyb20gJ2tuZXgnO1xuICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vdGVzdEVudGl0aWVzJztcblxuXG4gICAgICAgIChhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHR5cGVkS25leFxuICAgICAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgICAgIC5zZWxlY3QoJ2lkJylcbiAgICAgICAgICAgICAgICAuZ2V0Rmlyc3QoKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0LmlkKTtcblxuICAgICAgICB9KSgpO1xuICAgIGApO1xuXG5cbiAgICAgICAgYXNzZXJ0LmVxdWFsKGFsbERpYWdub3N0aWNzLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBlcnJvciBvbiBjYWxsaW5nIHByb3BlcnR5IG5vdCB1c2VkIGluIHNlbGVjdENvbHVtbiBtZXRob2QnLCBkb25lID0+IHtcblxuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgaW1wb3J0ICogYXMga25leCBmcm9tICdrbmV4JztcbiAgICAgICAgaW1wb3J0IHsgVHlwZWRLbmV4IH0gZnJvbSAnLi4vc3JjL3R5cGVkS25leCc7XG4gICAgICAgIGltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAoYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgICAgICAuc2VsZWN0KCdpZCcpXG4gICAgICAgICAgICAgICAgLmdldEZpcnN0KCk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdC5uYW1lKTtcblxuICAgICAgICB9KSgpO1xuICAgIGApO1xuXG4gICAgICAgIGFzc2VydC5ub3RFcXVhbChhbGxEaWFnbm9zdGljcy5sZW5ndGgsIDApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHR5cGUgd2l0aCBwcm9wZXJ0aWVzIGZyb20gdGhlIHNlbGVjdCBtZXRob2QnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgYWxsRGlhZ25vc3RpY3MgPSBnZXREaWFnbm9zdGljcyhgXG4gICAgICAgICAgICBpbXBvcnQgKiBhcyBrbmV4IGZyb20gJ2tuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVHlwZWRLbmV4IH0gZnJvbSAnLi4vc3JjL3R5cGVkS25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi90ZXN0RW50aXRpZXMnO1xuXG5cbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHlwZWRLbmV4XG4gICAgICAgICAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCdpZCcpXG4gICAgICAgICAgICAgICAgICAgIC5nZXRGaXJzdCgpO1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0LmlkKTtcblxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgIGApO1xuXG4gICAgICAgIGFzc2VydC5lcXVhbChhbGxEaWFnbm9zdGljcy5sZW5ndGgsIDApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgZXJyb3Igb24gY2FsbGluZyBwcm9wZXJ0eSBub3QgdXNlZCBpbiBzZWxlY3QgbWV0aG9kJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IGFsbERpYWdub3N0aWNzID0gZ2V0RGlhZ25vc3RpY3MoYFxuICAgICAgICAgICAgaW1wb3J0ICogYXMga25leCBmcm9tICdrbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFR5cGVkS25leCB9IGZyb20gJy4uL3NyYy90eXBlZEtuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vdGVzdEVudGl0aWVzJztcblxuXG4gICAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHR5cGVkS25leFxuICAgICAgICAgICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgnaWQnKVxuICAgICAgICAgICAgICAgICAgICAuZ2V0Rmlyc3QoKTtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdC5uYW1lKTtcblxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgIGApO1xuXG4gICAgICAgIGFzc2VydC5ub3RFcXVhbChhbGxEaWFnbm9zdGljcy5sZW5ndGgsIDApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYWxsb3cgdG8gY2FsbCB3aGVyZUluIHdpdGggdHlwZSBvZiBwcm9wZXJ0eScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgICAgIC53aGVyZUluKCduYW1lJywgWyd1c2VyMScsICd1c2VyMiddKTtcblxuXG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgYCk7XG5cbiAgICAgICAgYXNzZXJ0Lm5vdEVxdWFsKGFsbERpYWdub3N0aWNzLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBlcnJvciBvbiBjYWxsaW5nIHdoZXJlSW4gd2l0aCBkaWZmZXJlbnQgdHlwZScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gdHlwZWRLbmV4XG4gICAgICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAgICAgLndoZXJlSW4oJ25hbWUnLCBbMV0pO1xuXG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICBgKTtcbiAgICAgICAgYXNzZXJ0Lm5vdEVxdWFsKGFsbERpYWdub3N0aWNzLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBhbGxvdyB0byBjYWxsIHdoZXJlQmV0d2VlbiB3aXRoIHR5cGUgb2YgcHJvcGVydHknLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgYWxsRGlhZ25vc3RpY3MgPSBnZXREaWFnbm9zdGljcyhgXG4gICAgICAgICAgICBpbXBvcnQgKiBhcyBrbmV4IGZyb20gJ2tuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVHlwZWRLbmV4IH0gZnJvbSAnLi4vc3JjL3R5cGVkS25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi90ZXN0RW50aXRpZXMnO1xuXG5cbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgICAgICAud2hlcmVCZXR3ZWVuKCdudW1lcmljVmFsdWUnLCBbMSwxMF0pO1xuXG5cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIGApO1xuICAgICAgICBhc3NlcnQubm90RXF1YWwoYWxsRGlhZ25vc3RpY3MubGVuZ3RoLCAwKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGVycm9yIG9uIGNhbGxpbmcgd2hlcmVCZXR3ZWVuIHdpdGggZGlmZmVyZW50IHR5cGUnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgYWxsRGlhZ25vc3RpY3MgPSBnZXREaWFnbm9zdGljcyhgXG4gICAgICAgICAgICBpbXBvcnQgKiBhcyBrbmV4IGZyb20gJ2tuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVHlwZWRLbmV4IH0gZnJvbSAnLi4vc3JjL3R5cGVkS25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi90ZXN0RW50aXRpZXMnO1xuXG5cbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgICAgIC53aGVyZUJldHdlZW4oJ251bWVyaWNWYWx1ZScsIFsnJywnJ10pO1xuXG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICBgKTtcbiAgICAgICAgYXNzZXJ0Lm5vdEVxdWFsKGFsbERpYWdub3N0aWNzLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBlcnJvciBvbiBjYWxsaW5nIHdoZXJlQmV0d2VlbiB3aXRoIGFycmF5IG9mIG1vcmUgdGhhbiAyJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IGFsbERpYWdub3N0aWNzID0gZ2V0RGlhZ25vc3RpY3MoYFxuICAgICAgICAgICAgaW1wb3J0ICogYXMga25leCBmcm9tICdrbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFR5cGVkS25leCB9IGZyb20gJy4uL3NyYy90eXBlZEtuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vdGVzdEVudGl0aWVzJztcblxuXG4gICAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcXVlcnkgPSB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgICAgICAud2hlcmVCZXR3ZWVuKCdudW1lcmljVmFsdWUnLCBbMSwyLDNdKTtcblxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgYCk7XG4gICAgICAgIGFzc2VydC5ub3RFcXVhbChhbGxEaWFnbm9zdGljcy5sZW5ndGgsIDApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYWxsb3cgcHJvcGVydHkgb2YgcGFyZW50IHF1ZXJ5IGluIHdoZXJlIGV4aXN0cycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIsIFVzZXJTZXR0aW5nIH0gZnJvbSAnLi90ZXN0RW50aXRpZXMnO1xuXG5cbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgICAgIC53aGVyZUV4aXN0cyhVc2VyU2V0dGluZywgKHN1YlF1ZXJ5KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgc3ViUXVlcnkud2hlcmVDb2x1bW5zKCd1c2VyLmlkJywgJz0nLCAnc29tZVZhbHVlJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgYCk7XG4gICAgICAgIGFzc2VydC5ub3RFcXVhbChhbGxEaWFnbm9zdGljcy5sZW5ndGgsIDApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbm90IGFsbG93IHVua25vd24gcHJvcGVydHkgb2YgcGFyZW50IHF1ZXJ5IGluIHdoZXJlIGV4aXN0cycsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIsIFVzZXJTZXR0aW5nIH0gZnJvbSAnLi90ZXN0RW50aXRpZXMnO1xuXG5cbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IHR5cGVkS25leFxuICAgICAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgICAgIC53aGVyZUV4aXN0cyhVc2VyU2V0dGluZywgKHN1YlF1ZXJ5KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgc3ViUXVlcnkud2hlcmVDb2x1bW5zKCd1c2VyLmlkJywgJz0nLCAndW5rbm93bicpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIGApO1xuICAgICAgICBhc3NlcnQubm90RXF1YWwoYWxsRGlhZ25vc3RpY3MubGVuZ3RoLCAwKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiB0eXBlIHdpdGggcHJvcGVydGllcyBmcm9tIHRoZSBtaW4gbWV0aG9kJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IGFsbERpYWdub3N0aWNzID0gZ2V0RGlhZ25vc3RpY3MoYFxuICAgICAgICAgICAgaW1wb3J0ICogYXMga25leCBmcm9tICdrbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFR5cGVkS25leCB9IGZyb20gJy4uL3NyYy90eXBlZEtuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vdGVzdEVudGl0aWVzJztcblxuXG4gICAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHR5cGVkS25leFxuICAgICAgICAgICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgICAgICAgICAgLm1pbignbnVtZXJpY1ZhbHVlJywgJ21pbk51bWVyaWNWYWx1ZScpXG4gICAgICAgICAgICAgICAgICAgIC5nZXRGaXJzdCgpO1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0Lm1pbk51bWVyaWNWYWx1ZSk7XG5cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIGApO1xuICAgICAgICBhc3NlcnQuZXF1YWwoYWxsRGlhZ25vc3RpY3MubGVuZ3RoLCAwKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGVycm9yIG9uIGNhbGxpbmcgcHJvcGVydHkgbm90IHVzZWQgaW4gbWluIG1ldGhvZCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAgICAgICAgIC5taW4oJ251bWVyaWNWYWx1ZScsICdtaW5OdW1lcmljVmFsdWUnKVxuICAgICAgICAgICAgICAgICAgICAuZ2V0Rmlyc3QoKTtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdC5pZCk7XG5cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIGApO1xuICAgICAgICBhc3NlcnQubm90RXF1YWwoYWxsRGlhZ25vc3RpY3MubGVuZ3RoLCAwKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBhbGwgTW9kZWwgcHJvcGVydGllcyBhZnRlciBjbGVhclNlbGVjdCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJ2lkJylcbiAgICAgICAgICAgICAgICAgICAgLmNsZWFyU2VsZWN0KClcbiAgICAgICAgICAgICAgICAgICAgLmdldEZpcnN0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0LmlkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0Lm5hbWUpO1xuXG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICBgKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKGFsbERpYWdub3N0aWNzLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gaXQoJ3Nob3VsZCByZXR1cm4gY29ycmVjdCB0eXBlIGZyb20gZmluZEJ5Q29sdW1uJywgZG9uZSA9PiB7XG4gICAgLy8gICAgIGZpbGUgPSBwcm9qZWN0LmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgLy8gICAgICAgICAndGVzdC90ZXN0NC50cycsXG4gICAgLy8gICAgICAgICBgXG4gICAgLy8gICAgICAgICBpbXBvcnQgKiBhcyBrbmV4IGZyb20gJ2tuZXgnO1xuICAgIC8vICAgICAgICAgaW1wb3J0IHsgVHlwZWRLbmV4IH0gZnJvbSAnLi4vc3JjL3R5cGVkS25leCc7XG4gICAgLy8gICAgICAgICBpbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi90ZXN0RW50aXRpZXMnO1xuXG4gICAgLy8gICAgICAgICAoYXN5bmMgKCkgPT4ge1xuXG4gICAgLy8gICAgICAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuXG4gICAgLy8gICAgICAgICAgICAgY29uc3QgaXRlbSA9IGF3YWl0IHR5cGVkS25leFxuICAgIC8vICAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgIC8vICAgICAgICAgICAgIC5maW5kQnlDb2x1bW4oJ251bWVyaWNWYWx1ZScsIDEsICduYW1lJyk7XG5cbiAgICAvLyAgICAgICAgICAgICBpZiAoaXRlbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGl0ZW0ubmFtZSk7XG4gICAgLy8gICAgICAgICAgICAgfVxuXG4gICAgLy8gICAgICAgICB9KSgpO1xuICAgIC8vICAgICBgXG4gICAgLy8gICAgICk7XG5cbiAgICAvLyAgICAgYXNzZXJ0LmVxdWFsKGFsbERpYWdub3N0aWNzLmxlbmd0aCwgMCk7XG5cbiAgICAvLyAgICAgZG9uZSgpO1xuICAgIC8vIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gY29ycmVjdCB0eXBlIGZyb20gZmluZEJ5UHJpbWFyeUtleScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBhd2FpdCB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgICAgICAuZmluZEJ5UHJpbWFyeUtleShcImlkXCIsICduYW1lJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXRlbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGl0ZW0ubmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICBgKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKGFsbERpYWdub3N0aWNzLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBmaW5kQnlQcmltYXJ5S2V5IG5vdCBhY2NlcHQgb2JqZWN0cyBpbiBzZWxlY3QnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgYWxsRGlhZ25vc3RpY3MgPSBnZXREaWFnbm9zdGljcyhgXG4gICAgICAgICAgICBpbXBvcnQgKiBhcyBrbmV4IGZyb20gJ2tuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVHlwZWRLbmV4IH0gZnJvbSAnLi4vc3JjL3R5cGVkS25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi90ZXN0RW50aXRpZXMnO1xuXG5cbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gYXdhaXQgdHlwZWRLbmV4XG4gICAgICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAgICAgLmZpbmRCeVByaW1hcnlLZXkoXCJpZFwiLCAnY2F0ZWdvcnknKTtcblxuICAgICAgICAgICAgICAgIGlmIChpdGVtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbS5jYXRlZ29yeSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICBgKTtcbiAgICAgICAgYXNzZXJ0Lm5vdEVxdWFsKGFsbERpYWdub3N0aWNzLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBmaW5kQnlQcmltYXJ5S2V5IG5vdCBhY2NlcHQgb3B0aW9uYWwgb2JqZWN0cyBpbiBzZWxlY3QnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgYWxsRGlhZ25vc3RpY3MgPSBnZXREaWFnbm9zdGljcyhgXG4gICAgICAgICAgICBpbXBvcnQgKiBhcyBrbmV4IGZyb20gJ2tuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVHlwZWRLbmV4IH0gZnJvbSAnLi4vc3JjL3R5cGVkS25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi90ZXN0RW50aXRpZXMnO1xuXG5cbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gYXdhaXQgdHlwZWRLbmV4XG4gICAgICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAgICAgLmZpbmRCeVByaW1hcnlLZXkoXCJpZFwiLCAnb3B0aW9uYWxDYXRlZ29yeScpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtLm9wdGlvbmFsQ2F0ZWdvcnkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgYCk7XG4gICAgICAgIGFzc2VydC5ub3RFcXVhbChhbGxEaWFnbm9zdGljcy5sZW5ndGgsIDApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgZmluZEJ5UHJpbWFyeUtleSBub3QgYWNjZXB0IG51bGxhYmxlIG9iamVjdHMgaW4gc2VsZWN0JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IGFsbERpYWdub3N0aWNzID0gZ2V0RGlhZ25vc3RpY3MoYFxuICAgICAgICAgICAgaW1wb3J0ICogYXMga25leCBmcm9tICdrbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFR5cGVkS25leCB9IGZyb20gJy4uL3NyYy90eXBlZEtuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vdGVzdEVudGl0aWVzJztcblxuXG4gICAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IGF3YWl0IHR5cGVkS25leFxuICAgICAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgICAgIC5maW5kQnlQcmltYXJ5S2V5KFwiaWRcIiwgJ251bGxhYmxlQ2F0ZWdvcnknKTtcblxuICAgICAgICAgICAgICAgIGlmIChpdGVtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbS5udWxsYWJsZUNhdGVnb3J5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIGApO1xuICAgICAgICBhc3NlcnQubm90RXF1YWwoYWxsRGlhZ25vc3RpY3MubGVuZ3RoLCAwKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgZmluZEJ5UHJpbWFyeUtleSBhY2NlcHQgRGF0ZSBvYmplY3RzIGluIHNlbGVjdCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBhd2FpdCB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgICAgICAuZmluZEJ5UHJpbWFyeUtleShcImlkXCIsICdiaXJ0aERhdGUnKTtcblxuICAgICAgICAgICAgICAgIGlmIChpdGVtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbS5iaXJ0aERhdGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgYCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChhbGxEaWFnbm9zdGljcy5sZW5ndGgsIDApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgZmluZEJ5UHJpbWFyeUtleSBhY2NlcHQgdW5rbm93biBvYmplY3RzIGluIHNlbGVjdCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBhd2FpdCB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgICAgICAuZmluZEJ5UHJpbWFyeUtleShcImlkXCIsICdleHRyYURhdGEnKTtcblxuICAgICAgICAgICAgICAgIGlmIChpdGVtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbS5leHRyYURhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgYCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChhbGxEaWFnbm9zdGljcy5sZW5ndGgsIDApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuXG4gICAgaXQoJ3Nob3VsZCBmaW5kQnlQcmltYXJ5S2V5IGFjY2VwdCBudWxsYWJsZSBEYXRlIG9iamVjdHMgaW4gc2VsZWN0JywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IGFsbERpYWdub3N0aWNzID0gZ2V0RGlhZ25vc3RpY3MoYFxuICAgICAgICAgICAgaW1wb3J0ICogYXMga25leCBmcm9tICdrbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFR5cGVkS25leCB9IGZyb20gJy4uL3NyYy90eXBlZEtuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vdGVzdEVudGl0aWVzJztcblxuXG4gICAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZWRLbmV4ID0gbmV3IFR5cGVkS25leChrbmV4KHsgY2xpZW50OiAncG9zdGdyZXNxbCcgfSkpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IGF3YWl0IHR5cGVkS25leFxuICAgICAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgICAgIC5maW5kQnlQcmltYXJ5S2V5KFwiaWRcIiwgJ2RlYXRoRGF0ZScpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtLmRlYXRoRGF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICBgKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKGFsbERpYWdub3N0aWNzLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBmaW5kQnlQcmltYXJ5S2V5IGFjY2VwdCBudWxsYWJsZSBzdHJpbmcgb2JqZWN0cyBpbiBzZWxlY3QnLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgYWxsRGlhZ25vc3RpY3MgPSBnZXREaWFnbm9zdGljcyhgXG4gICAgICAgICAgICBpbXBvcnQgKiBhcyBrbmV4IGZyb20gJ2tuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVHlwZWRLbmV4IH0gZnJvbSAnLi4vc3JjL3R5cGVkS25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi90ZXN0RW50aXRpZXMnO1xuXG5cbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gYXdhaXQgdHlwZWRLbmV4XG4gICAgICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAgICAgLmZpbmRCeVByaW1hcnlLZXkoXCJpZFwiLCAnc29tZU51bGxhYmxlVmFsdWUnKTtcblxuICAgICAgICAgICAgICAgIGlmIChpdGVtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbS5zb21lTnVsbGFibGVWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICBgKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKGFsbERpYWdub3N0aWNzLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG5cbiAgICBpdCgnc2hvdWxkIGZpbmRCeVByaW1hcnlLZXkgYWNjZXB0IG9wdGlvbmFsIHN0cmluZyBvYmplY3RzIGluIHNlbGVjdCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBhd2FpdCB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAucXVlcnkoVXNlcilcbiAgICAgICAgICAgICAgICAuZmluZEJ5UHJpbWFyeUtleShcImlkXCIsICdzb21lT3B0aW9uYWxWYWx1ZScpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtLnNvbWVPcHRpb25hbFZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIGApO1xuICAgICAgICBhc3NlcnQuZXF1YWwoYWxsRGlhZ25vc3RpY3MubGVuZ3RoLCAwKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBjb3JyZWN0IHR5cGUgZnJvbSBsZWZ0T3V0ZXJKb2luVGFibGVPbkZ1bmN0aW9uJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IGFsbERpYWdub3N0aWNzID0gZ2V0RGlhZ25vc3RpY3MoYFxuICAgICAgICAgICAgaW1wb3J0ICogYXMga25leCBmcm9tICdrbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFR5cGVkS25leCB9IGZyb20gJy4uL3NyYy90eXBlZEtuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVXNlciwgVXNlclNldHRpbmcgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBhd2FpdCB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAgICAgLmxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24oJ290aGVyVXNlcicsIFVzZXIsIGpvaW4gPT4ge1xuICAgICAgICAgICAgICAgICAgICBqb2luLm9uKCdpZCcsICc9JywgJ3VzZXIySWQnKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zZWxlY3QoJ290aGVyVXNlci5uYW1lJywgJ3VzZXIyLm51bWVyaWNWYWx1ZScpXG4gICAgICAgICAgICAgICAgLmdldEZpcnN0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXRlbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGl0ZW0udXNlcjIubnVtZXJpY1ZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbS5vdGhlclVzZXIubmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICBgKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKGFsbERpYWdub3N0aWNzLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBub3QgcmV0dXJuIHR5cGUgZnJvbSBsZWZ0T3V0ZXJKb2luVGFibGVPbkZ1bmN0aW9uIHdpdGggbm90IHNlbGVjdGVkIGZyb20gam9pbmVkIHRhYmxlJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IGFsbERpYWdub3N0aWNzID0gZ2V0RGlhZ25vc3RpY3MoYFxuICAgICAgICAgICAgaW1wb3J0ICogYXMga25leCBmcm9tICdrbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFR5cGVkS25leCB9IGZyb20gJy4uL3NyYy90eXBlZEtuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVXNlciwgVXNlclNldHRpbmcgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBhd2FpdCB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAgICAgLmxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24oJ290aGVyVXNlcicsIFVzZXIsIGpvaW4gPT4ge1xuICAgICAgICAgICAgICAgICAgICBqb2luLm9uKCdpZCcsICc9JywgJ3VzZXIySWQnKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zZWxlY3QoJ290aGVyVXNlci5uYW1lJywgJ3VzZXIyLm51bWVyaWNWYWx1ZScpXG4gICAgICAgICAgICAgICAgLmdldEZpcnN0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXRlbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGl0ZW0ub3RoZXJVc2VyLmlkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIGApO1xuICAgICAgICBhc3NlcnQubm90RXF1YWwoYWxsRGlhZ25vc3RpY3MubGVuZ3RoLCAwKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCByZXR1cm4gdHlwZSBmcm9tIGxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24gd2l0aCBub3Qgc2VsZWN0ZWQgZnJvbSBtYWluIHRhYmxlJywgZG9uZSA9PiB7XG4gICAgICAgIGNvbnN0IGFsbERpYWdub3N0aWNzID0gZ2V0RGlhZ25vc3RpY3MoYFxuICAgICAgICAgICAgaW1wb3J0ICogYXMga25leCBmcm9tICdrbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFR5cGVkS25leCB9IGZyb20gJy4uL3NyYy90eXBlZEtuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVXNlciwgVXNlclNldHRpbmcgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBhd2FpdCB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAucXVlcnkoVXNlclNldHRpbmcpXG4gICAgICAgICAgICAgICAgLmxlZnRPdXRlckpvaW5UYWJsZU9uRnVuY3Rpb24oJ290aGVyVXNlcicsIFVzZXIsIGpvaW4gPT4ge1xuICAgICAgICAgICAgICAgICAgICBqb2luLm9uKCdpZCcsICc9JywgJ3VzZXIySWQnKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zZWxlY3QoJ290aGVyVXNlci5uYW1lJywgJ3VzZXIyLm51bWVyaWNWYWx1ZScpXG4gICAgICAgICAgICAgICAgLmdldEZpcnN0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXRlbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGl0ZW0uaWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgYCk7XG4gICAgICAgIGFzc2VydC5ub3RFcXVhbChhbGxEaWFnbm9zdGljcy5sZW5ndGgsIDApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuXG4gICAgaXQoJ3Nob3VsZCAgcmV0dXJuIGFueSB3aGVuIGtlZXBGbGF0KCkgaXMgdXNlZCcsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIsIFVzZXJTZXR0aW5nIH0gZnJvbSAnLi90ZXN0RW50aXRpZXMnO1xuXG5cbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gYXdhaXQgdHlwZWRLbmV4XG4gICAgICAgICAgICAgICAgLnF1ZXJ5KFVzZXJTZXR0aW5nKVxuICAgICAgICAgICAgICAgIC5sZWZ0T3V0ZXJKb2luVGFibGVPbkZ1bmN0aW9uKCdvdGhlclVzZXInLCBVc2VyLCBqb2luID0+IHtcbiAgICAgICAgICAgICAgICAgICAgam9pbi5vbignaWQnLCAnPScsICd1c2VyMklkJyk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuc2VsZWN0KCdvdGhlclVzZXIubmFtZScsICd1c2VyMi5udW1lcmljVmFsdWUnKVxuICAgICAgICAgICAgICAgIC5rZWVwRmxhdCgpXG4gICAgICAgICAgICAgICAgLmdldFNpbmdsZSgpO1xuXG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtLmRvZXNOb3RFeGlzdCk7XG5cblxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgYCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChhbGxEaWFnbm9zdGljcy5sZW5ndGgsIDApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYWNjZXB0IHN0cmluZyBjb2x1bW4gaW4gb3JkZXJCeScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAgICAgICAgIC5vcmRlckJ5KGM9PmMuaWQpXG4gICAgICAgICAgICAgICAgICAgIC5nZXRNYW55KCk7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQubGVuZ3RoKTtcblxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgYCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChhbGxEaWFnbm9zdGljcy5sZW5ndGgsIDApO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYWNjZXB0IERhdGUgY29sdW1uIGluIG9yZGVyQnknLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgYWxsRGlhZ25vc3RpY3MgPSBnZXREaWFnbm9zdGljcyhgXG4gICAgICAgICAgICBpbXBvcnQgKiBhcyBrbmV4IGZyb20gJ2tuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVHlwZWRLbmV4IH0gZnJvbSAnLi4vc3JjL3R5cGVkS25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi90ZXN0RW50aXRpZXMnO1xuXG5cbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHlwZWRLbmV4XG4gICAgICAgICAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgICAgICAgICAub3JkZXJCeShjPT5jLmJpcnRoRGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgLmdldE1hbnkoKTtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdC5sZW5ndGgpO1xuXG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICBgKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKGFsbERpYWdub3N0aWNzLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBhY2NlcHQgbnVsbGFibGUgRGF0ZSBjb2x1bW4gaW4gb3JkZXJCeScsIGRvbmUgPT4ge1xuICAgICAgICBjb25zdCBhbGxEaWFnbm9zdGljcyA9IGdldERpYWdub3N0aWNzKGBcbiAgICAgICAgICAgIGltcG9ydCAqIGFzIGtuZXggZnJvbSAna25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBUeXBlZEtuZXggfSBmcm9tICcuLi9zcmMvdHlwZWRLbmV4JztcbiAgICAgICAgICAgIGltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3Rlc3RFbnRpdGllcyc7XG5cblxuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVkS25leCA9IG5ldyBUeXBlZEtuZXgoa25leCh7IGNsaWVudDogJ3Bvc3RncmVzcWwnIH0pKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0eXBlZEtuZXhcbiAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5KFVzZXIpXG4gICAgICAgICAgICAgICAgICAgIC5vcmRlckJ5KGM9PmMuZGVhdGhEYXRlKVxuICAgICAgICAgICAgICAgICAgICAuZ2V0TWFueSgpO1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0Lmxlbmd0aCk7XG5cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIGApO1xuICAgICAgICBhc3NlcnQuZXF1YWwoYWxsRGlhZ25vc3RpY3MubGVuZ3RoLCAwKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCBhY2NlcHQgZm9yZWlnbiBrZXkgY29sdW1uIGluIG9yZGVyQnknLCBkb25lID0+IHtcbiAgICAgICAgY29uc3QgYWxsRGlhZ25vc3RpY3MgPSBnZXREaWFnbm9zdGljcyhgXG4gICAgICAgICAgICBpbXBvcnQgKiBhcyBrbmV4IGZyb20gJ2tuZXgnO1xuICAgICAgICAgICAgaW1wb3J0IHsgVHlwZWRLbmV4IH0gZnJvbSAnLi4vc3JjL3R5cGVkS25leCc7XG4gICAgICAgICAgICBpbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi90ZXN0RW50aXRpZXMnO1xuXG5cbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlZEtuZXggPSBuZXcgVHlwZWRLbmV4KGtuZXgoeyBjbGllbnQ6ICdwb3N0Z3Jlc3FsJyB9KSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHlwZWRLbmV4XG4gICAgICAgICAgICAgICAgICAgIC5xdWVyeShVc2VyKVxuICAgICAgICAgICAgICAgICAgICAub3JkZXJCeShjPT5jLmNhdGVnb3J5KVxuICAgICAgICAgICAgICAgICAgICAuZ2V0TWFueSgpO1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0Lmxlbmd0aCk7XG5cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIGApO1xuICAgICAgICBhc3NlcnQubm90RXF1YWwoYWxsRGlhZ25vc3RpY3MubGVuZ3RoLCAwKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfSk7XG59KTtcbiJdfQ==