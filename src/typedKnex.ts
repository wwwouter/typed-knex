// tslint:disable:use-named-parameter
import * as flat from 'flat';
import * as Knex from 'knex';
import { getColumnInformation, getColumnProperties, getTableMetadata } from './decorators';

export function unflatten(o: any): any {
    if (o instanceof Array) {
        return o.map((i) => unflatten(i));
    }
    return flat.unflatten(o);
}

export class TypedKnex {

    constructor(private knex: Knex) { }

    public query<T>(tableClass: new () => T): ITypedQueryBuilder<T, {}> {
        return new TypedQueryBuilder<T>(tableClass, this.knex);
    }
}


let beforeInsertTransform = undefined as undefined | ((item: any, typedQueryBuilder: TypedQueryBuilder<{}, {}>) => any);

export function registerBeforeInsertTransform<T>(f: (item: T, typedQueryBuilder: TypedQueryBuilder<{}, {}>) => T) {
    beforeInsertTransform = f;
}


let beforeUpdateTransform = undefined as undefined | ((item: any, typedQueryBuilder: TypedQueryBuilder<{}, {}>) => any);

export function registerBeforeUpdateTransform<T>(f: (item: T, typedQueryBuilder: TypedQueryBuilder<{}, {}>) => T) {
    beforeUpdateTransform = f;
}


export interface ITypedQueryBuilder<ModelType, Row> {
    where: IWhere<ModelType, Row>;
    //     whereNot: IWhere<ModelType, Row>;
    selectColumns: ISelectColumns<ModelType, Row>;
    selectColumn: ISelectColumn<ModelType, Row>;
    orderBy: IKeysAsParametersReturnQueryBuider<ModelType, Row>;
    innerJoinColumn: IKeysAsParametersReturnQueryBuider<ModelType, Row>;
    leftOuterJoinColumn: IKeysAsParametersReturnQueryBuider<ModelType, Row>;

    whereColumns: IWhereCompareTwoColumns<ModelType, Row>;

    whereNull: IKeysAsParametersReturnQueryBuider<ModelType, Row>;
    whereNotNull: IKeysAsParametersReturnQueryBuider<ModelType, Row>;

    innerJoinTable: IJoinTable<ModelType, Row>;
    leftOuterJoinTable: IJoinTable<ModelType, Row>;

    leftOuterJoinTableOnFunction: IJoinTableMultipleOnClauses<ModelType, Row>;


    selectRaw: ISelectRaw<ModelType, Row>;



    findById: IFindById<ModelType, Row>;

    limit(value: number): ITypedQueryBuilder<ModelType, Row>;
    offset(value: number): ITypedQueryBuilder<ModelType, Row>;

    firstItemOrNull(): Promise<Row | null>;
    firstItem(): Promise<Row>;
    list(): Promise<Row[]>;
    //     knexFunction(f: (query: Knex.QueryBuilder) => void): void;
    toQuery(): string;

    insert(newObject: Partial<ModelType>): Promise<void>;
    countResult(): Promise<number>;
    delById(id: string): Promise<void>;
    update(id: string, item: Partial<ModelType>): Promise<void>;


}

export type TransformAll<T, IT> = {
    [Key in keyof T]: IT
};

export type FilterObjectsOnly<T> = { [K in keyof T]: T[K] extends object ? K : never }[keyof T];
export type FilterNonObjects<T> = { [K in keyof T]: T[K] extends object ? never : K }[keyof T];

export type ObjectToPrimitive<T> =
    T extends String ? string :
    T extends Number ? number :
    T extends Boolean ? boolean : never;

export type Operator = '=' | '!=';



export interface IConstructor<T> {
    new(...args: any[]): T;
}




export type AddPropertyWithType<Original, NewKey extends keyof TypeWithIndexerOf<NewKeyType>, NewKeyType> = Original & Pick<TypeWithIndexerOf<NewKeyType>, NewKey>;

export interface IKeysAsArguments<Model, Return> {

    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keys: string[]): Return;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3): Return;
    <K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2: K2): Return;
    <K extends keyof Model>(key1: K): Return;

}

// tslint:disable-next-line:no-empty-interfaces
export interface IKeysAsParametersReturnQueryBuider<Model, Row> extends IKeysAsArguments<Model, ITypedQueryBuilder<Model, Row>> {
}

// export interface IJoinColumn<Model, Row> extends IKeysAsArguments<Model, ITypedQueryBuilder<Model, Row>> {

// }
// export interface IJoinColumn<Model, Row> {
//     <K1 extends FilterObjectsOnly<Model>, K2 extends FilterObjectsOnly<Model[K1]>>(key1: K1, key2: K2, ...keys: string[]): ITypedQueryBuilder<Model, Row>;
//     <K1 extends FilterObjectsOnly<Model>, K2 extends FilterObjectsOnly<Model[K1]>>(key1: K1, key2: K2): ITypedQueryBuilder<Model, Row>;
//     <K extends FilterObjectsOnly<Model>>(key1: K): ITypedQueryBuilder<Model, Row>;

// }

export type TypeWithIndexerOf<T> = { [key: string]: T };

export interface IJoinTable<Model, Row> {
    <NewPropertyType, NewPropertyKey extends keyof TypeWithIndexerOf<NewPropertyType>, L1K1 extends keyof AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, L2K1 extends keyof AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, L2K2 extends keyof AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>[L2K1]>(newPropertyKey: NewPropertyKey, newPropertyClass: new () => NewPropertyType, column1: [L1K1] | [L2K1, L2K2], operator: Operator, column2: [L1K1] | [L2K1, L2K2]): ITypedQueryBuilder<AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, Row>;
}



export interface IJoinOnClause<Model> {
    // <L1K1 extends keyof Model, L2K1 extends keyof Model, L2K2 extends keyof Model[L2K1]>(column1: [L1K1] | [L2K1, L2K2], operator: Operator, column2: [L1K1] | [L2K1, L2K2]): IJoinOnClause<Model>;
    // <L1K1 extends keyof Model, L2K1 extends keyof Model, L2K2 extends keyof Model[L2K1]>(column1: [L1K1] | [L2K1, L2K2], operator: Operator, column2: [L1K1] | [L2K1, L2K2]): IJoinOnClause<Model>;
    onColumns: <L1K1 extends keyof Model, L2K1 extends keyof Model, L2K2 extends keyof Model[L2K1]>(column1: [L1K1] | [L2K1, L2K2], operator: Operator, column2: [L1K1] | [L2K1, L2K2]) => IJoinOnClause<Model>;
    onNull: IKeysAsParametersReturnQueryBuider<Model, IJoinOnClause<Model>>;
}

// interface

export interface IJoinTableMultipleOnClauses<Model, Row> {
    // <NewPropertyType, NewPropertyKey extends keyof TypeWithIndexerOf<NewPropertyType>, L1K1 extends keyof AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, L2K1 extends keyof AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, L2K2 extends keyof AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>[L2K1]>(newPropertyKey: NewPropertyKey, newPropertyClass: new () => NewPropertyType, column1: [L1K1] | [L2K1, L2K2], operator: Operator, column2: [L1K1] | [L2K1, L2K2]): ITypedQueryBuilder<AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, Row>;
    <NewPropertyType, NewPropertyKey extends keyof TypeWithIndexerOf<NewPropertyType>>(newPropertyKey: NewPropertyKey, newPropertyClass: new () => NewPropertyType, on: (join: IJoinOnClause<AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>>) => void): ITypedQueryBuilder<AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, Row>;
}

export interface IWhereCompareTwoColumns<Model, Row> {

    // (): { Left: () : { RIght: IKeysAsArguments<Model, ITypedQueryBuilder<Model, Row>> } };

    // (): { left: IKeysAsArguments<Model, { right: IKeysAsArguments<Model, ITypedQueryBuilder<Model, Row>> }> };


    <L1K1 extends keyof Model, L2K1 extends keyof Model, L2K2 extends keyof Model[L2K1]>(column1: [L1K1] | [L2K1, L2K2], operator: Operator, column2: [L1K1] | [L2K1, L2K2]): ITypedQueryBuilder<Model, Row>;


}



// NM extends AddPropertyWithType<Model, NewPropertyKey, NewPropertyType> werkt dat?

// function pluck2<T, K extends keyof IndexType<T>, TO>(names: K, newClass: new () => T, oldClass: new () => TO): Pick<IndexType<T>, K> & TO {
//     return {} as any;
// }



export interface ISelectRaw<Model, Row> {
    <TReturn extends Boolean | String | Number, TName extends keyof TypeWithIndexerOf<TReturn>>(name: TName, returnType: IConstructor<TReturn>, query: string): ITypedQueryBuilder<Model, Pick<TypeWithIndexerOf<ObjectToPrimitive<TReturn>>, TName> & Row>;
}

export interface ISelectColumn<Model, Row> {
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keys: string[]): ITypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, TransformAll<Pick<Model[K1], K2>, TransformAll<Pick<Model[K1][K2], K3>, any>>> & Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3): ITypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, TransformAll<Pick<Model[K1], K2>, Pick<Model[K1][K2], K3>>> & Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2: K2): ITypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, Pick<Model[K1], K2>> & Row>;
    <K extends keyof Model>(key1: K): ITypedQueryBuilder<Model, Pick<Model, K> & Row>;
}

// export interface IOrderBy<Model, Row> {
//     <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keys: string[]): ITypedQueryBuilder<Model, Row>;
//     <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3): ITypedQueryBuilder<Model, Row>;
//     <K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2: K2): ITypedQueryBuilder<Model, Row>;
//     <K extends keyof Row>(key1: K): ITypedQueryBuilder<Model, Row>;
// }


export interface ISelectColumns<Model, Row> {
    <Prev extends Row, K1 extends FilterObjectsOnly<Model>, K2 extends FilterNonObjects<Model[K1]>>(key1: K1, keys2: K2[]): ITypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, Pick<Model[K1], K2>> & Prev>;
    <K extends FilterNonObjects<Model>>(keys: K[]): ITypedQueryBuilder<Model, Pick<Model, K> & Row>;
}

export interface IFindById<Model, Row> {
    <Prev extends Row, K1 extends FilterObjectsOnly<Model>, K2 extends FilterNonObjects<Model[K1]>>(id: string, key1: K1, keys2: K2[]): Promise<TransformAll<Pick<Model, K1>, Pick<Model[K1], K2>> & Prev | void>;
    <K extends FilterNonObjects<Model>>(id: string, keys: K[]): Promise<Pick<Model, K> & Row | void>;
}

export interface IWhere<Model, Row> {
    <K extends FilterNonObjects<Model>>(key1: K, value: Model[K]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends FilterNonObjects<Model[K1]>>(key1: K1, key2: K2, value: Model[K1][K2]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends FilterNonObjects<Model[K1][K2]>>(key1: K1, key2: K2, key3: K3, value: Model[K1][K2][K3]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keysAndValues: any[]): ITypedQueryBuilder<Model, Row>;
}


export class TypedQueryBuilder<ModelType, Row = {}> implements ITypedQueryBuilder<ModelType, Row> {
    public columns: { name: string; }[];

    private queryBuilder: Knex.QueryBuilder;
    private tableName: string;
    private extraJoinedProperties: { name: string, propertyType: new () => any }[];

    constructor(private tableClass: new () => ModelType, private knex: Knex) {
        this.tableName = getTableMetadata(tableClass).tableName;
        this.columns = getColumnProperties(tableClass);

        this.queryBuilder = this.knex.from(this.tableName);

        this.extraJoinedProperties = [];
    }

    public async delById(id: string) {
        await this.queryBuilder.del().where('id', id);
    }

    public async insert(newObject: Partial<ModelType>) {
        await this.insertItems([newObject]);
    }

    public async insertItems(items: Partial<ModelType>[]) {
        items = [...items];

        for (let item of items) {

            if (beforeInsertTransform) {
                item = beforeInsertTransform(item, this);
            }
        }

        while (items.length > 0) {
            const chunk = items.splice(0, 500);
            await this.knex.from(this.tableName).insert(chunk);
        }
    }

    public async update(id: string, item: Partial<ModelType>) {
        if (beforeUpdateTransform) {
            item = beforeUpdateTransform(item, this);
        }

        await this.queryBuilder.update(item).where('id', id);
    }

    public async updateItems(items: { id: string, data: Partial<ModelType> }[]) {
        items = [...items];
        while (items.length > 0) {
            const chunk = items.splice(0, 500);

            let sql = '';
            for (const item of chunk) {
                const query = this.knex.from(this.tableName);
                if (beforeUpdateTransform) {
                    item.data = beforeUpdateTransform(item.data, this);
                }
                query.update(item.data);
                sql += query.where('id', item.id).toString().replace('?', '\\?') + ';\n';
            }

            // const knexTransaction = this.transactionProvider.getKnexTransaction();
            // if (knexTransaction) {
            // await knexTransaction.raw(sql);
            // } else {
            // await this.knexProvider.knex.raw(sql);
            await this.knex.raw(sql);
            // }
        }
    }

    public limit(value: number) {
        this.queryBuilder.limit(value);
        return this as any;
    }

    public offset(value: number) {
        this.queryBuilder.offset(value);
        return this as any;
    }

    public async findById(id: string, columns: (keyof ModelType)[]) {
        return await this.queryBuilder.select(columns as any).where(this.tableName + '.id', id).first();
    }

    public async  countResult() {
        const query = this.queryBuilder.count();
        const result = await query;
        if (result.length === 0) {
            return 0;
        }
        return result[0].count;
    }

    public async firstItemOrNull() {
        const items = await this.queryBuilder;
        if (!items || items.length === 0) {
            return null;
        }
        return unflatten(items[0]);
    }


    public async firstItem() {
        const items = await this.queryBuilder;
        if (!items || items.length === 0) {
            throw new Error('Item not found.');
        }
        return unflatten(items[0]);
    }

    public selectColumn() {
        if (arguments.length === 1) {
            this.queryBuilder.select(this.getColumnName(arguments[0]) + ' as ' + arguments[0]);
        } else {

            this.queryBuilder.select(this.getColumnName(...arguments) + ' as ' + this.getColumnSelectAlias(...arguments));
        }
        return this as any;
    }

    public selectColumns() {
        const argumentsKeys = arguments[arguments.length - 1];
        for (const key of argumentsKeys) {
            if (arguments.length === 1) {
                this.queryBuilder.select(this.getColumnName(key));
            } else {

                this.queryBuilder.select(this.getColumnName(arguments[0], key) + ' as ' + this.getColumnSelectAlias(arguments[0], key));
            }
        }
        return this as any;
    }

    public orderBy() {
        if (arguments.length === 1) {
            this.queryBuilder.orderBy(this.getColumnName(arguments[0]));
        } else {

            this.queryBuilder.orderBy(this.getColumnSelectAlias(...arguments));
        }
        return this as any;
    }

    public whereNull() {
        this.queryBuilder.whereNull(this.getColumnName(...arguments));
        return this;
    }

    public whereNotNull() {
        this.queryBuilder.whereNotNull(this.getColumnName(...arguments));
        return this;
    }

    public async list() {
        const items = await this.queryBuilder;
        return unflatten(items) as Row[];
    }

    public selectRaw() {
        const name = arguments[0];
        const query = arguments[2];

        this.queryBuilder.select(this.knex.raw(`(${query}) as "${name}"`));
        return this as any;
    }

    public innerJoinColumn() {
        return this.joinColumn('innerJoin', arguments);
    }
    public leftOuterJoinColumn() {
        return this.joinColumn('leftOuterJoin', arguments);
    }

    public innerJoinTable() {
        const newPropertyKey = arguments[0];
        const newPropertyType = arguments[1];
        const column1Parts = arguments[2];
        const operator = arguments[3];
        const column2Parts = arguments[4];

        this.extraJoinedProperties.push({ name: newPropertyKey, propertyType: newPropertyType });

        const tableToJoinClass = newPropertyType;
        const tableToJoinName = getTableMetadata(tableToJoinClass).tableName;
        const tableToJoinAlias = newPropertyKey;

        const table1Column = this.getColumnName(...column1Parts);
        const table2Column = this.getColumnName(...column2Parts);

        this.queryBuilder.innerJoin(`${tableToJoinName} as ${tableToJoinAlias}`, table1Column, operator, table2Column);

        return this;
    }

    public leftOuterJoinTableOnFunction() {
        const newPropertyKey = arguments[0];
        const newPropertyType = arguments[1];

        this.extraJoinedProperties.push({ name: newPropertyKey, propertyType: newPropertyType });

        const tableToJoinClass = newPropertyType;
        const tableToJoinName = getTableMetadata(tableToJoinClass).tableName;
        const tableToJoinAlias = newPropertyKey;

        const onFunction = arguments[2] as (join: IJoinOnClause<any>) => void;

        let knexOnObject: any;
        this.queryBuilder.leftOuterJoin(`${tableToJoinName} as ${tableToJoinAlias}`, function() {
            knexOnObject = this;
        });

        const onObject = {
            onColumns: (column1PartsArray: any, operator: any, column2PartsArray: any) => {
                knexOnObject.on(this.getColumnName(...column1PartsArray), operator, this.getColumnName(...column2PartsArray));
                return onObject;
            },
            onNull: (...args: any[]) => {
                knexOnObject.onNull(this.getColumnName(...args));
                return onObject;
            },
        };
        onFunction(onObject as any);


        return this;
    }

    public leftOuterJoinTable() {
        const newPropertyKey = arguments[0];
        const newPropertyType = arguments[1];
        const column1Parts = arguments[2];
        const operator = arguments[3];
        const column2Parts = arguments[4];

        this.extraJoinedProperties.push({ name: newPropertyKey, propertyType: newPropertyType });

        const tableToJoinClass = newPropertyType;
        const tableToJoinName = getTableMetadata(tableToJoinClass).tableName;
        const tableToJoinAlias = newPropertyKey;

        const table1Column = this.getColumnName(...column1Parts);
        const table2Column = this.getColumnName(...column2Parts);

        this.queryBuilder.leftOuterJoin(`${tableToJoinName} as ${tableToJoinAlias}`, table1Column, operator, table2Column);

        return this;
    }



    public whereColumns() {
        const column1Parts = arguments[0];
        const operator = arguments[1];
        const column2Parts = arguments[2];

        // this.queryBuilder.where(this.getColumnName(column1Parts), operator, this.getColumnName(column2Parts));

        // const rawColumnName1 = typedColumn1.getRawColumnName();
        // const rawColumnName2 = typedColumn2.getRawColumnName();

        // const condition = `${rawColumnName1} = ${rawColumnName2}`;
        // return this.whereRaw(condition) as ITypedQueryBuilder<ModelType>;


        this.queryBuilder.whereRaw(`?? ${operator} ??`, [this.getColumnName(...column1Parts), this.getColumnName(...column2Parts)]);


        return this;
    }


    public toQuery() {
        return this.queryBuilder.toQuery();
    }

    public where() {
        const argumentsExceptLast = [...(arguments as any)].slice(0, -1);
        const value = arguments[arguments.length - 1];
        this.queryBuilder.where(this.getColumnName(...argumentsExceptLast), value);
        return this;
    }

    private joinColumn(joinType: 'innerJoin' | 'leftOuterJoin', args: any) {

        let firstColumnAlias = this.tableName;
        let firstColumnClass = this.tableClass;
        let secondColumnAlias = args[0];
        let secondColumnName = args[0];
        let secondColumnClass = getColumnInformation(firstColumnClass, secondColumnAlias).columnClass;

        for (let i = 1; i < args.length; i++) {
            const beforeSecondColumnAlias = secondColumnAlias;
            const beforeSecondColumnClass = secondColumnClass;

            secondColumnName = args[i];
            secondColumnAlias = beforeSecondColumnAlias + '_' + args[i];
            secondColumnClass = getColumnInformation(beforeSecondColumnClass, args[i]).columnClass;

            firstColumnAlias = beforeSecondColumnAlias;
            firstColumnClass = beforeSecondColumnClass;
        }
        const tableToJoinName = getTableMetadata(secondColumnClass).tableName;
        const tableToJoinAlias = secondColumnAlias;
        const tableToJoinJoinColumnName = `${tableToJoinAlias}.id`;
        const tableJoinedColumnName = `${firstColumnAlias}.${secondColumnName}Id`;

        if (joinType === 'innerJoin') {
            this.queryBuilder.innerJoin(`${tableToJoinName} as ${tableToJoinAlias}`, tableToJoinJoinColumnName, tableJoinedColumnName);
        } else if (joinType === 'leftOuterJoin') {
            this.queryBuilder.leftOuterJoin(`${tableToJoinName} as ${tableToJoinAlias}`, tableToJoinJoinColumnName, tableJoinedColumnName);

        }

        return this;

    }

    private getColumnName(...keys: string[]): string {
        if (keys.length === 1) {
            return this.tableName + '.' + keys[0];
        } else {
            let columnName = keys[0];
            let columnAlias = keys[0];
            for (let i = 1; i < keys.length; i++) {
                columnName = columnAlias + '.' + keys[i];
                columnAlias += '_' + keys[i];
            }
            return columnName;
        }
    }

    // private getColumnAlias(...keys: string[]): string {
    //     if (arguments.length === 1) {
    //         return arguments[0];
    //     } else {
    //         let columnAlias = arguments[0];
    //         for (let i = 1; i < arguments.length; i++) {
    //             columnAlias += '_' + arguments[i];
    //         }
    //         return columnAlias;
    //     }
    // }

    private getColumnSelectAlias(...keys: string[]): string {
        if (keys.length === 1) {
            return keys[0];
        } else {
            let columnAlias = keys[0];
            for (let i = 1; i < keys.length; i++) {
                columnAlias += '.' + keys[i];
            }
            return columnAlias;
        }
    }

}
