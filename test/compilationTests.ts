
// tslint:disable:no-multiline-string
import { assert } from 'chai';
import { Project } from 'ts-simple-ast';

describe('compile time typed-knex', function() {
    this.timeout(1000000);

    it('should return type with properties from the selectColumn method', (done) => {
        const project = new Project({
            tsConfigFilePath: './tsconfig.json',
        });

        project.createSourceFile(
            'test/test.ts'
            ,
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .selectColumn('id')
                    .firstItem();

                console.log(result.id);

            })();
        `);

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        done();
    });


    it('should error on calling property not used in selectColumn method', (done) => {
        const project = new Project({
            tsConfigFilePath: './tsconfig.json',
        });

        project.createSourceFile(
            'test/test.ts'
            ,
            `
            import * as knex from 'knex';
            import { TypedKnex } from '../src/typedKnex';
            import { User } from './testEntities';


            (async () => {

                const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
                const result = await typedKnex
                    .query(User)
                    .selectColumn('id')
                    .firstItem();

                console.log(result.unknown);

            })();
        `);

        assert.notEqual(project.getPreEmitDiagnostics().length, 0);

        done();
    });
});
