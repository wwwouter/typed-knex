import * as knex from 'knex';
import { unflatten } from './unflatten';


type TransformAll<T, IT> = {
    [Key in keyof T]: IT
}

export class TypedKnex {

    constructor(private knex: knex) {

    }

    public query<T>(type: new () => T): TypedQueryBuilder<T> {

        return new TypedQueryBuilder<T>(type, this.knex);
    }

}

class TypedQueryBuilder<Model, Row = {}>{

    private queryBuilder: knex.QueryBuilder;
    private tableName: string;

    constructor(private type: new () => Model, private knex: knex) {
        this.tableName = this.getTableName(type);
        this.queryBuilder = this.knex.from(this.tableName);
    }

    private getTableName(type: new () => any) {
        // TODO: if missing error!
        return type.prototype.typedKnextableName;
    }

    selectWithName<Prev extends Row, K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2?: K2): TypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, Pick<Model[K1], K2>> & Prev>;
    selectWithName<K extends keyof Model>(key1: K): TypedQueryBuilder<Model, Pick<Model, K> & Row> {


        if (arguments.length === 1) {
            this.queryBuilder.select(arguments[0])
        } else if (arguments.length === 2) {
            // find name of table ... Practitioner.prototype.employment
            this.queryBuilder.select(this.tableName + '.' + this.getTableName(this.type.prototype[arguments[1]]) + ' as ' + arguments[0] + '_' + arguments[1])
        }
        return this as any;
    }

    public async firstItem(): Promise<Row | undefined> {
        const items = await this.queryBuilder;
        if (!items || items.length === 0) {
            return undefined;
        }
        return unflatten(items[0]);
    }


    public knexFunction(f: (query: knex.QueryBuilder) => void) {
        f(this.queryBuilder);
    }

    public getColumnName<K extends keyof Model>(key1: K): string;
    public getColumnName<K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2?: K2): string {
        if (!key2) {
            return key1;
        }
        return key1 + '_' + key2;
    }
}

