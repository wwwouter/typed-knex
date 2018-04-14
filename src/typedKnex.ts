// tslint:disable:use-named-parameter
import * as Knex from 'knex';
import { getColumn, getTableMetadata } from './decorators';
import { unflatten } from './unflatten';

type TransformAll<T, IT> = {
    [Key in keyof T]: IT
};


// type FilterNonObjects<T> = {
//     [Key in keyof T]: T[Key] extends {} ? T[Key] : never;
// };

type ObjectPropertyNames<T> = { [K in keyof T]: T[K] extends object ? K : never }[keyof T];


// class Test {
//     public id!: string;
//     public c!: { someting: string };
// }

// type F001 = ObjectPropertyNames<Test>;

// const fo001 = {} as F001;
// // tslint:disable-next-line:no-unused-expression
// fo001.c;
// // tslint:disable-next-line:no-unused-expression
// fo001.id;


export class TypedKnex {

    constructor(private knex: Knex) {

    }

    public query<T>(tableClass: new () => T): TypedQueryBuilder<T> {

        return new TypedQueryBuilder<T>(tableClass, this.knex);
    }

}

class TypedQueryBuilder<Model, Row = {}> {

    private queryBuilder: Knex.QueryBuilder;
    private tableName: string;

    constructor(private tableClass: new () => Model, private knex: Knex) {
        this.tableName = this.getTableName(tableClass);
        this.queryBuilder = this.knex.from(this.tableName);
    }


    public selectWithName<Prev extends Row, K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2?: K2): TypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, Pick<Model[K1], K2>> & Prev>;
    public selectWithName<K extends keyof Model>(key1: K): TypedQueryBuilder<Model, Pick<Model, K> & Row> {


        if (arguments.length === 1) {
            this.queryBuilder.select(arguments[0]);
        } else if (arguments.length === 2) {
            // find name of table ... Practitioner.prototype.employment
            this.queryBuilder.select(this.tableName + '.' + this.getTableName(this.tableClass.prototype[arguments[1]]) + ' as ' + arguments[0] + '_' + arguments[1]);
        }
        return this as any;
    }

    public where<K extends keyof Model>(key1: K, value: Model[K]): this;
    public where<K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2?: K2, value?: Model[K1][K2]): this {

        if (arguments.length === 2) {

            this.queryBuilder.where(arguments[0], arguments[1]);
        }

        return this;
    }

    public innerJoin<K extends ObjectPropertyNames<Model>>(key1: K): this {
        // public innerJoin<K1 extends keyof FilterNonObjects<Model>, K2 extends keyof FilterNonObjects<Model>[K1]>(key1: K1, key2?: K2): this {

        if (arguments.length === 1) {

            const tableToJoinColumn = getColumn(this.tableClass.prototype, arguments[0]);
            const tableToJoinName = this.getTableName(tableToJoinColumn.columnClass);
            const tableToJoinAlias = arguments[0];
            const tableToJoinJoinColumnName = `${tableToJoinAlias}.id`;
            const tableJoinedColumnName = `${this.getTableName(this.tableClass)}.${arguments[0]}Id`;

            this.queryBuilder.join(`${tableToJoinName} as ${tableToJoinAlias}`, tableToJoinJoinColumnName, tableJoinedColumnName);
        }

        return this;
    }



    public async firstItem(): Promise<Row | undefined> {
        const items = await this.queryBuilder;
        if (!items || items.length === 0) {
            return undefined;
        }
        return unflatten(items[0]);
    }


    public knexFunction(f: (query: Knex.QueryBuilder) => void) {
        f(this.queryBuilder);
    }

    public getColumnName<K extends keyof Model>(key1: K): string;
    public getColumnName<K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2?: K2): string {
        if (!key2) {
            return key1;
        }
        return key1 + '_' + key2;
    }

    public toQuery() {
        return this.queryBuilder.toQuery();
    }


    private getTableName(tableClass: new () => any) {
        try {

            return getTableMetadata(tableClass).tableName;
        } catch (e) {
            throw new Error(`Cannot get table name from class ${tableClass.name} `);
        }
    }


}

