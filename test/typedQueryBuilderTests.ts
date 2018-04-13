import { assert } from 'chai';
import * as knex from 'knex';
import { TypedKnex } from '../src/typedKnex';

describe('TypedKnex', () => {

    it('should map columns to TypedKnexColumns', (done) => {

        const typedKnex = new TypedKnex(knex({ client: 'postgresql' }));
        assert.equal(typedKnex, typedKnex);
        done();
    });
});
