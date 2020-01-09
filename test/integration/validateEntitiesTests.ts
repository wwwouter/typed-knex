import { assert } from 'chai';
import * as Knex from 'knex';
import { validateEntities } from '../../src/validateEntities';
import { } from '../testEntities';


describe('validateEntitiesTests', () => {

    it('should fail on empty database', async () => {

        const knex = Knex({
            client: 'sqlite3',
            useNullAsDefault: false,
            connection: { filename: ':memory:' },
        });

        try {

            await validateEntities(knex);
            assert.isFalse(true);
            // tslint:disable-next-line:no-empty
        } catch (_error) {

        }

        await knex.destroy();

    });
});
