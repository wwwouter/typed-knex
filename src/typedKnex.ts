// tslint:disable:use-named-parameter
import * as flat from 'flat';
import * as Knex from 'knex';
import {
    getColumnInformation,
    getColumnProperties,
    getPrimaryKeyColumn,
    getTableMetadata
} from './decorators';
import { NonForeignKeyObjects } from './NonForeignKeyObjects';
import { NonNullableRecursive } from './NonNullableRecursive';
import { TransformPropertiesToFunction } from './TransformPropertiesToFunction';

export function unflatten(o: any): any {
    if (o instanceof Array) {
        return o.map(i => unflatten(i));
    }
    return flat.unflatten(o);
}

function areAllPropertiesNull(o: any) {
    if (o === null || o === undefined) {
        return false;
    }
    const keys = Object.keys(o);
    if (keys.length === 0) {
        return false;
    }
    let allNull = true;
    for (const key of keys) {
        if (o[key] !== null) {
            allNull = false;
            break;
        }
    }
    return allNull;
}

export function setToNull(o: any): any {
    if (o instanceof Array) {
        return o.map(i => setToNull(i));
    } else {
        if (o !== null && o !== undefined) {
            const keys = Object.keys(o);
            for (const key of keys) {
                if (typeof o[key] === 'object') {
                    setToNull(o[key]);
                    if (areAllPropertiesNull(o[key])) {
                        o[key] = null;
                    }
                }
            }
        }
    }
    return o;
}

export function flattenByOption(o: any, flattenOption?: FlattenOption) {
    if (flattenOption === FlattenOption.noFlatten) {
        return o;
    }
    const unflattened = unflatten(o);
    if (
        flattenOption === undefined ||
        flattenOption === FlattenOption.flatten
    ) {
        return unflattened;
    }
    return setToNull(unflattened);
}

export class TypedKnex {
    constructor(private knex: Knex) { }

    public query<T>(tableClass: new () => T): ITypedQueryBuilder<T, T, T> {
        return new TypedQueryBuilder<T, T, T>(tableClass, this.knex);
    }

    public beginTransaction(): Promise<Knex.Transaction> {
        return new Promise(resolve => {
            this.knex
                .transaction(tr => resolve(tr))
                // If this error is not caught here, it will throw, resulting in an unhandledRejection
                // tslint:disable-next-line:no-empty
                .catch(_e => { });
        });
    }


}

let beforeInsertTransform = undefined as
    | undefined
    | ((item: any, typedQueryBuilder: any) => any);

export function registerBeforeInsertTransform<T>(
    f: (item: T, typedQueryBuilder: ITypedQueryBuilder<{}, {}, {}>) => T
) {
    beforeInsertTransform = f;
}

let beforeUpdateTransform = undefined as
    | undefined
    | ((item: any, typedQueryBuilder: any) => any);

export function registerBeforeUpdateTransform<T>(
    f: (item: T, typedQueryBuilder: ITypedQueryBuilder<{}, {}, {}>) => T
) {
    beforeUpdateTransform = f;
}

class NotImplementedError extends Error {
    constructor() {
        super('Not implemented');
    }
}

export enum FlattenOption {
    flatten = 'flatten',
    /**
     * @deprecated since version 2.8.1, use .keepFlat()
     */
    noFlatten = 'noFlatten',
    flattenAndSetToNull = 'flattenAndSetToNull',
}

export interface ITypedQueryBuilder<Model, SelectableModel, Row> {
    columns: { name: string }[];

    where: IWhereWithOperator<Model, SelectableModel, Row>;
    andWhere: IWhereWithOperator<Model, SelectableModel, Row>;
    orWhere: IWhereWithOperator<Model, SelectableModel, Row>;
    whereNot: IWhere<Model, SelectableModel, Row>;
    select: ISelectWithFunctionColumns3<Model, SelectableModel, Row extends Model ? {} : Row>;

    selectQuery: ISelectQuery<Model, SelectableModel, Row>;

    orderBy: IOrderBy<Model, SelectableModel, Row>;
    innerJoinColumn: IKeyFunctionAsParametersReturnQueryBuider<Model, SelectableModel, Row>;
    leftOuterJoinColumn: IOuterJoin<Model, SelectableModel, Row>;

    whereColumn: IWhereCompareTwoColumns<Model, SelectableModel, Row>;

    whereNull: IColumnParameterNoRowTransformation<Model, SelectableModel, Row>;
    whereNotNull: IColumnParameterNoRowTransformation<Model, SelectableModel, Row>;
    orWhereNull: IColumnParameterNoRowTransformation<Model, SelectableModel, Row>;
    orWhereNotNull: IColumnParameterNoRowTransformation<Model, SelectableModel, Row>;

    leftOuterJoinTableOnFunction: IOuterJoinTableMultipleOnClauses<
        Model,
        SelectableModel,
        Row extends Model ? {} : Row
    >;
    innerJoinTableOnFunction: IJoinTableMultipleOnClauses<
        Model,
        SelectableModel,
        Row extends Model ? {} : Row
    >;

    selectRaw: ISelectRaw<Model, SelectableModel, Row extends Model ? {} : Row>;

    findByPrimaryKey: IFindByPrimaryKey<Model, SelectableModel, Row extends Model ? {} : Row>;

    whereIn: IWhereIn<Model, SelectableModel, Row>;
    whereNotIn: IWhereIn<Model, SelectableModel, Row>;

    orWhereIn: IWhereIn<Model, SelectableModel, Row>;
    orWhereNotIn: IWhereIn<Model, SelectableModel, Row>;

    whereBetween: IWhereBetween<Model, SelectableModel, Row>;
    whereNotBetween: IWhereBetween<Model, SelectableModel, Row>;
    orWhereBetween: IWhereBetween<Model, SelectableModel, Row>;
    orWhereNotBetween: IWhereBetween<Model, SelectableModel, Row>;

    whereExists: IWhereExists<Model, SelectableModel, Row>;

    orWhereExists: IWhereExists<Model, SelectableModel, Row>;
    whereNotExists: IWhereExists<Model, SelectableModel, Row>;
    orWhereNotExists: IWhereExists<Model, SelectableModel, Row>;

    whereParentheses: IWhereParentheses<Model, SelectableModel, Row>;

    groupBy: IKeyFunctionAsParametersReturnQueryBuider<Model, SelectableModel, Row>;

    having: IHaving<Model, SelectableModel, Row>;

    havingNull: IKeyFunctionAsParametersReturnQueryBuider<Model, SelectableModel, Row>;
    havingNotNull: IKeyFunctionAsParametersReturnQueryBuider<Model, SelectableModel, Row>;

    havingIn: IWhereIn<Model, SelectableModel, Row>;
    havingNotIn: IWhereIn<Model, SelectableModel, Row>;

    havingExists: IWhereExists<Model, SelectableModel, Row>;
    havingNotExists: IWhereExists<Model, SelectableModel, Row>;

    havingBetween: IWhereBetween<Model, SelectableModel, Row>;
    havingNotBetween: IWhereBetween<Model, SelectableModel, Row>;

    union: IUnion<Model, SelectableModel, Row>;
    unionAll: IUnion<Model, SelectableModel, Row>;

    min: IDbFunctionWithAlias<Model, SelectableModel, Row extends Model ? {} : Row>;

    count: IDbFunctionWithAlias<Model, SelectableModel, Row extends Model ? {} : Row>;
    countDistinct: IDbFunctionWithAlias<Model, SelectableModel, Row extends Model ? {} : Row>;
    max: IDbFunctionWithAlias<Model, SelectableModel, Row extends Model ? {} : Row>;
    sum: IDbFunctionWithAlias<Model, SelectableModel, Row extends Model ? {} : Row>;
    sumDistinct: IDbFunctionWithAlias<Model, SelectableModel, Row extends Model ? {} : Row>;
    avg: IDbFunctionWithAlias<Model, SelectableModel, Row extends Model ? {} : Row>;
    avgDistinct: IDbFunctionWithAlias<Model, SelectableModel, Row extends Model ? {} : Row>;

    clearSelect(): ITypedQueryBuilder<Model, SelectableModel, Model>;
    clearWhere(): ITypedQueryBuilder<Model, SelectableModel, Row>;
    clearOrder(): ITypedQueryBuilder<Model, SelectableModel, Row>;

    limit(value: number): ITypedQueryBuilder<Model, SelectableModel, Row>;
    offset(value: number): ITypedQueryBuilder<Model, SelectableModel, Row>;

    useKnexQueryBuilder(f: (query: Knex.QueryBuilder) => void): ITypedQueryBuilder<Model, SelectableModel, Row>;
    toQuery(): string;

    getFirstOrNull(flattenOption?: FlattenOption): Promise<Row | null>;
    getFirst(flattenOption?: FlattenOption): Promise<Row>;
    getSingleOrNull(flattenOption?: FlattenOption): Promise<Row | null>;
    getSingle(flattenOption?: FlattenOption): Promise<Row>;
    getMany(flattenOption?: FlattenOption): Promise<Row[]>;
    getCount(): Promise<number>;
    insertItem(newObject: Partial<RemoveObjectsFrom2<Model>>): Promise<void>;
    insertItems(items: Partial<RemoveObjectsFrom2<Model>>[]): Promise<void>;
    del(): Promise<void>;
    delByPrimaryKey(primaryKeyValue: any): Promise<void>;
    updateItem(item: Partial<RemoveObjectsFrom2<Model>>): Promise<void>;
    updateItemByPrimaryKey(
        primaryKeyValue: any,
        item: Partial<RemoveObjectsFrom2<Model>>
    ): Promise<void>;
    updateItemsByPrimaryKey(
        items: {
            primaryKeyValue: any;
            data: Partial<RemoveObjectsFrom2<Model>>;
        }[]
    ): Promise<void>;
    execute(): Promise<void>;
    whereRaw(
        sql: string,
        ...bindings: string[]
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
    havingRaw(
        sql: string,
        ...bindings: string[]
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;

    transacting(trx: Knex.Transaction): ITypedQueryBuilder<Model, SelectableModel, Row>;

    truncate(): Promise<void>;
    distinct(): ITypedQueryBuilder<Model, SelectableModel, Row>;

    clone(): ITypedQueryBuilder<Model, SelectableModel, Row>;

    groupByRaw(
        sql: string,
        ...bindings: string[]
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;

    keepFlat(): ITypedQueryBuilder<Model, SelectableModel, any>;
}

type ReturnNonObjectsNamesOnly<T> = { [K in keyof T]: T[K] extends object ? never : K }[keyof T];

type RemoveObjectsFrom<T> = { [P in ReturnNonObjectsNamesOnly<T>]: T[P] };

type RemoveObjectsFrom2<T> = { [P in ReturnNonObjectsNamesOnly<T>]: T[P] };

export type ObjectToPrimitive<T> = T extends String
    ? string
    : T extends Number
    ? number
    : T extends Boolean
    ? boolean
    : never;

export type Operator = '=' | '!=' | '>' | '<' | string;

interface IConstructor<T> {
    new(...args: any[]): T;
}

export type AddPropertyWithType<
    Original,
    NewKey extends keyof any,
    NewKeyType
    > = Original & Record<NewKey, NewKeyType>;

interface IColumnParameterNoRowTransformation<Model, SelectableModel, Row> {
    <PropertyType1>(
        selectColumn1Function: (
            c: TransformPropsToFunctionsReturnPropertyType<Model>
        ) => () => PropertyType1
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
}


type JoinOnColumns<Model, JoinedModel> = <PropertyType1, PropertyType2>(
    selectColumn1Function: (
        c: TransformPropsToFunctionsReturnPropertyType<Model>
    ) => () => PropertyType1,
    operator: Operator,
    selectColumn2Function: (
        c: TransformPropsToFunctionsReturnPropertyType<JoinedModel>
    ) => () => PropertyType2
) => IJoinOnClause2<Model, JoinedModel>;



type JoinOn<Model, JoinedModel> = <PropertyType1, PropertyType2>(
    selectColumn1Function: (
        c: TransformPropsToFunctionsReturnPropertyType<JoinedModel>
    ) => () => PropertyType1,
    operator: Operator,
    selectColumn2Function: (
        c: TransformPropsToFunctionsReturnPropertyType<Model>
    ) => () => PropertyType2
) => IJoinOnClause2<Model, JoinedModel>;


type JoinOnVal<Model, JoinedModel> = <PropertyType1>(
    selectColumn1Function: (
        c: TransformPropsToFunctionsReturnPropertyType<JoinedModel>
    ) => () => PropertyType1,
    operator: Operator,
    value: any
) => IJoinOnClause2<Model, JoinedModel>;

interface IJoinOnClause2<Model, JoinedModel> {
    /**
     * @deprecated since version 2.9, use .on(). Remember that the columns are switched eg .onColumns(i=>i.prop, '=' j=>j.prop) should become .onColumns(j=>j.prop, '=', i=>i.prop)
     */
    onColumns: JoinOnColumns<Model, JoinedModel>;
    on: JoinOn<Model, JoinedModel>;
    orOn: JoinOn<Model, JoinedModel>;
    andOn: JoinOn<Model, JoinedModel>;
    onVal: JoinOnVal<Model, JoinedModel>;
    andOnVal: JoinOnVal<Model, JoinedModel>;
    orOnVal: JoinOnVal<Model, JoinedModel>;

    onNull: <X>(
        selectColumn1Function: (
            c: TransformPropsToFunctionsReturnPropertyType<JoinedModel>
        ) => () => X
    ) => IJoinOnClause2<Model, JoinedModel>;
}

interface IWhereCompareTwoColumns<Model, SelectableModel, Row> {
    <PropertyType1, _PropertyType2, Model2>(
        selectColumn1Function: (
            c: TransformPropsToFunctionsReturnPropertyType<Model>
        ) => () => PropertyType1,
        operator: Operator,
        selectColumn2Function: (
            c: TransformPropsToFunctionsReturnPropertyType<Model2>
        ) => any
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
}

interface IJoinTableMultipleOnClauses<Model, _SelectableModel, Row> {
    <
        NewPropertyType,
        NewPropertyKey extends keyof any
        >(
        newPropertyKey: NewPropertyKey,
        newPropertyClass: new () => NewPropertyType,
        on: (
            join: IJoinOnClause2<
                AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>,
                NewPropertyType
            >
        ) => void
    ): ITypedQueryBuilder<
        Model,
        AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>,
        Row
    >;
}

interface IOuterJoinTableMultipleOnClauses<Model, _SelectableModel, Row> {
    <
        NewPropertyType,
        NewPropertyKey extends keyof any
        >(
        newPropertyKey: NewPropertyKey,
        newPropertyClass: new () => NewPropertyType,
        on: (
            join: IJoinOnClause2<
                AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>,
                NewPropertyType
            >
        ) => void
    ): ITypedQueryBuilder<
        Model,
        AddPropertyWithType<Model, NewPropertyKey, NewPropertyType | null>,
        Row
    >;
}



interface IOuterJoin<Model, SelectableModel, Row> {
    (
        selectColumnFunction: (
            c: TransformPropertiesToFunction<Model>
        ) => void
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;


}



interface ISelectRaw<Model, SelectableModel, Row> {
    <
        TReturn extends Boolean | String | Number,
        TName extends keyof any
        >(
        name: TName,
        returnType: IConstructor<TReturn>,
        query: string
    ): ITypedQueryBuilder<
        Model,
        SelectableModel,
        Record<TName, ObjectToPrimitive<TReturn>> & Row
    >;
}

interface ISelectQuery<Model, SelectableModel, Row> {
    <
        TReturn extends Boolean | String | Number,
        TName extends keyof any,
        SubQueryModel
        >(
        name: TName,
        returnType: IConstructor<TReturn>,
        subQueryModel: new () => SubQueryModel,
        code: (
            subQuery: ITypedQueryBuilder<SubQueryModel, SelectableModel, {}>,
            parent: TransformPropsToFunctionsReturnPropertyName<Model>
        ) => void
    ): ITypedQueryBuilder<
        Model,
        SelectableModel,
        Record<TName, ObjectToPrimitive<TReturn>> & Row
    >;
}

type TransformPropsToFunctionsOnlyLevel1<Level1Type> = {
    [Level1Property in keyof RemoveObjectsFrom<
        Level1Type
    >]: Level1Type[Level1Property] extends object
    ? never
    : (() => Pick<Level1Type, Level1Property>)
};

type TransformPropsToFunctionsReturnPropertyName<Model> = {
    [P in keyof Model]: Model[P] extends object ?
    Model[P] extends Required<NonForeignKeyObjects> ?
    () => P
    :
    TransformPropsToFunctionsReturnPropertyName<Model[P]>
    :
    () => P
};

type TransformPropsToFunctionsReturnPropertyType<Model> = {
    [P in keyof Model]:
    Model[P] extends object ?
    Model[P] extends Required<NonForeignKeyObjects> ?
    () => Model[P]
    :
    TransformPropsToFunctionsReturnPropertyType<Model[P]>
    :
    () => Model[P]
};


interface IOrderBy<Model, SelectableModel, Row> {
    <NewRow>(
        selectColumnFunction: (
            c: TransformPropertiesToFunction<NonNullableRecursive<Model>>
        ) => () => NewRow,
        direction?: 'asc' | 'desc'
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
}

interface IDbFunctionWithAlias<Model, SelectableModel, Row> {
    <NewPropertyType, TName extends keyof any>(
        selectColumnFunction: (
            c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<Model>>
        ) => () => NewPropertyType,
        name: TName
    ): ITypedQueryBuilder<
        Model,
        SelectableModel,
        Record<TName, ObjectToPrimitive<NewPropertyType>> & Row
    >;
}



interface ISelectWithFunctionColumns3<Model, SelectableModel, Row> {
    <
        R1,
        R2,
        R3,
        R4,
        R5,
        R6,
        R7,
        R8,
        R9,
        R10,
        R11,
        R12,
        R13,
        R14,
        R15,
        R16,
        R17,
        R18,
        R19,
        R20,
        R21,
        R22,
        R23,
        R24,
        R25,
        R26,
        R27,
        R28,
        R29
        >(
        selectColumnFunction: (
            c: TransformPropertiesToFunction<SelectableModel>
        ) => [
                () => R1,
                (() => R2)?,
                (() => R3)?,
                (() => R4)?,
                (() => R5)?,
                (() => R6)?,
                (() => R7)?,
                (() => R8)?,
                (() => R9)?,
                (() => R10)?,
                (() => R12)?,
                (() => R13)?,
                (() => R14)?,
                (() => R15)?,
                (() => R16)?,
                (() => R17)?,
                (() => R18)?,
                (() => R19)?,
                (() => R20)?,
                (() => R22)?,
                (() => R23)?,
                (() => R24)?,
                (() => R25)?,
                (() => R26)?,
                (() => R27)?,
                (() => R28)?,
                (() => R29)?
            ]
    ): ITypedQueryBuilder<
        Model,
        SelectableModel,
        Row &
        R1 &
        R2 &
        R3 &
        R4 &
        R5 &
        R6 &
        R7 &
        R8 &
        R8 &
        R9 &
        R10 &
        R11 &
        R12 &
        R13 &
        R14 &
        R15 &
        R16 &
        R17 &
        R18 &
        R18 &
        R19 &
        R20 &
        R21 &
        R22 &
        R23 &
        R24 &
        R25 &
        R26 &
        R27 &
        R28 &
        R28 &
        R29
    >;
    <R1>(
        selectColumnFunction: (
            c: TransformPropertiesToFunction<SelectableModel>
        ) => () => R1
    ): ITypedQueryBuilder<Model, SelectableModel, Row & R1>;
}

interface IFindByPrimaryKey<_Model, SelectableModel, Row> {
    <
        R1,
        R2,
        R3,
        R4,
        R5,
        R6,
        R7,
        R8,
        R9,
        R10,
        R11,
        R12,
        R13,
        R14,
        R15,
        R16,
        R17,
        R18,
        R19,
        R20,
        R21,
        R22,
        R23,
        R24,
        R25,
        R26,
        R27,
        R28,
        R29
        >(
        primaryKeyValue: any,
        selectColumnFunction: (
            c: TransformPropsToFunctionsOnlyLevel1<SelectableModel>
        ) => [
                () => R1,
                (() => R2)?,
                (() => R3)?,
                (() => R4)?,
                (() => R5)?,
                (() => R6)?,
                (() => R7)?,
                (() => R8)?,
                (() => R9)?,
                (() => R10)?,
                (() => R12)?,
                (() => R13)?,
                (() => R14)?,
                (() => R15)?,
                (() => R16)?,
                (() => R17)?,
                (() => R18)?,
                (() => R19)?,
                (() => R20)?,
                (() => R22)?,
                (() => R23)?,
                (() => R24)?,
                (() => R25)?,
                (() => R26)?,
                (() => R27)?,
                (() => R28)?,
                (() => R29)?
            ]
    ): Promise<
        | Row &
        R1 &
        R2 &
        R3 &
        R4 &
        R5 &
        R6 &
        R7 &
        R8 &
        R8 &
        R9 &
        R10 &
        R11 &
        R12 &
        R13 &
        R14 &
        R15 &
        R16 &
        R17 &
        R18 &
        R18 &
        R19 &
        R20 &
        R21 &
        R22 &
        R23 &
        R24 &
        R25 &
        R26 &
        R27 &
        R28 &
        R28 &
        R29
        | void
    >;
}

interface IKeyFunctionAsParametersReturnQueryBuider<Model, SelectableModel, Row> {
    (
        selectColumnFunction: (
            c: TransformPropertiesToFunction<NonNullableRecursive<Model>>
        ) => void
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;

}

interface IWhere<Model, SelectableModel, Row> {
    <PropertyType>(
        selectColumnFunction: (
            c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<SelectableModel>>
        ) => () => PropertyType,
        value: PropertyType
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
}

interface IWhereWithOperator<Model, SelectableModel, Row> {
    <PropertyType>(
        selectColumnFunction: (
            c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<SelectableModel>>
        ) => () => PropertyType,
        value: PropertyType
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;

    <PropertyType>(
        selectColumnFunction: (
            c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<SelectableModel>>
        ) => () => PropertyType,
        operator: Operator,
        value: PropertyType
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
}

interface IWhereIn<Model, SelectableModel, Row> {
    <PropertyType>(
        selectColumnFunction: (
            c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<SelectableModel>>
        ) => () => PropertyType,
        values: PropertyType[]
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
}

interface IWhereBetween<Model, SelectableModel, Row> {
    <PropertyType>(
        selectColumnFunction: (
            c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<SelectableModel>>
        ) => () => PropertyType,
        range: [PropertyType, PropertyType]
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
}

interface IHaving<Model, SelectableModel, Row> {
    <PropertyType>(
        selectColumnFunction: (
            c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<SelectableModel>>
        ) => () => PropertyType,
        operator: Operator,
        value: PropertyType
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
}

interface IWhereCompareTwoColumns<Model, SelectableModel, Row> {
    <PropertyType1, _PropertyType2, Model2>(
        selectColumn1Function: (
            c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<Model>>
        ) => () => PropertyType1,
        operator: Operator,
        selectColumn2Function: (
            c: TransformPropsToFunctionsReturnPropertyType<Model2>
        ) => any
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
}

interface IWhereExists<Model, SelectableModel, Row> {
    <SubQueryModel>(
        subQueryModel: new () => SubQueryModel,
        code: (
            subQuery: ITypedQueryBuilder<SubQueryModel, SelectableModel, {}>,
            parent: TransformPropsToFunctionsReturnPropertyName<SelectableModel>
        ) => void
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
}

interface IWhereParentheses<Model, SelectableModel, Row> {
    (
        code: (subQuery: ITypedQueryBuilder<Model, SelectableModel, Row>) => void
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
}

interface IUnion<Model, SelectableModel, Row> {
    <SubQueryModel>(
        subQueryModel: new () => SubQueryModel,
        code: (subQuery: ITypedQueryBuilder<SubQueryModel, SelectableModel, {}>) => void
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;
}

function getProxyAndMemories<ModelType, Row>(
    typedQueryBuilder?: TypedQueryBuilder<ModelType, Row>
) {
    const memories = [] as string[];

    function allGet(_target: any, name: any): any {
        if (name === 'memories') {
            return memories;
        }

        if (name === 'getColumnName') {
            return typedQueryBuilder!.getColumnName(...memories);
        }

        if (typeof name === 'string') {
            memories.push(name);
        }
        return new Proxy(
            {},
            {
                get: allGet,
            }
        );
    }

    const root = new Proxy(
        {},
        {
            get: allGet,
        }
    );

    return { root, memories };
}

function getProxyAndMemoriesForArray<ModelType, Row>(
    typedQueryBuilder?: TypedQueryBuilder<ModelType, Row>
) {
    const result = [] as string[][];

    let counter = -1;

    function allGet(_target: any, name: any): any {
        if (_target.level === 0) {
            counter++;
            result.push([]);
        }
        if (name === 'memories') {
            return result[counter];
        }
        if (name === 'result') {
            return result;
        }
        if (name === 'level') {
            return _target.level;
        }
        if (name === 'getColumnName') {
            return typedQueryBuilder!.getColumnName(...result[counter]);
        }
        if (typeof name === 'string') {
            result[counter].push(name);
        }
        return new Proxy(
            {},
            {
                get: allGet,
            }
        );
    }

    const root = new Proxy(
        { level: 0 },
        {
            get: allGet,
        }
    );

    return { root, result };
}

class TypedQueryBuilder<ModelType, SelectableModel, Row = {}>
    implements ITypedQueryBuilder<ModelType, SelectableModel, Row> {
    public columns: { name: string }[];

    private queryBuilder: Knex.QueryBuilder;
    private tableName: string;
    private shouldUnflatten: boolean;
    private extraJoinedProperties: {
        name: string;
        propertyType: new () => any;
    }[];

    private transaction?: Knex.Transaction;

    constructor(
        private tableClass: new () => ModelType,
        private knex: Knex,
        queryBuilder?: Knex.QueryBuilder
    ) {
        this.tableName = getTableMetadata(tableClass).tableName;
        this.columns = getColumnProperties(tableClass);

        if (queryBuilder !== undefined) {
            this.queryBuilder = queryBuilder;
            this.queryBuilder.from(this.tableName);
        } else {
            this.queryBuilder = this.knex.from(this.tableName);
        }

        this.extraJoinedProperties = [];
        this.shouldUnflatten = true;
    }

    public keepFlat() {
        this.shouldUnflatten = false;
        return this;
    }

    public async del() {
        await this.queryBuilder.del();
    }

    public async delByPrimaryKey(value: any) {
        const primaryKeyColumnInfo = getPrimaryKeyColumn(this.tableClass);

        await this.queryBuilder.del().where(primaryKeyColumnInfo.name, value);
    }

    public async insertItem(newObject: Partial<RemoveObjectsFrom2<ModelType>>) {
        await this.insertItems([newObject]);
    }

    public async insertItems(items: Partial<RemoveObjectsFrom2<ModelType>>[]) {
        items = [...items];

        for (let item of items) {
            if (beforeInsertTransform) {
                item = beforeInsertTransform(item, this);
            }
        }

        while (items.length > 0) {
            const chunk = items.splice(0, 500);
            const query = this.knex.from(this.tableName).insert(chunk);
            if (this.transaction !== undefined) {
                query.transacting(this.transaction);
            }
            await query;
        }
    }

    public async updateItem(item: Partial<RemoveObjectsFrom2<ModelType>>) {
        if (beforeUpdateTransform) {
            item = beforeUpdateTransform(item, this);
        }

        await this.queryBuilder.update(item);
    }

    public async updateItemByPrimaryKey(
        primaryKeyValue: any,
        item: Partial<RemoveObjectsFrom2<ModelType>>
    ) {
        if (beforeUpdateTransform) {
            item = beforeUpdateTransform(item, this);
        }

        const primaryKeyColumnInfo = getPrimaryKeyColumn(this.tableClass);

        await this.queryBuilder
            .update(item)
            .where(primaryKeyColumnInfo.name, primaryKeyValue);
    }

    public async updateItemsByPrimaryKey(
        items: {
            primaryKeyValue: any;
            data: Partial<RemoveObjectsFrom2<ModelType>>;
        }[]
    ) {
        const primaryKeyColumnInfo = getPrimaryKeyColumn(this.tableClass);

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
                sql +=
                    query
                        .where(primaryKeyColumnInfo.name, item.primaryKeyValue)
                        .toString()
                        .replace('?', '\\?') + ';\n';
            }

            const finalQuery = this.knex.raw(sql);
            if (this.transaction !== undefined) {
                finalQuery.transacting(this.transaction);
            }
            await finalQuery;
        }
    }

    public async execute() {
        await this.queryBuilder;
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
        return await this.queryBuilder
            .select(columns as any)
            .where(this.tableName + '.id', id)
            .first();
    }

    public async getCount() {
        const query = this.queryBuilder.count();
        const result = await query;
        if (result.length === 0) {
            return 0;
        }
        return result[0].count;
    }

    public async getFirstOrNull() {
        const items = await this.queryBuilder;
        if (!items || items.length === 0) {
            return null;
        }

        return this.flattenByOption(items[0], arguments[0]);
    }

    public async getFirst() {
        const items = await this.queryBuilder;
        if (!items || items.length === 0) {
            throw new Error('Item not found.');
        }

        return this.flattenByOption(items[0], arguments[0]);
    }

    public async getSingleOrNull() {
        const items = await this.queryBuilder;
        if (!items || items.length === 0) {
            return null;
        } else if (items.length > 1) {
            throw new Error(`More than one item found: ${items.length}.`);
        }
        return this.flattenByOption(items[0], arguments[0]);
    }

    public async getSingle() {
        const items = await this.queryBuilder;
        if (!items || items.length === 0) {
            throw new Error('Item not found.');
        } else if (items.length > 1) {
            throw new Error(`More than one item found: ${items.length}.`);
        }
        return this.flattenByOption(items[0], arguments[0]);
    }

    public selectColumn() {
        let calledArguments = [] as string[];

        function saveArguments(...args: string[]) {
            calledArguments = args;
        }

        arguments[0](saveArguments);

        this.queryBuilder.select(
            this.getColumnName(...calledArguments) +
            ' as ' +
            this.getColumnSelectAlias(...calledArguments)
        );

        return this as any;
    }

    public getArgumentsFromColumnFunction3(f: any) {
        const { root, result } = getProxyAndMemoriesForArray();

        f(root);

        return result;
    }

    public select2() {
        const f = arguments[0];

        const columnArgumentsList = this.getArgumentsFromColumnFunction3(f);

        for (const columnArguments of columnArgumentsList) {
            this.queryBuilder.select(
                this.getColumnName(...columnArguments) +
                ' as ' +
                this.getColumnSelectAlias(...columnArguments)
            );
        }
        return this as any;
    }

    public select() {
        const f = arguments[0];

        const columnArgumentsList = this.getArgumentsFromColumnFunction3(f);

        for (const columnArguments of columnArgumentsList) {
            this.queryBuilder.select(
                this.getColumnName(...columnArguments) +
                ' as ' +
                this.getColumnSelectAlias(...columnArguments)
            );
        }
        return this as any;
    }

    public orderBy() {
        this.queryBuilder.orderBy(
            this.getColumnNameWithoutAliasFromFunction(arguments[0]),
            arguments[1]
        );

        return this as any;
    }

    public async getMany() {
        const items = await this.queryBuilder;

        return this.flattenByOption(items, arguments[0]) as Row[];
    }

    public selectRaw() {
        const name = arguments[0];
        const query = arguments[2];

        this.queryBuilder.select(this.knex.raw(`(${query}) as "${name}"`));
        return this as any;
    }

    public innerJoinColumn() {
        return this.joinColumn('innerJoin', arguments[0]);
    }
    public leftOuterJoinColumn() {
        return this.joinColumn('leftOuterJoin', arguments[0]);
    }

    public innerJoinTable() {
        const newPropertyKey = arguments[0];
        const newPropertyType = arguments[1];
        const column1Parts = arguments[2];
        const operator = arguments[3];
        const column2Parts = arguments[4];

        this.extraJoinedProperties.push({
            name: newPropertyKey,
            propertyType: newPropertyType,
        });

        const tableToJoinClass = newPropertyType;
        const tableToJoinName = getTableMetadata(tableToJoinClass).tableName;
        const tableToJoinAlias = newPropertyKey;

        const table1Column = this.getColumnName(...column1Parts);
        const table2Column = this.getColumnName(...column2Parts);

        this.queryBuilder.innerJoin(
            `${tableToJoinName} as ${tableToJoinAlias}`,
            table1Column,
            operator,
            table2Column
        );

        return this;
    }


    public innerJoinTableOnFunction() {
        return this.joinTableOnFunction(this.queryBuilder.innerJoin.bind(this.queryBuilder), arguments[0], arguments[1], arguments[2]);
    }

    public leftOuterJoinTableOnFunction() {
        return this.joinTableOnFunction(this.queryBuilder.leftOuterJoin.bind(this.queryBuilder), arguments[0], arguments[1], arguments[2]);
    }


    public leftOuterJoinTable() {
        const newPropertyKey = arguments[0];
        const newPropertyType = arguments[1];
        const column1Parts = arguments[2];
        const operator = arguments[3];
        const column2Parts = arguments[4];

        this.extraJoinedProperties.push({
            name: newPropertyKey,
            propertyType: newPropertyType,
        });

        const tableToJoinClass = newPropertyType;
        const tableToJoinName = getTableMetadata(tableToJoinClass).tableName;
        const tableToJoinAlias = newPropertyKey;

        const table1Column = this.getColumnName(...column1Parts);
        const table2Column = this.getColumnName(...column2Parts);

        this.queryBuilder.leftOuterJoin(
            `${tableToJoinName} as ${tableToJoinAlias}`,
            table1Column,
            operator,
            table2Column
        );

        return this;
    }

    public whereColumn() {
        const column1Name = this.getColumnName(
            ...this.getArgumentsFromColumnFunction(arguments[0])
        );

        const operator = arguments[1];

        let column2Name;
        if (typeof arguments[2] === 'string') {
            column2Name = arguments[2];
        } else if (arguments[2].memories !== undefined) {
            column2Name = arguments[2].getColumnName; // parent this needed ...
        } else {
            column2Name = this.getColumnName(
                ...this.getArgumentsFromColumnFunction(arguments[2])
            );
        }

        this.queryBuilder.whereRaw(`?? ${operator} ??`, [
            column1Name,
            column2Name,
        ]);

        return this;
    }

    public toQuery() {
        return this.queryBuilder.toQuery();
    }

    public whereNull() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.whereNull.bind(this.queryBuilder), ...arguments);
    }

    public whereNotNull() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.whereNotNull.bind(this.queryBuilder), ...arguments);
    }


    public orWhereNull() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.orWhereNull.bind(this.queryBuilder), ...arguments);
    }

    public orWhereNotNull() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.orWhereNotNull.bind(this.queryBuilder), ...arguments);
    }

    public getArgumentsFromColumnFunction(f: any) {
        const { root, memories } = getProxyAndMemories();

        f(root);

        return memories;
    }

    public async findByPrimaryKey() {
        const primaryKeyColumnInfo = getPrimaryKeyColumn(this.tableClass);

        const primaryKeyValue = arguments[0];

        const f = arguments[1];

        const columnArgumentsList = this.getArgumentsFromColumnFunction3(f);

        for (const columnArguments of columnArgumentsList) {
            this.queryBuilder.select(
                this.getColumnName(...columnArguments) +
                ' as ' +
                this.getColumnSelectAlias(...columnArguments)
            );
        }

        this.queryBuilder.where(primaryKeyColumnInfo.name, primaryKeyValue);

        return await this.queryBuilder.first();
    }



    public where() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.where.bind(this.queryBuilder), ...arguments);
    }

    public whereNot() {
        const columnArguments = this.getArgumentsFromColumnFunction(
            arguments[0]
        );

        this.queryBuilder.whereNot(
            this.getColumnName(...columnArguments),
            arguments[1]
        );
        return this;
    }

    public andWhere() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.andWhere.bind(this.queryBuilder), ...arguments);
    }

    public orWhere() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.orWhere.bind(this.queryBuilder), ...arguments);
    }

    public whereIn() {
        const range = arguments[1];
        this.queryBuilder.whereIn(
            this.getColumnNameFromFunction(arguments[0]),
            range
        );
        return this;
    }
    public whereNotIn() {
        const range = arguments[1];
        this.queryBuilder.whereNotIn(
            this.getColumnNameFromFunction(arguments[0]),
            range
        );
        return this;
    }
    public orWhereIn() {
        const range = arguments[1];
        this.queryBuilder.orWhereIn(
            this.getColumnNameFromFunction(arguments[0]),
            range
        );
        return this;
    }
    public orWhereNotIn() {
        const range = arguments[1];
        this.queryBuilder.orWhereNotIn(
            this.getColumnNameFromFunction(arguments[0]),
            range
        );
        return this;
    }

    public whereBetween() {
        const value = arguments[1];
        this.queryBuilder.whereBetween(
            this.getColumnNameFromFunction(arguments[0]),
            value
        );
        return this;
    }
    public whereNotBetween() {
        const value = arguments[1];
        this.queryBuilder.whereNotBetween(
            this.getColumnNameFromFunction(arguments[0]),
            value
        );
        return this;
    }

    public orWhereBetween() {
        const value = arguments[1];
        this.queryBuilder.orWhereBetween(
            this.getColumnNameFromFunction(arguments[0]),
            value
        );
        return this;
    }
    public orWhereNotBetween() {
        const value = arguments[1];
        this.queryBuilder.orWhereNotBetween(
            this.getColumnNameFromFunction(arguments[0]),
            value
        );
        return this;
    }

    public callQueryCallbackFunction(
        functionName: string,
        typeOfSubQuery: any,
        functionToCall: any
    ) {
        const that = this;
        ((this.queryBuilder as any)[functionName] as (
            callback: Knex.QueryCallback
        ) => Knex.QueryBuilder)(function() {
            const subQuery = this;
            const { root, memories } = getProxyAndMemories(that);

            const subQB = new TypedQueryBuilder(typeOfSubQuery, that.knex, subQuery);
            subQB.extraJoinedProperties = that.extraJoinedProperties;
            functionToCall(
                subQB,
                root,
                memories
            );
        });
    }

    public selectQuery() {
        const name = arguments[0];
        const typeOfSubQuery = arguments[2];
        const functionToCall = arguments[3];

        const { root, memories } = getProxyAndMemories(this);

        const subQueryBuilder = new TypedQueryBuilder(
            typeOfSubQuery,
            this.knex
        );
        functionToCall(subQueryBuilder, root, memories);

        (this.selectRaw as any)(name, undefined, subQueryBuilder.toQuery());

        return this as any;
    }

    public whereParentheses() {
        this.callQueryCallbackFunction('where', this.tableClass, arguments[0]);

        return this;
    }

    public whereExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];

        this.callQueryCallbackFunction(
            'whereExists',
            typeOfSubQuery,
            functionToCall
        );

        return this;
    }
    public orWhereExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];

        this.callQueryCallbackFunction(
            'orWhereExists',
            typeOfSubQuery,
            functionToCall
        );

        return this;
    }

    public whereNotExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];

        this.callQueryCallbackFunction(
            'whereNotExists',
            typeOfSubQuery,
            functionToCall
        );

        return this;
    }
    public orWhereNotExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];

        this.callQueryCallbackFunction(
            'orWhereNotExists',
            typeOfSubQuery,
            functionToCall
        );

        return this;
    }

    public whereRaw(sql: string, ...bindings: string[]) {
        this.queryBuilder.whereRaw(sql, bindings);
        return this;
    }

    public having() {
        const operator = arguments[1];
        const value = arguments[2];
        this.queryBuilder.having(
            this.getColumnNameFromFunction(arguments[0]),
            operator,
            value
        );
        return this;
    }

    public havingIn() {
        const value = arguments[1];
        this.queryBuilder.havingIn(
            this.getColumnNameFromFunction(arguments[0]),
            value
        );
        return this;
    }

    public havingNotIn() {
        const value = arguments[1];
        (this.queryBuilder as any).havingNotIn(
            this.getColumnNameFromFunction(arguments[0]),
            value
        );
        return this;
    }

    public havingNull() {
        (this.queryBuilder as any).havingNull(
            this.getColumnNameFromFunction(arguments[0])
        );
        return this;
    }

    public havingNotNull() {
        (this.queryBuilder as any).havingNotNull(
            this.getColumnNameFromFunction(arguments[0])
        );
        return this;
    }

    public havingExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];

        this.callQueryCallbackFunction(
            'havingExists',
            typeOfSubQuery,
            functionToCall
        );

        return this;
    }

    public havingNotExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];

        this.callQueryCallbackFunction(
            'havingNotExists',
            typeOfSubQuery,
            functionToCall
        );

        return this;
    }

    public havingRaw(sql: string, ...bindings: string[]) {
        this.queryBuilder.havingRaw(sql, bindings);
        return this;
    }

    public havingBetween() {
        const value = arguments[1];
        (this.queryBuilder as any).havingBetween(
            this.getColumnNameFromFunction(arguments[0]),
            value
        );
        return this;
    }

    public havingNotBetween() {
        const value = arguments[1];
        (this.queryBuilder as any).havingNotBetween(
            this.getColumnNameFromFunction(arguments[0]),
            value
        );
        return this;
    }

    public union() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];

        this.callQueryCallbackFunction('union', typeOfSubQuery, functionToCall);

        return this;
    }

    public unionAll() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];

        this.callQueryCallbackFunction(
            'unionAll',
            typeOfSubQuery,
            functionToCall
        );

        return this;
    }

    public returningColumn() {
        throw new NotImplementedError();
    }

    public returningColumns() {
        throw new NotImplementedError();
    }

    public transacting(trx: Knex.Transaction) {
        this.queryBuilder.transacting(trx);

        this.transaction = trx;

        return this;
    }

    public min() {
        return this.functionWithAlias('min', arguments[0], arguments[1]);
    }

    public count() {
        return this.functionWithAlias('count', arguments[0], arguments[1]);
    }

    public countDistinct() {
        return this.functionWithAlias(
            'countDistinct',
            arguments[0],
            arguments[1]
        );
    }

    public max() {
        return this.functionWithAlias('max', arguments[0], arguments[1]);
    }

    public sum() {
        return this.functionWithAlias('sum', arguments[0], arguments[1]);
    }

    public sumDistinct() {
        return this.functionWithAlias(
            'sumDistinct',
            arguments[0],
            arguments[1]
        );
    }

    public avg() {
        return this.functionWithAlias('avg', arguments[0], arguments[1]);
    }

    public avgDistinct() {
        return this.functionWithAlias(
            'avgDistinct',
            arguments[0],
            arguments[1]
        );
    }

    public increment() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.increment(
            this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments),
            value
        );
        return this;
    }
    public decrement() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.decrement(
            this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments),
            value
        );
        return this;
    }

    public async truncate() {
        await this.queryBuilder.truncate();
    }

    public clearSelect() {
        this.queryBuilder.clearSelect();
        return this as any;
    }
    public clearWhere() {
        this.queryBuilder.clearWhere();
        return this as any;
    }
    public clearOrder() {
        (this.queryBuilder as any).clearOrder();
        return this as any;
    }

    public distinct() {
        this.queryBuilder.distinct();
        return this as any;
    }

    public clone() {
        const queryBuilderClone = this.queryBuilder.clone();

        const typedQueryBuilderClone = new TypedQueryBuilder<ModelType, Row>(
            this.tableClass,
            this.knex,
            queryBuilderClone
        );

        return typedQueryBuilderClone as any;
    }

    public groupBy() {
        this.queryBuilder.groupBy(this.getColumnNameFromFunction(arguments[0]));
        return this;
    }

    public groupByRaw(sql: string, ...bindings: string[]) {
        this.queryBuilder.groupByRaw(sql, bindings);
        return this;
    }

    public useKnexQueryBuilder(f: (query: Knex.QueryBuilder) => void) {
        f(this.queryBuilder);
        return this;
    }

    public getColumnName(...keys: string[]): string {
        const firstPartName = this.getColumnNameWithoutAlias(keys[0]);

        if (keys.length === 1) {
            return firstPartName;
        } else {
            let columnName;
            let columnAlias;
            let currentClass;
            let currentColumnPart;
            const extraJoinedProperty = this.extraJoinedProperties.find(
                i => i.name === keys[0]
            );
            if (extraJoinedProperty) {
                columnName = '';
                columnAlias = extraJoinedProperty.name;
                currentClass = extraJoinedProperty.propertyType;
            } else {
                currentColumnPart = getColumnInformation(
                    this.tableClass,
                    keys[0]
                );

                columnName = '';
                columnAlias = currentColumnPart.propertyKey;
                currentClass = currentColumnPart.columnClass;
            }
            for (let i = 1; i < keys.length; i++) {
                currentColumnPart = getColumnInformation(currentClass, keys[i]);

                columnName =
                    columnAlias +
                    '.' +
                    (keys.length - 1 === i
                        ? currentColumnPart.name
                        : currentColumnPart.propertyKey);
                columnAlias +=
                    '_' +
                    (keys.length - 1 === i
                        ? currentColumnPart.name
                        : currentColumnPart.propertyKey);
                currentClass = currentColumnPart.columnClass;
            }
            return columnName;
        }
    }

    public getColumnNameWithDifferentRoot(
        _rootKey: string,
        ...keys: string[]
    ): string {
        const firstPartName = this.getColumnNameWithoutAlias(keys[0]);

        if (keys.length === 1) {
            return firstPartName;
        } else {
            let currentColumnPart = getColumnInformation(
                this.tableClass,
                keys[0]
            );

            let columnName = '';
            let columnAlias = currentColumnPart.propertyKey;
            let currentClass = currentColumnPart.columnClass;
            for (let i = 0; i < keys.length; i++) {
                currentColumnPart = getColumnInformation(currentClass, keys[i]);

                columnName =
                    columnAlias +
                    '.' +
                    (keys.length - 1 === i
                        ? currentColumnPart.name
                        : currentColumnPart.propertyKey);
                columnAlias +=
                    '_' +
                    (keys.length - 1 === i
                        ? currentColumnPart.name
                        : currentColumnPart.propertyKey);
                currentClass = currentColumnPart.columnClass;
            }
            return columnName;
        }
    }

    private functionWithAlias(
        knexFunctionName: string,
        f: any,
        aliasName: string
    ) {
        (this.queryBuilder as any)[knexFunctionName](
            `${this.getColumnNameWithoutAliasFromFunction(f)} as ${aliasName}`
        );
        return this as any;
    }

    private getColumnNameFromFunction(f: any) {
        return this.getColumnName(...this.getArgumentsFromColumnFunction(f));
    }

    private getColumnNameWithoutAliasFromFunction(f: any) {
        return this.getColumnNameWithoutAlias(
            ...this.getArgumentsFromColumnFunction(f)
        );
    }

    private joinColumn(joinType: 'innerJoin' | 'leftOuterJoin', f: any) {
        const columnToJoinArguments = this.getArgumentsFromColumnFunction(f);

        const columnToJoinName = this.getColumnName(...columnToJoinArguments);

        let secondColumnName = columnToJoinArguments[0];
        let secondColumnAlias = columnToJoinArguments[0];
        let secondColumnClass = getColumnInformation(
            this.tableClass,
            secondColumnName
        ).columnClass;

        for (let i = 1; i < columnToJoinArguments.length; i++) {
            const beforeSecondColumnAlias = secondColumnAlias;
            const beforeSecondColumnClass = secondColumnClass;

            const columnInfo = getColumnInformation(
                beforeSecondColumnClass,
                columnToJoinArguments[i]
            );
            secondColumnName = columnInfo.name;
            secondColumnAlias =
                beforeSecondColumnAlias + '_' + columnInfo.propertyKey;
            secondColumnClass = columnInfo.columnClass;
        }

        const tableToJoinName = getTableMetadata(secondColumnClass).tableName;
        const tableToJoinAlias = secondColumnAlias;
        const tableToJoinJoinColumnName = `${tableToJoinAlias}.${
            getPrimaryKeyColumn(secondColumnClass).name
            }`;

        if (joinType === 'innerJoin') {
            this.queryBuilder.innerJoin(
                `${tableToJoinName} as ${tableToJoinAlias}`,
                tableToJoinJoinColumnName,
                columnToJoinName
            );
        } else if (joinType === 'leftOuterJoin') {
            this.queryBuilder.leftOuterJoin(
                `${tableToJoinName} as ${tableToJoinAlias}`,
                tableToJoinJoinColumnName,
                columnToJoinName
            );
        }

        return this;
    }

    private getColumnNameFromArgumentsIgnoringLastParameter(
        ...keys: string[]
    ): string {
        const argumentsExceptLast = keys.slice(0, -1);
        return this.getColumnName(...argumentsExceptLast);
    }

    private getColumnNameWithoutAlias(...keys: string[]): string {
        if (keys.length === 1) {
            const extraJoinedProperty = this.extraJoinedProperties.find(
                i => i.name === keys[0]
            );
            if (extraJoinedProperty) {
                return extraJoinedProperty.name;
            } else {
                const columnInfo = getColumnInformation(
                    this.tableClass,
                    keys[0]
                );
                return this.tableName + '.' + columnInfo.name;
            }
        } else {
            let currentColumnPart = getColumnInformation(
                this.tableClass,
                keys[0]
            );

            let result = currentColumnPart.propertyKey;
            let currentClass = currentColumnPart.columnClass;

            for (let i = 1; i < keys.length; i++) {
                currentColumnPart = getColumnInformation(currentClass, keys[i]);
                result +=
                    '.' +
                    (keys.length - 1 === i
                        ? currentColumnPart.name
                        : currentColumnPart.propertyKey);
                currentClass = currentColumnPart.columnClass;
            }

            return result;
        }
    }

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

    private flattenByOption(o: any, flattenOption?: FlattenOption) {
        if (flattenOption === FlattenOption.noFlatten || this.shouldUnflatten === false) {
            return o;
        }
        const unflattened = unflatten(o);
        if (
            flattenOption === undefined ||
            flattenOption === FlattenOption.flatten
        ) {
            return unflattened;
        }
        return setToNull(unflattened);
    }

    private joinTableOnFunction(queryBuilderJoin: Knex.Join, newPropertyKey: any, newPropertyType: any, onFunction: (join: IJoinOnClause2<any, any>) => void) {
        this.extraJoinedProperties.push({
            name: newPropertyKey,
            propertyType: newPropertyType,
        });

        const tableToJoinClass = newPropertyType;
        const tableToJoinName = getTableMetadata(tableToJoinClass).tableName;
        const tableToJoinAlias = newPropertyKey;

        let knexOnObject: any;
        queryBuilderJoin(
            `${tableToJoinName} as ${tableToJoinAlias}`,
            function() {
                knexOnObject = this;
            }
        );

        const onWithJoinedColumnOperatorColumn = (joinedColumn: any, operator: any, modelColumn: any, functionName: string) => {
            const column1Arguments = this.getArgumentsFromColumnFunction(
                modelColumn
            );
            const column2Arguments = this.getArgumentsFromColumnFunction(
                joinedColumn
            );
            const column2ArgumentsWithJoinedTable = [
                tableToJoinAlias,
                ...column2Arguments,
            ];
            knexOnObject[functionName](
                this.getColumnName(...column1Arguments),
                operator,
                column2ArgumentsWithJoinedTable.join('.')
            );
        }

        const onWithColumnOperatorValue = (joinedColumn: any, operator: any, value: any, functionName: string) => {
            // const column1Arguments = this.getArgumentsFromColumnFunction(
            //     joinedColumn
            // );
            const column2Arguments = this.getArgumentsFromColumnFunction(
                joinedColumn
            );
            const column2ArgumentsWithJoinedTable = [
                tableToJoinAlias,
                ...column2Arguments,
            ];
            knexOnObject[functionName](
                // this.getColumnName(...column1Arguments),
                column2ArgumentsWithJoinedTable.join('.'),
                operator,
                value
                // column2ArgumentsWithJoinedTable.join('.')
            );
        }

        const onObject = {
            onColumns: (column1: any, operator: any, column2: any) => {
                onWithJoinedColumnOperatorColumn(column2, operator, column1, 'on');
                return onObject;
            },
            on: (column1: any, operator: any, column2: any) => {
                onWithJoinedColumnOperatorColumn(column1, operator, column2, 'on');
                return onObject;
            },
            andOn: (column1: any, operator: any, column2: any) => {
                onWithJoinedColumnOperatorColumn(column1, operator, column2, 'andOn');
                return onObject;
            },
            orOn: (column1: any, operator: any, column2: any) => {
                onWithJoinedColumnOperatorColumn(column1, operator, column2, 'orOn');
                return onObject;
            },
            onVal: (column1: any, operator: any, value: any) => {
                onWithColumnOperatorValue(column1, operator, value, 'onVal');
                return onObject;
            },
            andOnVal: (column1: any, operator: any, value: any) => {
                onWithColumnOperatorValue(column1, operator, value, 'andOnVal');
                return onObject;
            },
            orOnVal: (column1: any, operator: any, value: any) => {
                onWithColumnOperatorValue(column1, operator, value, 'orOnVal');
                return onObject;
            },
            onNull: (f: any) => {
                const column2Arguments = this.getArgumentsFromColumnFunction(f);
                const column2ArgumentsWithJoinedTable = [
                    tableToJoinAlias,
                    ...column2Arguments,
                ];

                knexOnObject.onNull(column2ArgumentsWithJoinedTable.join('.'));
                return onObject;
            },
        } as any;

        onFunction(onObject as any);

        return this as any;
    }

    private callKnexFunctionWithColumnFunction(knexFunction: any, ...args: any[]) {
        const columnArguments = this.getArgumentsFromColumnFunction(
            args[0]
        );

        if (args.length === 3) {
            knexFunction(
                this.getColumnName(...columnArguments),
                args[1],
                args[2]
            );
        } else {
            knexFunction(
                this.getColumnName(...columnArguments),
                args[1]
            );
        }

        return this;
    }
}
