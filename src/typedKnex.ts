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

    public query<T>(tableClass: new () => T): ITypedQueryBuilder<T, T> {
        return new TypedQueryBuilder<T, T>(tableClass, this.knex);
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


class NotImplementedError extends Error {
    constructor() {
        super('Not implemented');
    }


}

export interface ITypedQueryBuilder<ModelType, Row> {
    where: IWhere<ModelType, Row>;
    andWhere: IWhere<ModelType, Row>;
    orWhere: IWhere<ModelType, Row>;
    whereNot: IWhere<ModelType, Row>;
    selectColumns: ISelectColumns<ModelType, Row extends ModelType ? {} : Row>;
    selectColumn: ISelectWithFunctionColumn<ModelType, Row extends ModelType ? {} : Row>;

    // selectColumnFun: ISelectFunColumn<ModelType, Row extends ModelType ? {} : Row>;

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

    whereIn: IWhereIn<ModelType, Row>;
    whereNotIn: IWhereIn<ModelType, Row>;


    whereBetween: IWhereBetween<ModelType, Row>;
    whereNotBetween: IWhereBetween<ModelType, Row>;

    whereExists: IWhereExists<ModelType, Row>;

    orWhereExists: IWhereExists<ModelType, Row>;
    whereNotExists: IWhereExists<ModelType, Row>;
    orWhereNotExists: IWhereExists<ModelType, Row>;


    groupBy: IGroupBy<ModelType, Row>;


    having: IHaving<ModelType, Row>;

    limit(value: number): ITypedQueryBuilder<ModelType, Row>;
    offset(value: number): ITypedQueryBuilder<ModelType, Row>;

    firstItemOrNull(): Promise<Row | null>;
    firstItem(): Promise<Row>;
    list(): Promise<Row[]>;
    useKnexQueryBuilder(f: (query: Knex.QueryBuilder) => void): void;
    toQuery(): string;

    insert(newObject: Partial<ModelType>): Promise<void>;
    countResult(): Promise<number>;
    delById(id: string): Promise<void>;
    update(id: string, item: Partial<ModelType>): Promise<void>;


    whereRaw(sql: string, ...bindings: string[]): ITypedQueryBuilder<ModelType, Row>;

    havingIn(): void;
    havingNotIn(): void;
    havingNull(): void;
    havingNotNull(): void;
    havingExists(): void;
    havingNotExists(): void;
    havingRaw(): void;
    havingBetween(): void;
    havingNotBetween(): void;
    union(): void;
    unionAll(): void;
    returningColumn(): void;
    returningColumns(): void;
    transacting(trx: Knex.Transaction): void;
    minColumn(): void;
    countColumn(): void;
    countDistinctColumn(): void;
    maxColumn(): void;
    sumColumn(): void;
    sumDistinctColumn(): void;
    avgColumn(): void;
    avgDistinctColumn(): void;
    minResult(): void;
    countDistinctResult(): void;
    maxResult(): void;
    sumResult(): void;
    sumDistinctResult(): void;
    avgResult(): void;
    avgDistinctResult(): void;
    increment(): void;
    decrement(): void;
    truncate(): void;
    clearSelect(): void;
    clearWhere(): void;
    clearOrder(): void;
    distinct(): void;
    clone(): void;
    beginTransaction(): Promise<Knex.Transaction>;
    groupByRaw(): void;

    // whereIn — .whereIn(column|columns, array|callback|builder)
    // orWhereIn
    // whereNotIn(column, array|callback|builder) /
    //  .orWhereNotIn
    // .orWhereBetween
    // .orWhereNotBetween

    // https://github.com/tgriesser/knex/pull/2837/files: whereColumns
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

export type Operator = '=' | '!=' | '>' | '<' | string;



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


// tslint:disable-next-line:no-empty-interfaces
interface IReferencedColumn {


}
export interface IJoinTableMultipleOnClauses<Model, Row> {
    // <NewPropertyType, NewPropertyKey extends keyof TypeWithIndexerOf<NewPropertyType>, L1K1 extends keyof AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, L2K1 extends keyof AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, L2K2 extends keyof AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>[L2K1]>(newPropertyKey: NewPropertyKey, newPropertyClass: new () => NewPropertyType, column1: [L1K1] | [L2K1, L2K2], operator: Operator, column2: [L1K1] | [L2K1, L2K2]): ITypedQueryBuilder<AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, Row>;
    <NewPropertyType, NewPropertyKey extends keyof TypeWithIndexerOf<NewPropertyType>>(newPropertyKey: NewPropertyKey, newPropertyClass: new () => NewPropertyType, on: (join: IJoinOnClause<AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>>) => void): ITypedQueryBuilder<AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, Row>;
}

export interface IWhereCompareTwoColumns<Model, Row> {

    // (): { Left: () : { RIght: IKeysAsArguments<Model, ITypedQueryBuilder<Model, Row>> } };

    // (): { left: IKeysAsArguments<Model, { right: IKeysAsArguments<Model, ITypedQueryBuilder<Model, Row>> }> };


    <L1K1 extends keyof Model, L2K1 extends keyof Model, L2K2 extends keyof Model[L2K1]>(column1: [L1K1] | [L2K1, L2K2], operator: Operator, column2: [L1K1] | [L2K1, L2K2] | IReferencedColumn): ITypedQueryBuilder<Model, Row>;


}



// NM extends AddPropertyWithType<Model, NewPropertyKey, NewPropertyType> werkt dat?

// function pluck2<T, K extends keyof IndexType<T>, TO>(names: K, newClass: new () => T, oldClass: new () => TO): Pick<IndexType<T>, K> & TO {
//     return {} as any;
// }

export interface IGroupBy<Model, Row> {
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keys: string[]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2: K2): ITypedQueryBuilder<Model, Row>;
    <K extends keyof Model>(key1: K): ITypedQueryBuilder<Model, Row>;
}


export interface ISelectRaw<Model, Row> {
    <TReturn extends Boolean | String | Number, TName extends keyof TypeWithIndexerOf<TReturn>>(name: TName, returnType: IConstructor<TReturn>, query: string): ITypedQueryBuilder<Model, Pick<TypeWithIndexerOf<ObjectToPrimitive<TReturn>>, TName> & Row>;
}

export interface ISelectColumn<Model, Row> {
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keys: string[]): ITypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, TransformAll<Pick<Model[K1], K2>, TransformAll<Pick<Model[K1][K2], K3>, any>>> & Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3): ITypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, TransformAll<Pick<Model[K1], K2>, Pick<Model[K1][K2], K3>>> & Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2: K2): ITypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, Pick<Model[K1], K2>> & Row>;
    <K extends keyof Model>(key1: K): ITypedQueryBuilder<Model, Pick<Model, K> & Row>;
}


export interface IColumnFunction<Model, Row> {
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keys: string[]): TransformAll<Pick<Model, K1>, TransformAll<Pick<Model[K1], K2>, TransformAll<Pick<Model[K1][K2], K3>, any>>> & Row;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3): TransformAll<Pick<Model, K1>, TransformAll<Pick<Model[K1], K2>, Pick<Model[K1][K2], K3>>> & Row;
    <K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2: K2): TransformAll<Pick<Model, K1>, Pick<Model[K1], K2>> & Row;
    <K extends keyof Model>(key1: K): Pick<Model, K> & Row;
}

export interface ISelectWithFunctionColumn<Model, Row> {
    // <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keys: string[]): ITypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, TransformAll<Pick<Model[K1], K2>, TransformAll<Pick<Model[K1][K2], K3>, any>>> & Row>;
    // <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3): ITypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, TransformAll<Pick<Model[K1], K2>, Pick<Model[K1][K2], K3>>> & Row>;
    // <K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2: K2): ITypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, Pick<Model[K1], K2>> & Row>;
    // <K extends keyof Model>(key1: K): ITypedQueryBuilder<Model, Pick<Model, K> & Row>;
    // <K1 extends keyof Model, K2 extends keyof Model[K1]>(c: (c: (key1: K1, key2: K2) => void) => void): ITypedQueryBuilder<Model, TransformAll<Pick<Model, K1>, Pick<Model[K1], K2>> & Row>;
    // <K extends keyof Model>(c: (c: (key1: K) => void) => void): ITypedQueryBuilder<Model, Pick<Model, K> & Row>;
    <NewRow>(c: (c: IColumnFunction<Model, Row>) => NewRow): ITypedQueryBuilder<Model, NewRow>;
}


export interface IReferenceColumn<Model> {
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keys: string[]): IReferencedColumn;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3): IReferencedColumn;
    <K1 extends keyof Model, K2 extends keyof Model[K1]>(key1: K1, key2: K2): IReferencedColumn;
    <K extends keyof Model>(key1: K): IReferencedColumn;
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


export interface IHaving<Model, Row> {
    <K extends FilterNonObjects<Model>>(key1: K, operator: Operator, value: Model[K]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends FilterNonObjects<Model[K1]>>(key1: K1, key2: K2, operator: Operator, value: Model[K1][K2]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends FilterNonObjects<Model[K1][K2]>>(key1: K1, key2: K2, key3: K3, operator: Operator, value: Model[K1][K2][K3]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keysOperratorAndValue: any[]): ITypedQueryBuilder<Model, Row>;
}

export interface IWhere<Model, Row> {
    <K extends FilterNonObjects<Model>>(key1: K, value: Model[K]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends FilterNonObjects<Model[K1]>>(key1: K1, key2: K2, value: Model[K1][K2]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends FilterNonObjects<Model[K1][K2]>>(key1: K1, key2: K2, key3: K3, value: Model[K1][K2][K3]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keysAndValues: any[]): ITypedQueryBuilder<Model, Row>;
}

export interface IWhereIn<Model, Row> {
    <K extends FilterNonObjects<Model>>(key1: K, value: Model[K][]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends FilterNonObjects<Model[K1]>>(key1: K1, key2: K2, value: Model[K1][K2][]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends FilterNonObjects<Model[K1][K2]>>(key1: K1, key2: K2, key3: K3, value: Model[K1][K2][K3][]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keysAndValues: any[]): ITypedQueryBuilder<Model, Row>;
}


export interface IWhereBetween<Model, Row> {
    <K extends FilterNonObjects<Model>>(key1: K, range: [Model[K], Model[K]]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends FilterNonObjects<Model[K1]>>(key1: K1, key2: K2, range: [Model[K1][K2], Model[K1][K2]]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends FilterNonObjects<Model[K1][K2]>>(key1: K1, key2: K2, key3: K3, range: [Model[K1][K2][K3], Model[K1][K2][K3]]): ITypedQueryBuilder<Model, Row>;
    <K1 extends keyof Model, K2 extends keyof Model[K1], K3 extends keyof Model[K1][K2]>(key1: K1, key2: K2, key3: K3, ...keysAndValues: any[]): ITypedQueryBuilder<Model, Row>;
}


export interface IWhereExists<Model, Row> {
    <SubQueryModel>(subQueryModel: new () => SubQueryModel, code: (subQuery: ITypedQueryBuilder<SubQueryModel, {}>, parent: ISelectColumn<Model, Row>) => void): ITypedQueryBuilder<Model, Row>;
}





export class TypedQueryBuilder<ModelType, Row = {}> implements ITypedQueryBuilder<ModelType, Row> {
    public columns: { name: string; }[];

    private queryBuilder: Knex.QueryBuilder;
    private tableName: string;
    private extraJoinedProperties: { name: string, propertyType: new () => any }[];

    constructor(private tableClass: new () => ModelType, private knex: Knex, queryBuilder?: Knex.QueryBuilder) {
        this.tableName = getTableMetadata(tableClass).tableName;
        this.columns = getColumnProperties(tableClass);

        if (queryBuilder !== undefined) {
            this.queryBuilder = queryBuilder;
            this.queryBuilder.from(this.tableName);
        } else {
            this.queryBuilder = this.knex.from(this.tableName);
        }


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


            await this.knex.raw(sql);
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

    // public selectColumn() {
    //     if (arguments.length === 1) {
    //         this.queryBuilder.select(this.getColumnName(arguments[0]) + ' as ' + arguments[0]);
    //     } else {

    //         this.queryBuilder.select(this.getColumnName(...arguments) + ' as ' + this.getColumnSelectAlias(...arguments));
    //     }
    //     return this as any;
    // }

    public selectColumn() {
        let calledArguments = [] as string[];

        function saveArguments(...args: string[]) {
            calledArguments = args;
        }

        arguments[0](saveArguments);

        this.queryBuilder.select(this.getColumnName(...calledArguments) + ' as ' + this.getColumnSelectAlias(...calledArguments));

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

        let column2Name;
        if (typeof (column2Parts) === 'string') {
            column2Name = column2Parts;
        } else {
            column2Name = this.getColumnName(...column2Parts);
        }

        this.queryBuilder.whereRaw(`?? ${operator} ??`, [this.getColumnName(...column1Parts), column2Name]);

        return this;
    }


    public toQuery() {
        return this.queryBuilder.toQuery();
    }

    public whereNull() {
        this.queryBuilder.whereNull(this.getColumnName(...arguments));
        return this;
    }

    public whereNotNull() {
        this.queryBuilder.whereNotNull(this.getColumnName(...arguments));
        return this;
    }

    public where() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.where(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }

    public whereNot() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.whereNot(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }

    public andWhere() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.andWhere(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }

    public orWhere() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.orWhere(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }

    public whereIn() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.whereIn(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }
    public whereNotIn() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.whereNotIn(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }

    public whereBetween() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.whereBetween(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }
    public whereNotBetween() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.whereNotBetween(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }


    public callQueryCallbackFunction(functionName: string, typeOfSubQuery: any, functionToCall: any) {
        const that = this;
        ((this.queryBuilder as any)[functionName] as (callback: Knex.QueryCallback) => Knex.QueryBuilder)(function() {
            const subQuery = this;
            functionToCall(new TypedQueryBuilder(typeOfSubQuery, that.knex, subQuery), that.getColumnName.bind(that));
        });
    }



    public whereExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];

        this.callQueryCallbackFunction('whereExists', typeOfSubQuery, functionToCall);

        return this;
    }
    public orWhereExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];

        this.callQueryCallbackFunction('orWhereExists', typeOfSubQuery, functionToCall);

        return this;
    }

    public whereNotExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];

        this.callQueryCallbackFunction('whereNotExists', typeOfSubQuery, functionToCall);

        return this;
    }
    public orWhereNotExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];

        this.callQueryCallbackFunction('orWhereNotExists', typeOfSubQuery, functionToCall);

        return this;
    }

    public whereRaw(sql: string, ...bindings: string[]) {
        this.queryBuilder.whereRaw(sql, bindings);
        return this;
    }


    public having() {
        const value = arguments[arguments.length - 1];
        const operator = arguments[arguments.length - 2];
        this.queryBuilder.having(this.getColumnNameFromArgumentsIgnoringLastTwoParameters(...arguments), operator, value);
        return this;
    }

    public havingIn() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.havingIn(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }

    public havingNotIn() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.havingIn(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }

    public havingNull() {
        (this.queryBuilder as any).havingNull(this.getColumnName(...arguments));
        return this;
    }

    public havingNotNull() {
        (this.queryBuilder as any).havingNotNull(this.getColumnName(...arguments));
        return this;
    }

    public havingExists() {
        throw new NotImplementedError();
    }

    public havingNotExists() {
        throw new NotImplementedError();
    }

    public havingRaw() {
        throw new NotImplementedError();
    }

    public havingBetween() {
        const value = arguments[arguments.length - 1];
        (this.queryBuilder as any).havingBetween(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }

    public havingNotBetween() {
        const value = arguments[arguments.length - 1];
        (this.queryBuilder as any).havingNotBetween(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }


    public union() {
        throw new NotImplementedError();
    }

    public unionAll() {
        throw new NotImplementedError();
    }

    public returningColumn() {
        throw new NotImplementedError();
    }

    public returningColumns() {
        throw new NotImplementedError();
    }

    public transacting(trx: Knex.Transaction) {
        this.queryBuilder.transacting(trx);
    }


    public minColumn() {
        throw new NotImplementedError();
    }

    public countColumn() {
        throw new NotImplementedError();
    }

    public countDistinctColumn() {
        throw new NotImplementedError();
    }

    public maxColumn() {
        throw new NotImplementedError();
    }

    public sumColumn() {
        throw new NotImplementedError();
    }

    public sumDistinctColumn() {
        throw new NotImplementedError();
    }

    public avgColumn() {
        throw new NotImplementedError();
    }

    public avgDistinctColumn() {
        throw new NotImplementedError();
    }

    public minResult() {
        throw new NotImplementedError();
    }

    public countDistinctResult() {
        throw new NotImplementedError();
    }

    public maxResult() {
        throw new NotImplementedError();
    }

    public sumResult() {
        throw new NotImplementedError();
    }

    public sumDistinctResult() {
        throw new NotImplementedError();
    }

    public avgResult() {
        throw new NotImplementedError();
    }

    public avgDistinctResult() {
        throw new NotImplementedError();
    }

    public increment() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.increment(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }
    public decrement() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.decrement(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }


    public truncate() {
        this.queryBuilder.truncate();
    }

    public clearSelect() {
        this.queryBuilder.clearSelect();
    }
    public clearWhere() {
        this.queryBuilder.clearWhere();
    }
    public clearOrder() {
        (this.queryBuilder as any).clearOrder();
    }

    public distinct() {
        this.queryBuilder.distinct();
    }

    public clone() {
        throw new NotImplementedError();
    }

    public beginTransaction(): Promise<Knex.Transaction> {
        return new Promise((resolve) => {
            this.knex.transaction((tr) => resolve(tr))
                // If this error is not caught here, it will throw, resulting in an unhandledRejection
                // tslint:disable-next-line:no-empty
                .catch((_e) => { });
        });
    }


    public groupBy() {
        this.queryBuilder.groupBy(this.getColumnName(...arguments));
        return this;
    }

    public groupByRaw() {
        throw new NotImplementedError();
    }

    public useKnexQueryBuilder(f: (query: Knex.QueryBuilder) => void): void {
        f(this.queryBuilder);
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

    private getColumnNameFromArgumentsIgnoringLastParameter(...keys: string[]): string {
        const argumentsExceptLast = keys.slice(0, -1);
        return this.getColumnName(...argumentsExceptLast);

    }


    private getColumnNameFromArgumentsIgnoringLastTwoParameters(...keys: string[]): string {
        const argumentsExceptLastTwo = keys.slice(0, -2);
        return this.getColumnName(...argumentsExceptLastTwo);

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
