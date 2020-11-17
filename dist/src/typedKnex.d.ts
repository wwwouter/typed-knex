import * as Knex from 'knex';
import { NestedForeignKeyKeysOf, NestedKeysOf } from './NestedKeysOf';
import { NonForeignKeyObjects } from './NonForeignKeyObjects';
import { NonNullableRecursive } from './NonNullableRecursive';
import { GetNestedProperty, GetNestedPropertyType } from './PropertyTypes';
import { SelectableColumnTypes } from './SelectableColumnTypes';
import { TransformPropertiesToFunction } from './TransformPropertiesToFunction';
import { FlattenOption } from './unflatten';
export declare class TypedKnex {
    private knex;
    constructor(knex: Knex);
    query<T>(tableClass: new () => T): ITypedQueryBuilder<T, T, T>;
    beginTransaction(): Promise<Knex.Transaction>;
}
export declare function registerBeforeInsertTransform<T>(f: (item: T, typedQueryBuilder: ITypedQueryBuilder<{}, {}, {}>) => T): void;
export declare function registerBeforeUpdateTransform<T>(f: (item: T, typedQueryBuilder: ITypedQueryBuilder<{}, {}, {}>) => T): void;
export interface ITypedQueryBuilder<Model, SelectableModel, Row> {
    columns: {
        name: string;
    }[];
    where: IWhereWithOperator<Model, SelectableModel, Row>;
    andWhere: IWhereWithOperator<Model, SelectableModel, Row>;
    orWhere: IWhereWithOperator<Model, SelectableModel, Row>;
    whereNot: IWhere<Model, SelectableModel, Row>;
    select: ISelectWithFunctionColumns3<Model, SelectableModel, Row extends Model ? {} : Row>;
    selectQuery: ISelectQuery<Model, SelectableModel, Row>;
    orderBy: IOrderBy<Model, SelectableModel, Row>;
    innerJoinColumn: IKeyFunctionAsParametersReturnQueryBuider<Model, SelectableModel, Row>;
    leftOuterJoinColumn: IKeyFunctionAsParametersReturnQueryBuider<Model, SelectableModel, Row>;
    whereColumn: IWhereCompareTwoColumns<Model, SelectableModel, Row>;
    whereNull: IColumnParameterNoRowTransformation<Model, SelectableModel, Row>;
    whereNotNull: IColumnParameterNoRowTransformation<Model, SelectableModel, Row>;
    orWhereNull: IColumnParameterNoRowTransformation<Model, SelectableModel, Row>;
    orWhereNotNull: IColumnParameterNoRowTransformation<Model, SelectableModel, Row>;
    leftOuterJoinTableOnFunction: IJoinTableMultipleOnClauses<Model, SelectableModel, Row extends Model ? {} : Row>;
    innerJoinTableOnFunction: IJoinTableMultipleOnClauses<Model, SelectableModel, Row extends Model ? {} : Row>;
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
    groupBy: ISelectableColumnKeyFunctionAsParametersReturnQueryBuider<Model, SelectableModel, Row>;
    having: IHaving<Model, SelectableModel, Row>;
    havingNull: ISelectableColumnKeyFunctionAsParametersReturnQueryBuider<Model, SelectableModel, Row>;
    havingNotNull: ISelectableColumnKeyFunctionAsParametersReturnQueryBuider<Model, SelectableModel, Row>;
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
    insertSelect: IInsertSelect;
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
    insertItem(newObject: Partial<RemoveObjectsFrom<Model>>): Promise<void>;
    insertItems(items: Partial<RemoveObjectsFrom<Model>>[]): Promise<void>;
    del(): Promise<void>;
    delByPrimaryKey(primaryKeyValue: any): Promise<void>;
    updateItem(item: Partial<RemoveObjectsFrom<Model>>): Promise<void>;
    updateItemByPrimaryKey(primaryKeyValue: any, item: Partial<RemoveObjectsFrom<Model>>): Promise<void>;
    updateItemsByPrimaryKey(items: {
        primaryKeyValue: any;
        data: Partial<RemoveObjectsFrom<Model>>;
    }[]): Promise<void>;
    execute(): Promise<void>;
    whereRaw(sql: string, ...bindings: string[]): ITypedQueryBuilder<Model, SelectableModel, Row>;
    havingRaw(sql: string, ...bindings: string[]): ITypedQueryBuilder<Model, SelectableModel, Row>;
    transacting(trx: Knex.Transaction): ITypedQueryBuilder<Model, SelectableModel, Row>;
    truncate(): Promise<void>;
    distinct(): ITypedQueryBuilder<Model, SelectableModel, Row>;
    clone(): ITypedQueryBuilder<Model, SelectableModel, Row>;
    groupByRaw(sql: string, ...bindings: string[]): ITypedQueryBuilder<Model, SelectableModel, Row>;
    orderByRaw(sql: string, ...bindings: string[]): ITypedQueryBuilder<Model, SelectableModel, Row>;
    keepFlat(): ITypedQueryBuilder<Model, SelectableModel, any>;
}
declare type ReturnNonObjectsNamesOnly<T> = {
    [K in keyof T]: T[K] extends SelectableColumnTypes ? K : never;
}[keyof T];
declare type RemoveObjectsFrom<T> = {
    [P in ReturnNonObjectsNamesOnly<T>]: T[P];
};
export declare type ObjectToPrimitive<T> = T extends String ? string : T extends Number ? number : T extends Boolean ? boolean : never;
export declare type Operator = '=' | '!=' | '>' | '<' | string;
interface IConstructor<T> {
    new (...args: any[]): T;
}
export declare type AddPropertyWithType<Original, NewKey extends keyof any, NewKeyType> = Original & Record<NewKey, NewKeyType>;
interface IColumnParameterNoRowTransformation<Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <PropertyType1>(selectColumn1Function: (c: TransformPropsToFunctionsReturnPropertyType<Model>) => () => PropertyType1): ITypedQueryBuilder<Model, SelectableModel, Row>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<Model>, keyof NonNullableRecursive<Model>, ''>>(key: ConcatKey): ITypedQueryBuilder<Model, SelectableModel, Row>;
}
interface IJoinOnColumns<Model, JoinedModel> {
    <PropertyType1, PropertyType2>(selectColumn1Function: (c: TransformPropsToFunctionsReturnPropertyType<Model>) => () => PropertyType1, operator: Operator, selectColumn2Function: (c: TransformPropsToFunctionsReturnPropertyType<JoinedModel>) => () => PropertyType2): IJoinOnClause2<Model, JoinedModel>;
}
interface IJoinOn<Model, JoinedModel> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <PropertyType1, PropertyType2>(selectColumn1Function: (c: TransformPropsToFunctionsReturnPropertyType<JoinedModel>) => () => PropertyType1, operator: Operator, selectColumn2Function: (c: TransformPropsToFunctionsReturnPropertyType<Model>) => () => PropertyType2): IJoinOnClause2<Model, JoinedModel>;
    <ConcatKey1 extends NestedKeysOf<NonNullableRecursive<JoinedModel>, keyof NonNullableRecursive<JoinedModel>, ''>, ConcatKey2 extends NestedKeysOf<NonNullableRecursive<Model>, keyof NonNullableRecursive<Model>, ''>>(key1: ConcatKey1, operator: Operator, key2: ConcatKey2): IJoinOnClause2<Model, JoinedModel>;
}
interface IJoinOnVal<Model, JoinedModel> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <PropertyType1>(selectColumn1Function: (c: TransformPropsToFunctionsReturnPropertyType<JoinedModel>) => () => PropertyType1, operator: Operator, value: any): IJoinOnClause2<Model, JoinedModel>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<JoinedModel>, keyof NonNullableRecursive<JoinedModel>, ''>>(key: ConcatKey, operator: Operator, value: any): IJoinOnClause2<Model, JoinedModel>;
}
interface IJoinOnNull<Model, JoinedModel> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <X>(selectColumn1Function: (c: TransformPropsToFunctionsReturnPropertyType<JoinedModel>) => () => X): IJoinOnClause2<Model, JoinedModel>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<JoinedModel>, keyof NonNullableRecursive<JoinedModel>, ''>>(key: ConcatKey): IJoinOnClause2<Model, JoinedModel>;
}
interface IJoinOnClause2<Model, JoinedModel> {
    /**
     * @deprecated since version 2.9, use .on(). Remember that the columns switched eg .onColumns(i=>i.prop, '=' j=>j.prop) should become .on(j=>j.prop, '=', i=>i.prop).
     * Use `npx typed-knex -u join-on-columns-to-on` to upgrade.
     */
    onColumns: IJoinOnColumns<Model, JoinedModel>;
    on: IJoinOn<Model, JoinedModel>;
    orOn: IJoinOn<Model, JoinedModel>;
    andOn: IJoinOn<Model, JoinedModel>;
    onVal: IJoinOnVal<Model, JoinedModel>;
    andOnVal: IJoinOnVal<Model, JoinedModel>;
    orOnVal: IJoinOnVal<Model, JoinedModel>;
    onNull: IJoinOnNull<Model, JoinedModel>;
}
interface IInsertSelect {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <NewPropertyType>(newPropertyClass: new () => NewPropertyType, selectColumn1Function: (c: TransformPropsToFunctionsReturnPropertyType<NewPropertyType>) => any): Promise<void>;
    <NewPropertyType, ConcatKey extends NestedKeysOf<NonNullableRecursive<NewPropertyType>, keyof NonNullableRecursive<NewPropertyType>, ''>>(newPropertyClass: new () => NewPropertyType, ...columnNames: ConcatKey[]): Promise<void>;
}
interface IJoinTableMultipleOnClauses<Model, _SelectableModel, Row> {
    <NewPropertyType, NewPropertyKey extends keyof any>(newPropertyKey: NewPropertyKey, newPropertyClass: new () => NewPropertyType, on: (join: IJoinOnClause2<AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, NewPropertyType>) => void): ITypedQueryBuilder<AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, AddPropertyWithType<Model, NewPropertyKey, NewPropertyType>, Row>;
}
interface ISelectRaw<Model, SelectableModel, Row> {
    <TReturn extends Boolean | String | Number, TName extends keyof any>(name: TName, returnType: IConstructor<TReturn>, query: string): ITypedQueryBuilder<Model, SelectableModel, Record<TName, ObjectToPrimitive<TReturn>> & Row>;
}
interface ISelectQuery<Model, SelectableModel, Row> {
    <TReturn extends Boolean | String | Number, TName extends keyof any, SubQueryModel>(name: TName, returnType: IConstructor<TReturn>, subQueryModel: new () => SubQueryModel, code: (subQuery: ITypedQueryBuilder<SubQueryModel, SubQueryModel, {}>, parent: TransformPropsToFunctionsReturnPropertyName<Model>) => void): ITypedQueryBuilder<Model, SelectableModel, Record<TName, ObjectToPrimitive<TReturn>> & Row>;
}
declare type TransformPropsToFunctionsOnlyLevel1<Level1Type> = {
    [Level1Property in keyof RemoveObjectsFrom<Level1Type>]: Level1Type[Level1Property] extends SelectableColumnTypes ? (() => Pick<Level1Type, Level1Property>) : never;
};
declare type TransformPropsToFunctionsReturnPropertyName<Model> = {
    [P in keyof Model]: Model[P] extends object ? Model[P] extends Required<NonForeignKeyObjects> ? () => P : TransformPropsToFunctionsReturnPropertyName<Model[P]> : () => P;
};
declare type TransformPropsToFunctionsReturnPropertyType<Model> = {
    [P in keyof Model]: Model[P] extends object ? Model[P] extends Required<NonForeignKeyObjects> ? () => Model[P] : TransformPropsToFunctionsReturnPropertyType<Model[P]> : () => Model[P];
};
interface IOrderBy<Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <NewRow>(selectColumnFunction: (c: TransformPropertiesToFunction<NonNullableRecursive<Model>>) => () => NewRow, direction?: 'asc' | 'desc'): ITypedQueryBuilder<Model, SelectableModel, Row>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<SelectableModel>, keyof NonNullableRecursive<SelectableModel>, ''>, TName extends keyof any>(columnNames: ConcatKey, direction?: 'asc' | 'desc'): ITypedQueryBuilder<Model, SelectableModel, Row & Record<TName, GetNestedPropertyType<SelectableModel, ConcatKey>>>;
}
interface IDbFunctionWithAlias<Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <NewPropertyType, TName extends keyof any>(selectColumnFunction: (c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<Model>>) => () => NewPropertyType, name: TName): ITypedQueryBuilder<Model, SelectableModel, Record<TName, ObjectToPrimitive<NewPropertyType>> & Row>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<SelectableModel>, keyof NonNullableRecursive<SelectableModel>, ''>, TName extends keyof any>(columnNames: ConcatKey, name: TName): ITypedQueryBuilder<Model, SelectableModel, Row & Record<TName, GetNestedPropertyType<SelectableModel, ConcatKey>>>;
}
declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
interface ISelectWithFunctionColumns3<Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20, R21, R22, R23, R24, R25, R26, R27, R28, R29>(selectColumnFunction: (c: TransformPropertiesToFunction<SelectableModel>) => [
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
    ]): ITypedQueryBuilder<Model, SelectableModel, Row & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R8 & R9 & R10 & R11 & R12 & R13 & R14 & R15 & R16 & R17 & R18 & R18 & R19 & R20 & R21 & R22 & R23 & R24 & R25 & R26 & R27 & R28 & R28 & R29>;
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <R1>(selectColumnFunction: (c: TransformPropertiesToFunction<SelectableModel>) => () => R1): ITypedQueryBuilder<Model, SelectableModel, Row & R1>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<SelectableModel>, keyof NonNullableRecursive<SelectableModel>, ''>>(...columnNames: ConcatKey[]): ITypedQueryBuilder<Model, SelectableModel, Row & UnionToIntersection<GetNestedProperty<SelectableModel, ConcatKey>>>;
}
interface IFindByPrimaryKey<_Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20, R21, R22, R23, R24, R25, R26, R27, R28, R29>(primaryKeyValue: any, selectColumnFunction: (c: TransformPropsToFunctionsOnlyLevel1<SelectableModel>) => [
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
    ]): Promise<Row & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R8 & R9 & R10 & R11 & R12 & R13 & R14 & R15 & R16 & R17 & R18 & R18 & R19 & R20 & R21 & R22 & R23 & R24 & R25 & R26 & R27 & R28 & R28 & R29 | undefined>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<SelectableModel>, keyof NonNullableRecursive<SelectableModel>, ''>>(primaryKeyValue: any, ...columnNames: ConcatKey[]): Promise<Row & UnionToIntersection<GetNestedProperty<SelectableModel, ConcatKey>> | undefined>;
}
interface IKeyFunctionAsParametersReturnQueryBuider<Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    (selectColumnFunction: (c: TransformPropertiesToFunction<NonNullableRecursive<Model>>) => void): ITypedQueryBuilder<Model, SelectableModel, Row>;
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    (selectColumnFunction: (c: TransformPropertiesToFunction<NonNullableRecursive<Model>>) => void, setToNullIfNullFunction: (r: Row) => void): ITypedQueryBuilder<Model, SelectableModel, Row>;
    <ConcatKey extends NestedForeignKeyKeysOf<NonNullableRecursive<Model>, keyof NonNullableRecursive<Model>, ''>>(key: ConcatKey): ITypedQueryBuilder<Model, SelectableModel, Row>;
}
interface ISelectableColumnKeyFunctionAsParametersReturnQueryBuider<Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    (selectColumnFunction: (c: TransformPropertiesToFunction<NonNullableRecursive<Model>>) => void): ITypedQueryBuilder<Model, SelectableModel, Row>;
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    (selectColumnFunction: (c: TransformPropertiesToFunction<NonNullableRecursive<Model>>) => void, setToNullIfNullFunction: (r: Row) => void): ITypedQueryBuilder<Model, SelectableModel, Row>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<Model>, keyof NonNullableRecursive<Model>, ''>>(key: ConcatKey): ITypedQueryBuilder<Model, SelectableModel, Row>;
}
interface IWhere<Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <PropertyType>(selectColumnFunction: (c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<SelectableModel>>) => () => PropertyType, value: PropertyType): ITypedQueryBuilder<Model, SelectableModel, Row>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<Model>, keyof NonNullableRecursive<Model>, ''>>(key: ConcatKey, value: GetNestedPropertyType<Model, ConcatKey>): ITypedQueryBuilder<Model, SelectableModel, Row>;
}
interface IWhereWithOperator<Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <PropertyType>(selectColumnFunction: (c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<SelectableModel>>) => () => PropertyType, value: PropertyType): ITypedQueryBuilder<Model, SelectableModel, Row>;
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <PropertyType>(selectColumnFunction: (c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<SelectableModel>>) => () => PropertyType, operator: Operator, value: PropertyType): ITypedQueryBuilder<Model, SelectableModel, Row>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<Model>, keyof NonNullableRecursive<Model>, ''>>(key: ConcatKey, value: GetNestedPropertyType<Model, ConcatKey>): ITypedQueryBuilder<Model, SelectableModel, Row>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<Model>, keyof NonNullableRecursive<Model>, ''>>(key: ConcatKey, operator: Operator, value: GetNestedPropertyType<Model, ConcatKey>): ITypedQueryBuilder<Model, SelectableModel, Row>;
}
interface IWhereIn<Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <PropertyType>(selectColumnFunction: (c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<SelectableModel>>) => () => PropertyType, values: PropertyType[]): ITypedQueryBuilder<Model, SelectableModel, Row>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<Model>, keyof NonNullableRecursive<Model>, ''>>(key: ConcatKey, value: GetNestedPropertyType<Model, ConcatKey>[]): ITypedQueryBuilder<Model, SelectableModel, Row>;
}
interface IWhereBetween<Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <PropertyType>(selectColumnFunction: (c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<SelectableModel>>) => () => PropertyType, range: [PropertyType, PropertyType]): ITypedQueryBuilder<Model, SelectableModel, Row>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<Model>, keyof NonNullableRecursive<Model>, ''>, PropertyType extends GetNestedPropertyType<Model, ConcatKey>>(key: ConcatKey, value: [PropertyType, PropertyType]): ITypedQueryBuilder<Model, SelectableModel, Row>;
}
interface IHaving<Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <PropertyType>(selectColumnFunction: (c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<SelectableModel>>) => () => PropertyType, operator: Operator, value: PropertyType): ITypedQueryBuilder<Model, SelectableModel, Row>;
    <ConcatKey extends NestedKeysOf<NonNullableRecursive<Model>, keyof NonNullableRecursive<Model>, ''>>(key: ConcatKey, operator: Operator, value: GetNestedPropertyType<Model, ConcatKey>): ITypedQueryBuilder<Model, SelectableModel, Row>;
}
interface IWhereCompareTwoColumns<Model, SelectableModel, Row> {
    /**
     * @deprecated Use strings instead of functions since version 3.0, use `npx typed-knex -u string-parameters` to upgrade.
     */
    <PropertyType1, _PropertyType2, Model2>(selectColumn1Function: (c: TransformPropsToFunctionsReturnPropertyType<NonNullableRecursive<Model>>) => () => PropertyType1, operator: Operator, selectColumn2Function: (c: TransformPropsToFunctionsReturnPropertyType<Model2>) => any): ITypedQueryBuilder<Model, SelectableModel, Row>;
    <_PropertyType1, _PropertyType2, Model2>(key1: NestedKeysOf<NonNullableRecursive<Model>, keyof NonNullableRecursive<Model>, ''>, operator: Operator, key2: NestedKeysOf<NonNullableRecursive<Model2>, keyof NonNullableRecursive<Model2>, ''>): ITypedQueryBuilder<Model, SelectableModel, Row>;
}
interface IWhereExists<Model, SelectableModel, Row> {
    <SubQueryModel>(subQueryModel: new () => SubQueryModel, code: (subQuery: ITypedQueryBuilder<SubQueryModel, SubQueryModel, {}>, parent: TransformPropsToFunctionsReturnPropertyName<SelectableModel>) => void): ITypedQueryBuilder<Model, SelectableModel, Row>;
}
interface IWhereParentheses<Model, SelectableModel, Row> {
    (code: (subQuery: ITypedQueryBuilder<Model, SelectableModel, Row>) => void): ITypedQueryBuilder<Model, SelectableModel, Row>;
}
interface IUnion<Model, SelectableModel, Row> {
    <SubQueryModel>(subQueryModel: new () => SubQueryModel, code: (subQuery: ITypedQueryBuilder<SubQueryModel, SubQueryModel, {}>) => void): ITypedQueryBuilder<Model, SelectableModel, Row>;
}
export {};
