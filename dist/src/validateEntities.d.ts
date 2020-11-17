import * as Knex from 'knex';
export declare function validateEntities(knex: Knex): Promise<void>;
export declare const validateTables: typeof validateEntities;
