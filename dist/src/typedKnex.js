"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBeforeUpdateTransform = exports.registerBeforeInsertTransform = exports.TypedKnex = void 0;
const decorators_1 = require("./decorators");
const mapObjectToTableObject_1 = require("./mapObjectToTableObject");
const unflatten_1 = require("./unflatten");
class TypedKnex {
    constructor(knex) {
        this.knex = knex;
    }
    query(tableClass) {
        return new TypedQueryBuilder(tableClass, this.knex);
    }
    beginTransaction() {
        return new Promise(resolve => {
            this.knex
                .transaction(tr => resolve(tr))
                // If this error is not caught here, it will throw, resulting in an unhandledRejection
                // tslint:disable-next-line:no-empty
                .catch(_e => { });
        });
    }
}
exports.TypedKnex = TypedKnex;
let beforeInsertTransform = undefined;
function registerBeforeInsertTransform(f) {
    beforeInsertTransform = f;
}
exports.registerBeforeInsertTransform = registerBeforeInsertTransform;
let beforeUpdateTransform = undefined;
function registerBeforeUpdateTransform(f) {
    beforeUpdateTransform = f;
}
exports.registerBeforeUpdateTransform = registerBeforeUpdateTransform;
class NotImplementedError extends Error {
    constructor() {
        super('Not implemented');
    }
}
function getProxyAndMemories(typedQueryBuilder) {
    const memories = [];
    function allGet(_target, name) {
        if (name === 'memories') {
            return memories;
        }
        if (name === 'getColumnName') {
            return typedQueryBuilder.getColumnName(...memories);
        }
        if (typeof name === 'string') {
            memories.push(name);
        }
        return new Proxy({}, {
            get: allGet,
        });
    }
    const root = new Proxy({}, {
        get: allGet,
    });
    return { root, memories };
}
function getProxyAndMemoriesForArray(typedQueryBuilder) {
    const result = [];
    let counter = -1;
    function allGet(_target, name) {
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
            return typedQueryBuilder.getColumnName(...result[counter]);
        }
        if (typeof name === 'string') {
            result[counter].push(name);
        }
        return new Proxy({}, {
            get: allGet,
        });
    }
    const root = new Proxy({ level: 0 }, {
        get: allGet,
    });
    return { root, result };
}
class TypedQueryBuilder {
    constructor(tableClass, knex, queryBuilder, parentTypedQueryBuilder) {
        this.tableClass = tableClass;
        this.knex = knex;
        this.parentTypedQueryBuilder = parentTypedQueryBuilder;
        this.onlyLogQuery = false;
        this.queryLog = '';
        this.tableName = decorators_1.getTableMetadata(tableClass).tableName;
        this.columns = decorators_1.getColumnProperties(tableClass);
        if (queryBuilder !== undefined) {
            this.queryBuilder = queryBuilder;
            this.queryBuilder.from(this.tableName);
        }
        else {
            this.queryBuilder = this.knex.from(this.tableName);
        }
        this.extraJoinedProperties = [];
        this.shouldUnflatten = true;
    }
    keepFlat() {
        this.shouldUnflatten = false;
        return this;
    }
    async del() {
        await this.queryBuilder.del();
    }
    async delByPrimaryKey(value) {
        const primaryKeyColumnInfo = decorators_1.getPrimaryKeyColumn(this.tableClass);
        await this.queryBuilder.del().where(primaryKeyColumnInfo.name, value);
    }
    async insertItem(newObject) {
        await this.insertItems([newObject]);
    }
    async insertItems(items) {
        items = [...items];
        for (let item of items) {
            if (beforeInsertTransform) {
                item = beforeInsertTransform(item, this);
            }
        }
        items = items.map(item => mapObjectToTableObject_1.mapObjectToTableObject(this.tableClass, item));
        while (items.length > 0) {
            const chunk = items.splice(0, 500);
            const query = this.knex.from(this.tableName).insert(chunk);
            if (this.transaction !== undefined) {
                query.transacting(this.transaction);
            }
            if (this.onlyLogQuery) {
                this.queryLog += query.toQuery() + '\n';
            }
            else {
                await query;
            }
        }
    }
    async updateItem(item) {
        if (beforeUpdateTransform) {
            item = beforeUpdateTransform(item, this);
        }
        const mappedItem = mapObjectToTableObject_1.mapObjectToTableObject(this.tableClass, item);
        if (this.onlyLogQuery) {
            this.queryLog += this.queryBuilder.update(mappedItem).toQuery() + '\n';
        }
        else {
            await this.queryBuilder.update(mappedItem);
        }
    }
    async updateItemByPrimaryKey(primaryKeyValue, item) {
        if (beforeUpdateTransform) {
            item = beforeUpdateTransform(item, this);
        }
        const mappedItem = mapObjectToTableObject_1.mapObjectToTableObject(this.tableClass, item);
        const primaryKeyColumnInfo = decorators_1.getPrimaryKeyColumn(this.tableClass);
        const query = this.queryBuilder
            .update(mappedItem)
            .where(primaryKeyColumnInfo.name, primaryKeyValue);
        if (this.onlyLogQuery) {
            this.queryLog += query.toQuery() + '\n';
        }
        else {
            await query;
        }
    }
    async updateItemsByPrimaryKey(items) {
        const primaryKeyColumnInfo = decorators_1.getPrimaryKeyColumn(this.tableClass);
        items = [...items];
        while (items.length > 0) {
            const chunk = items.splice(0, 500);
            let sql = '';
            for (const item of chunk) {
                const query = this.knex.from(this.tableName);
                if (beforeUpdateTransform) {
                    item.data = beforeUpdateTransform(item.data, this);
                }
                item.data = mapObjectToTableObject_1.mapObjectToTableObject(this.tableClass, item.data);
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
            if (this.onlyLogQuery) {
                this.queryLog += finalQuery.toQuery() + '\n';
            }
            else {
                await finalQuery;
            }
        }
    }
    async execute() {
        await this.queryBuilder;
    }
    limit(value) {
        this.queryBuilder.limit(value);
        return this;
    }
    offset(value) {
        this.queryBuilder.offset(value);
        return this;
    }
    async findById(id, columns) {
        return await this.queryBuilder
            .select(columns)
            .where(this.tableName + '.id', id)
            .first();
    }
    async getCount() {
        const query = this.queryBuilder.count({ count: '*' });
        const result = await query;
        if (result.length === 0) {
            return 0;
        }
        return result[0].count;
    }
    async getFirstOrNull() {
        const items = await this.queryBuilder;
        if (!items || items.length === 0) {
            return null;
        }
        return this.flattenByOption(items[0], arguments[0]);
    }
    async getFirst() {
        const items = await this.queryBuilder;
        if (!items || items.length === 0) {
            throw new Error('Item not found.');
        }
        return this.flattenByOption(items[0], arguments[0]);
    }
    async getSingleOrNull() {
        const items = await this.queryBuilder;
        if (!items || items.length === 0) {
            return null;
        }
        else if (items.length > 1) {
            throw new Error(`More than one item found: ${items.length}.`);
        }
        return this.flattenByOption(items[0], arguments[0]);
    }
    async getSingle() {
        const items = await this.queryBuilder;
        if (!items || items.length === 0) {
            throw new Error('Item not found.');
        }
        else if (items.length > 1) {
            throw new Error(`More than one item found: ${items.length}.`);
        }
        return this.flattenByOption(items[0], arguments[0]);
    }
    selectColumn() {
        let calledArguments = [];
        function saveArguments(...args) {
            calledArguments = args;
        }
        arguments[0](saveArguments);
        this.queryBuilder.select(this.getColumnName(...calledArguments) +
            ' as ' +
            this.getColumnSelectAlias(...calledArguments));
        return this;
    }
    getArgumentsFromColumnFunction3(f) {
        const { root, result } = getProxyAndMemoriesForArray();
        f(root);
        return result;
    }
    select2() {
        const f = arguments[0];
        const columnArgumentsList = this.getArgumentsFromColumnFunction3(f);
        for (const columnArguments of columnArgumentsList) {
            this.queryBuilder.select(this.getColumnName(...columnArguments) +
                ' as ' +
                this.getColumnSelectAlias(...columnArguments));
        }
        return this;
    }
    select() {
        let columnArgumentsList;
        if (typeof arguments[0] === 'string') {
            columnArgumentsList = [...arguments].map((concatKey) => concatKey.split('.'));
        }
        else {
            const f = arguments[0];
            columnArgumentsList = this.getArgumentsFromColumnFunction3(f);
        }
        for (const columnArguments of columnArgumentsList) {
            this.queryBuilder.select(this.getColumnName(...columnArguments) +
                ' as ' +
                this.getColumnSelectAlias(...columnArguments));
        }
        return this;
    }
    orderBy() {
        this.queryBuilder.orderBy(this.getColumnNameWithoutAliasFromFunctionOrString(arguments[0]), arguments[1]);
        return this;
    }
    async getMany() {
        const items = await this.queryBuilder;
        return this.flattenByOption(items, arguments[0]);
    }
    selectRaw() {
        const name = arguments[0];
        const query = arguments[2];
        this.queryBuilder.select(this.knex.raw(`(${query}) as "${name}"`));
        return this;
    }
    innerJoinColumn() {
        return this.joinColumn('innerJoin', arguments[0]);
    }
    leftOuterJoinColumn() {
        return this.joinColumn('leftOuterJoin', arguments[0]);
    }
    innerJoinTable() {
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
        const tableToJoinName = decorators_1.getTableMetadata(tableToJoinClass).tableName;
        const tableToJoinAlias = newPropertyKey;
        const table1Column = this.getColumnName(...column1Parts);
        const table2Column = this.getColumnName(...column2Parts);
        this.queryBuilder.innerJoin(`${tableToJoinName} as ${tableToJoinAlias}`, table1Column, operator, table2Column);
        return this;
    }
    innerJoinTableOnFunction() {
        return this.joinTableOnFunction(this.queryBuilder.innerJoin.bind(this.queryBuilder), arguments[0], arguments[1], arguments[2]);
    }
    leftOuterJoinTableOnFunction() {
        return this.joinTableOnFunction(this.queryBuilder.leftOuterJoin.bind(this.queryBuilder), arguments[0], arguments[1], arguments[2]);
    }
    leftOuterJoinTable() {
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
        const tableToJoinName = decorators_1.getTableMetadata(tableToJoinClass).tableName;
        const tableToJoinAlias = newPropertyKey;
        const table1Column = this.getColumnName(...column1Parts);
        const table2Column = this.getColumnName(...column2Parts);
        this.queryBuilder.leftOuterJoin(`${tableToJoinName} as ${tableToJoinAlias}`, table1Column, operator, table2Column);
        return this;
    }
    whereColumn() {
        // This is called from the sub-query
        // The first column is from the sub-query
        // The second column is from the parent query
        let column1Name;
        let column2Name;
        if (typeof arguments[0] === 'string') {
            column1Name = this.getColumnName(...arguments[0].split('.'));
            if (!this.parentTypedQueryBuilder) {
                throw new Error('Parent query builder is missing, "whereColumn" can only be used in sub-query.');
            }
            column2Name = this.parentTypedQueryBuilder.getColumnName(...arguments[2].split('.'));
        }
        else {
            column1Name = this.getColumnName(...this.getArgumentsFromColumnFunction(arguments[0]));
            if (typeof arguments[2] === 'string') {
                column2Name = arguments[2];
            }
            else if (arguments[2].memories !== undefined) {
                column2Name = arguments[2].getColumnName; // parent this needed ...
            }
            else {
                column2Name = this.getColumnName(...this.getArgumentsFromColumnFunction(arguments[2]));
            }
        }
        const operator = arguments[1];
        this.queryBuilder.whereRaw(`?? ${operator} ??`, [
            column1Name,
            column2Name,
        ]);
        return this;
    }
    toQuery() {
        return this.queryBuilder.toQuery();
    }
    whereNull() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.whereNull.bind(this.queryBuilder), ...arguments);
    }
    whereNotNull() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.whereNotNull.bind(this.queryBuilder), ...arguments);
    }
    orWhereNull() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.orWhereNull.bind(this.queryBuilder), ...arguments);
    }
    orWhereNotNull() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.orWhereNotNull.bind(this.queryBuilder), ...arguments);
    }
    getArgumentsFromColumnFunction(f) {
        if (typeof f === 'string') {
            return f.split('.');
        }
        const { root, memories } = getProxyAndMemories();
        f(root);
        return memories;
    }
    async findByPrimaryKey() {
        const primaryKeyColumnInfo = decorators_1.getPrimaryKeyColumn(this.tableClass);
        const primaryKeyValue = arguments[0];
        let columnArgumentsList;
        if (typeof arguments[1] === 'string') {
            const [, ...columnArguments] = arguments;
            columnArgumentsList = columnArguments.map((concatKey) => concatKey.split('.'));
        }
        else {
            const f = arguments[1];
            columnArgumentsList = this.getArgumentsFromColumnFunction3(f);
        }
        for (const columnArguments of columnArgumentsList) {
            this.queryBuilder.select(this.getColumnName(...columnArguments) +
                ' as ' +
                this.getColumnSelectAlias(...columnArguments));
        }
        this.queryBuilder.where(primaryKeyColumnInfo.name, primaryKeyValue);
        if (this.onlyLogQuery) {
            this.queryLog += this.queryBuilder.toQuery() + '\n';
        }
        else {
            return this.queryBuilder.first();
        }
    }
    where() {
        if (typeof arguments[0] === 'string') {
            return this.callKnexFunctionWithConcatKeyColumn(this.queryBuilder.where.bind(this.queryBuilder), ...arguments);
        }
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.where.bind(this.queryBuilder), ...arguments);
    }
    whereNot() {
        if (typeof arguments[0] === 'string') {
            return this.callKnexFunctionWithConcatKeyColumn(this.queryBuilder.whereNot.bind(this.queryBuilder), ...arguments);
        }
        const columnArguments = this.getArgumentsFromColumnFunction(arguments[0]);
        this.queryBuilder.whereNot(this.getColumnName(...columnArguments), arguments[1]);
        return this;
    }
    andWhere() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.andWhere.bind(this.queryBuilder), ...arguments);
    }
    orWhere() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.orWhere.bind(this.queryBuilder), ...arguments);
    }
    whereIn() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.whereIn.bind(this.queryBuilder), ...arguments);
    }
    whereNotIn() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.whereNotIn.bind(this.queryBuilder), ...arguments);
    }
    orWhereIn() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.orWhereIn.bind(this.queryBuilder), ...arguments);
    }
    orWhereNotIn() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.orWhereNotIn.bind(this.queryBuilder), ...arguments);
    }
    whereBetween() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.whereBetween.bind(this.queryBuilder), ...arguments);
    }
    whereNotBetween() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.whereNotBetween.bind(this.queryBuilder), ...arguments);
    }
    orWhereBetween() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.orWhereBetween.bind(this.queryBuilder), ...arguments);
    }
    orWhereNotBetween() {
        return this.callKnexFunctionWithColumnFunction(this.queryBuilder.orWhereNotBetween.bind(this.queryBuilder), ...arguments);
    }
    callQueryCallbackFunction(functionName, typeOfSubQuery, functionToCall) {
        const that = this;
        this.queryBuilder[functionName](function () {
            const subQuery = this;
            const { root, memories } = getProxyAndMemories(that);
            const subQB = new TypedQueryBuilder(typeOfSubQuery, that.knex, subQuery, that);
            subQB.extraJoinedProperties = that.extraJoinedProperties;
            functionToCall(subQB, root, memories);
        });
    }
    selectQuery() {
        const name = arguments[0];
        const typeOfSubQuery = arguments[2];
        const functionToCall = arguments[3];
        const { root, memories } = getProxyAndMemories(this);
        const subQueryBuilder = new TypedQueryBuilder(typeOfSubQuery, this.knex, undefined, this);
        functionToCall(subQueryBuilder, root, memories);
        this.selectRaw(name, undefined, subQueryBuilder.toQuery());
        return this;
    }
    whereParentheses() {
        this.callQueryCallbackFunction('where', this.tableClass, arguments[0]);
        return this;
    }
    whereExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];
        this.callQueryCallbackFunction('whereExists', typeOfSubQuery, functionToCall);
        return this;
    }
    orWhereExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];
        this.callQueryCallbackFunction('orWhereExists', typeOfSubQuery, functionToCall);
        return this;
    }
    whereNotExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];
        this.callQueryCallbackFunction('whereNotExists', typeOfSubQuery, functionToCall);
        return this;
    }
    orWhereNotExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];
        this.callQueryCallbackFunction('orWhereNotExists', typeOfSubQuery, functionToCall);
        return this;
    }
    whereRaw(sql, ...bindings) {
        this.queryBuilder.whereRaw(sql, bindings);
        return this;
    }
    having() {
        const operator = arguments[1];
        const value = arguments[2];
        this.queryBuilder.having(this.getColumnNameFromFunctionOrString(arguments[0]), operator, value);
        return this;
    }
    havingIn() {
        const value = arguments[1];
        this.queryBuilder.havingIn(this.getColumnNameFromFunctionOrString(arguments[0]), value);
        return this;
    }
    havingNotIn() {
        const value = arguments[1];
        this.queryBuilder.havingNotIn(this.getColumnNameFromFunctionOrString(arguments[0]), value);
        return this;
    }
    havingNull() {
        this.queryBuilder.havingNull(this.getColumnNameFromFunctionOrString(arguments[0]));
        return this;
    }
    havingNotNull() {
        this.queryBuilder.havingNotNull(this.getColumnNameFromFunctionOrString(arguments[0]));
        return this;
    }
    havingExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];
        this.callQueryCallbackFunction('havingExists', typeOfSubQuery, functionToCall);
        return this;
    }
    havingNotExists() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];
        this.callQueryCallbackFunction('havingNotExists', typeOfSubQuery, functionToCall);
        return this;
    }
    havingRaw(sql, ...bindings) {
        this.queryBuilder.havingRaw(sql, bindings);
        return this;
    }
    havingBetween() {
        const value = arguments[1];
        this.queryBuilder.havingBetween(this.getColumnNameFromFunctionOrString(arguments[0]), value);
        return this;
    }
    havingNotBetween() {
        const value = arguments[1];
        this.queryBuilder.havingNotBetween(this.getColumnNameFromFunctionOrString(arguments[0]), value);
        return this;
    }
    orderByRaw(sql, ...bindings) {
        this.queryBuilder.orderByRaw(sql, bindings);
        return this;
    }
    union() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];
        this.callQueryCallbackFunction('union', typeOfSubQuery, functionToCall);
        return this;
    }
    unionAll() {
        const typeOfSubQuery = arguments[0];
        const functionToCall = arguments[1];
        this.callQueryCallbackFunction('unionAll', typeOfSubQuery, functionToCall);
        return this;
    }
    returningColumn() {
        throw new NotImplementedError();
    }
    returningColumns() {
        throw new NotImplementedError();
    }
    transacting(trx) {
        this.queryBuilder.transacting(trx);
        this.transaction = trx;
        return this;
    }
    min() {
        return this.functionWithAlias('min', arguments[0], arguments[1]);
    }
    count() {
        return this.functionWithAlias('count', arguments[0], arguments[1]);
    }
    countDistinct() {
        return this.functionWithAlias('countDistinct', arguments[0], arguments[1]);
    }
    max() {
        return this.functionWithAlias('max', arguments[0], arguments[1]);
    }
    sum() {
        return this.functionWithAlias('sum', arguments[0], arguments[1]);
    }
    sumDistinct() {
        return this.functionWithAlias('sumDistinct', arguments[0], arguments[1]);
    }
    avg() {
        return this.functionWithAlias('avg', arguments[0], arguments[1]);
    }
    avgDistinct() {
        return this.functionWithAlias('avgDistinct', arguments[0], arguments[1]);
    }
    increment() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.increment(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }
    decrement() {
        const value = arguments[arguments.length - 1];
        this.queryBuilder.decrement(this.getColumnNameFromArgumentsIgnoringLastParameter(...arguments), value);
        return this;
    }
    async truncate() {
        await this.queryBuilder.truncate();
    }
    async insertSelect() {
        const tableName = decorators_1.getTableMetadata(arguments[0]).tableName;
        const typedQueryBuilderForInsert = new TypedQueryBuilder(arguments[0], this.knex);
        let columnArgumentsList;
        if (typeof arguments[1] === 'string') {
            const [, ...columnArguments] = arguments;
            columnArgumentsList = columnArguments.map((concatKey) => concatKey.split('.'));
        }
        else {
            const f = arguments[1];
            columnArgumentsList = this.getArgumentsFromColumnFunction3(f);
        }
        const insertColumns = columnArgumentsList.map(i => typedQueryBuilderForInsert.getColumnName(...i));
        // https://github.com/knex/knex/issues/1056
        const qb = this.knex.from(this.knex.raw(`?? (${insertColumns.map(() => '??').join(',')})`, [tableName, ...insertColumns]))
            .insert(this.knex.raw(this.toQuery()));
        const finalQuery = qb.toString();
        this.toQuery = () => finalQuery;
        await qb;
    }
    clearSelect() {
        this.queryBuilder.clearSelect();
        return this;
    }
    clearWhere() {
        this.queryBuilder.clearWhere();
        return this;
    }
    clearOrder() {
        this.queryBuilder.clearOrder();
        return this;
    }
    distinct() {
        this.queryBuilder.distinct();
        return this;
    }
    clone() {
        const queryBuilderClone = this.queryBuilder.clone();
        const typedQueryBuilderClone = new TypedQueryBuilder(this.tableClass, this.knex, queryBuilderClone);
        return typedQueryBuilderClone;
    }
    groupBy() {
        this.queryBuilder.groupBy(this.getColumnNameFromFunctionOrString(arguments[0]));
        return this;
    }
    groupByRaw(sql, ...bindings) {
        this.queryBuilder.groupByRaw(sql, bindings);
        return this;
    }
    useKnexQueryBuilder(f) {
        f(this.queryBuilder);
        return this;
    }
    getColumnName(...keys) {
        return this.getColumnNameTable(undefined, undefined, ...keys);
    }
    getColumnNameTable(tableName, tableClass, ...keys) {
        const firstPartName = this.getColumnNameWithoutAliasTable(tableName, tableClass, keys[0]);
        if (keys.length === 1) {
            return firstPartName;
        }
        else {
            let columnName;
            let columnAlias;
            let currentClass;
            let currentColumnPart;
            const extraJoinedProperty = this.extraJoinedProperties.find(i => i.name === keys[0]);
            if (extraJoinedProperty) {
                columnName = '';
                columnAlias = extraJoinedProperty.name;
                currentClass = extraJoinedProperty.propertyType;
            }
            else {
                currentColumnPart = decorators_1.getColumnInformation(this.tableClass, keys[0]);
                columnName = '';
                columnAlias = currentColumnPart.propertyKey;
                currentClass = currentColumnPart.columnClass;
            }
            for (let i = 1; i < keys.length; i++) {
                currentColumnPart = decorators_1.getColumnInformation(currentClass, keys[i]);
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
    getColumnNameWithDifferentRoot(_rootKey, ...keys) {
        const firstPartName = this.getColumnNameWithoutAlias(keys[0]);
        if (keys.length === 1) {
            return firstPartName;
        }
        else {
            let currentColumnPart = decorators_1.getColumnInformation(this.tableClass, keys[0]);
            let columnName = '';
            let columnAlias = currentColumnPart.propertyKey;
            let currentClass = currentColumnPart.columnClass;
            for (let i = 0; i < keys.length; i++) {
                currentColumnPart = decorators_1.getColumnInformation(currentClass, keys[i]);
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
    functionWithAlias(knexFunctionName, f, aliasName) {
        this.queryBuilder[knexFunctionName](`${this.getColumnNameWithoutAliasFromFunctionOrString(f)} as ${aliasName}`);
        return this;
    }
    getColumnNameFromFunctionOrString(f) {
        let columnParts;
        if (typeof f === 'string') {
            columnParts = f.split('.');
        }
        else {
            columnParts = this.getArgumentsFromColumnFunction(f);
        }
        return this.getColumnName(...columnParts);
    }
    getColumnNameWithoutAliasFromFunctionOrString(f) {
        let columnParts;
        if (typeof f === 'string') {
            columnParts = f.split('.');
        }
        else {
            columnParts = this.getArgumentsFromColumnFunction(f);
        }
        return this.getColumnNameWithoutAlias(...columnParts);
    }
    joinColumn(joinType, f) {
        let columnToJoinArguments;
        if (typeof f === 'string') {
            columnToJoinArguments = f.split('.');
        }
        else {
            columnToJoinArguments = this.getArgumentsFromColumnFunction(f);
        }
        const columnToJoinName = this.getColumnName(...columnToJoinArguments);
        let secondColumnName = columnToJoinArguments[0];
        let secondColumnAlias = columnToJoinArguments[0];
        let secondColumnClass = decorators_1.getColumnInformation(this.tableClass, secondColumnName).columnClass;
        for (let i = 1; i < columnToJoinArguments.length; i++) {
            const beforeSecondColumnAlias = secondColumnAlias;
            const beforeSecondColumnClass = secondColumnClass;
            const columnInfo = decorators_1.getColumnInformation(beforeSecondColumnClass, columnToJoinArguments[i]);
            secondColumnName = columnInfo.name;
            secondColumnAlias =
                beforeSecondColumnAlias + '_' + columnInfo.propertyKey;
            secondColumnClass = columnInfo.columnClass;
        }
        const tableToJoinName = decorators_1.getTableMetadata(secondColumnClass).tableName;
        const tableToJoinAlias = secondColumnAlias;
        const tableToJoinJoinColumnName = `${tableToJoinAlias}.${decorators_1.getPrimaryKeyColumn(secondColumnClass).name}`;
        if (joinType === 'innerJoin') {
            this.queryBuilder.innerJoin(`${tableToJoinName} as ${tableToJoinAlias}`, tableToJoinJoinColumnName, columnToJoinName);
        }
        else if (joinType === 'leftOuterJoin') {
            this.queryBuilder.leftOuterJoin(`${tableToJoinName} as ${tableToJoinAlias}`, tableToJoinJoinColumnName, columnToJoinName);
        }
        return this;
    }
    getColumnNameFromArgumentsIgnoringLastParameter(...keys) {
        const argumentsExceptLast = keys.slice(0, -1);
        return this.getColumnName(...argumentsExceptLast);
    }
    getColumnNameWithoutAlias(...keys) {
        return this.getColumnNameWithoutAliasTable(undefined, undefined, ...keys);
    }
    getColumnNameWithoutAliasTable(tableName, tableClass, ...keys) {
        if (!tableName) {
            tableName = this.tableName;
        }
        if (!tableClass) {
            tableClass = this.tableClass;
        }
        if (keys.length === 1) {
            const extraJoinedProperty = this.extraJoinedProperties.find(i => i.name === keys[0]);
            if (extraJoinedProperty) {
                return extraJoinedProperty.name;
            }
            else {
                const columnInfo = decorators_1.getColumnInformation(tableClass, keys[0]);
                return tableName + '.' + columnInfo.name;
            }
        }
        else {
            let currentColumnPart = decorators_1.getColumnInformation(tableClass, keys[0]);
            let result = currentColumnPart.propertyKey;
            let currentClass = currentColumnPart.columnClass;
            for (let i = 1; i < keys.length; i++) {
                currentColumnPart = decorators_1.getColumnInformation(currentClass, keys[i]);
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
    getColumnSelectAlias(...keys) {
        if (keys.length === 1) {
            return keys[0];
        }
        else {
            let columnAlias = keys[0];
            for (let i = 1; i < keys.length; i++) {
                columnAlias += '.' + keys[i];
            }
            return columnAlias;
        }
    }
    flattenByOption(o, flattenOption) {
        if (flattenOption === unflatten_1.FlattenOption.noFlatten || this.shouldUnflatten === false) {
            return o;
        }
        const unflattened = unflatten_1.unflatten(o);
        if (flattenOption === undefined ||
            flattenOption === unflatten_1.FlattenOption.flatten) {
            return unflattened;
        }
        return unflatten_1.setToNull(unflattened);
    }
    joinTableOnFunction(queryBuilderJoin, newPropertyKey, newPropertyType, onFunction) {
        this.extraJoinedProperties.push({
            name: newPropertyKey,
            propertyType: newPropertyType,
        });
        const tableToJoinClass = newPropertyType;
        const tableToJoinName = decorators_1.getTableMetadata(tableToJoinClass).tableName;
        const tableToJoinAlias = newPropertyKey;
        let knexOnObject;
        queryBuilderJoin(`${tableToJoinName} as ${tableToJoinAlias}`, function () {
            knexOnObject = this;
        });
        const onWithJoinedColumnOperatorColumn = (joinedColumn, operator, modelColumn, functionName) => {
            let column1Arguments;
            let column2Arguments;
            if (typeof modelColumn === 'string') {
                column1Arguments = modelColumn.split('.');
                column2Arguments = joinedColumn.split('.');
            }
            else {
                column1Arguments = this.getArgumentsFromColumnFunction(modelColumn);
                column2Arguments = this.getArgumentsFromColumnFunction(joinedColumn);
            }
            const column1Name = this.getColumnName(...column1Arguments);
            const column2Name = this.getColumnNameTable(decorators_1.getTableMetadata(tableToJoinClass).tableName, tableToJoinClass, ...column2Arguments);
            const column2NameWithAlias = (() => {
                const column2AliasArr = column2Name.split(".");
                column2AliasArr[0] = tableToJoinAlias;
                return column2AliasArr.join(".");
            })();
            knexOnObject[functionName](column1Name, operator, column2NameWithAlias);
        };
        const onWithColumnOperatorValue = (joinedColumn, operator, value, functionName) => {
            // const column1Arguments = this.getArgumentsFromColumnFunction(
            //     joinedColumn
            // );
            const column2Arguments = this.getArgumentsFromColumnFunction(joinedColumn);
            const column2ArgumentsWithJoinedTable = [
                tableToJoinAlias,
                ...column2Arguments,
            ];
            knexOnObject[functionName](
            // this.getColumnName(...column1Arguments),
            column2ArgumentsWithJoinedTable.join('.'), operator, value
            // column2ArgumentsWithJoinedTable.join('.')
            );
        };
        const onObject = {
            onColumns: (column1, operator, column2) => {
                onWithJoinedColumnOperatorColumn(column2, operator, column1, 'on');
                return onObject;
            },
            on: (column1, operator, column2) => {
                onWithJoinedColumnOperatorColumn(column1, operator, column2, 'on');
                return onObject;
            },
            andOn: (column1, operator, column2) => {
                onWithJoinedColumnOperatorColumn(column1, operator, column2, 'andOn');
                return onObject;
            },
            orOn: (column1, operator, column2) => {
                onWithJoinedColumnOperatorColumn(column1, operator, column2, 'orOn');
                return onObject;
            },
            onVal: (column1, operator, value) => {
                onWithColumnOperatorValue(column1, operator, value, 'onVal');
                return onObject;
            },
            andOnVal: (column1, operator, value) => {
                onWithColumnOperatorValue(column1, operator, value, 'andOnVal');
                return onObject;
            },
            orOnVal: (column1, operator, value) => {
                onWithColumnOperatorValue(column1, operator, value, 'orOnVal');
                return onObject;
            },
            onNull: (f) => {
                const column2Arguments = this.getArgumentsFromColumnFunction(f);
                const column2ArgumentsWithJoinedTable = [
                    tableToJoinAlias,
                    ...column2Arguments,
                ];
                knexOnObject.onNull(column2ArgumentsWithJoinedTable.join('.'));
                return onObject;
            },
        };
        onFunction(onObject);
        return this;
    }
    callKnexFunctionWithColumnFunction(knexFunction, ...args) {
        if (typeof args[0] === 'string') {
            return this.callKnexFunctionWithConcatKeyColumn(knexFunction, ...args);
        }
        const columnArguments = this.getArgumentsFromColumnFunction(args[0]);
        if (args.length === 3) {
            knexFunction(this.getColumnName(...columnArguments), args[1], args[2]);
        }
        else {
            knexFunction(this.getColumnName(...columnArguments), args[1]);
        }
        return this;
    }
    callKnexFunctionWithConcatKeyColumn(knexFunction, ...args) {
        const columnName = this.getColumnName(...args[0].split('.'));
        if (args.length === 3) {
            knexFunction(columnName, args[1], args[2]);
        }
        else {
            knexFunction(columnName, args[1]);
        }
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZWRLbmV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVkS25leC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSw2Q0FLc0I7QUFDdEIscUVBQWtFO0FBT2xFLDJDQUFrRTtBQUVsRSxNQUFhLFNBQVM7SUFDbEIsWUFBb0IsSUFBVTtRQUFWLFNBQUksR0FBSixJQUFJLENBQU07SUFBSSxDQUFDO0lBRTVCLEtBQUssQ0FBSSxVQUF1QjtRQUNuQyxPQUFPLElBQUksaUJBQWlCLENBQVUsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU0sZ0JBQWdCO1FBQ25CLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLElBQUk7aUJBQ0osV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMvQixzRkFBc0Y7Z0JBQ3RGLG9DQUFvQztpQkFDbkMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBR0o7QUFsQkQsOEJBa0JDO0FBRUQsSUFBSSxxQkFBcUIsR0FBRyxTQUVzQixDQUFDO0FBRW5ELFNBQWdCLDZCQUE2QixDQUN6QyxDQUFvRTtJQUVwRSxxQkFBcUIsR0FBRyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUpELHNFQUlDO0FBRUQsSUFBSSxxQkFBcUIsR0FBRyxTQUVzQixDQUFDO0FBRW5ELFNBQWdCLDZCQUE2QixDQUN6QyxDQUFvRTtJQUVwRSxxQkFBcUIsR0FBRyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUpELHNFQUlDO0FBRUQsTUFBTSxtQkFBb0IsU0FBUSxLQUFLO0lBQ25DO1FBQ0ksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDN0IsQ0FBQztDQUNKO0FBazJCRCxTQUFT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QUFDO0lBQ2hCLENBQUM7Q0FFSiIsInNvdXJjZXNDb250ZW50IjpbIi8vIHRzbGludDpkaXNhYmxlOnVzZS1uYW1lZC1wYXJhbWV0ZXJcbmltcG9ydCAqIGFzIEtuZXggZnJvbSAna25leCc7XG5pbXBvcnQge1xuICAgIGdldENvbHVtbkluZm9ybWF0aW9uLFxuICAgIGdldENvbHVtblByb3BlcnRpZXMsXG4gICAgZ2V0UHJpbWFyeUtleUNvbHVtbixcbiAgICBnZXRUYWJsZU1ldGFkYXRhXG59IGZyb20gJy4vZGVjb3JhdG9ycyc7XG5pbXBvcnQgeyBtYXBPYmplY3RUb1RhYmxlT2JqZWN0IH0gZnJvbSAnLi9tYXBPYmplY3RUb1RhYmxlT2JqZWN0JztcbmltcG9ydCB7IE5lc3RlZEZvcmVpZ25LZXlLZXlzT2YsIE5lc3RlZEtleXNPZiB9IGZyb20gJy4vTmVzdGVkS2V5c09mJztcbmltcG9ydCB7IE5vbkZvcmVpZ25LZXlPYmplY3RzIH0gZnJvbSAnLi9Ob25Gb3JlaWduS2V5T2JqZWN0cyc7XG5pbXBvcnQgeyBOb25OdWxsYWJsZVJlY3Vyc2l2ZSB9IGZyb20gJy4vTm9uTnVsbGFibGVSZWN1cnNpdmUnO1xuaW1wb3J0IHsgR2V0TmVzdGVkUHJvcGVydHksIEdldE5lc3RlZFByb3BlcnR5VHlwZSB9IGZyb20gJy4vUHJvcGVydHlUeXBlcyc7XG5pbXBvcnQgeyBTZWxlY3RhYmxlQ29sdW1uVHlwZXMgfSBmcm9tICcuL1NlbGVjdGFibGVDb2x1bW5UeXBlcyc7XG5pbXBvcnQgeyBUcmFuc2Zvcm1Qcm9wZXJ0aWVzVG9GdW5jdGlvbiB9IGZyb20gJy4vVHJhbnNmb3JtUHJvcGVydGllc1RvRnVuY3Rpb24nO1xuaW1wb3J0IHsgRmxhdHRlbk9wdGlvbiwgc2V0VG9OdWxsLCB1bmZsYXR0ZW4gfSBmcm9tICcuL3VuZmxhdHRlbic7XG5cbmV4cG9ydCBjbGFzcyBUeXBlZEtuZXgge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUga25leDogS25leCkgeyB9XG5cbiAgICBwdWJsaWMgcXVlcnk8VD4odGFibGVDbGFzczogbmV3ICgpID0+IFQpOiBJVHlwZWRRdWVyeUJ1aWxkZXI8VCwgVCwgVD4ge1xuICAgICAgICByZXR1cm4gbmV3IFR5cGVkUXVlcnlCdWlsZGVyPFQsIFQsIFQ+KHRhYmxlQ2xhc3MsIHRoaXMua25leCk7XG4gICAgfVxuXG4gICAgcHVibGljIGJlZ2luVHJhbnNhY3Rpb24oKTogUHJvbWlzZTxLbmV4LlRyYW5zYWN0aW9uPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMua25leFxuICAgICAgICAgICAgICAgIC50cmFuc2FjdGlvbih0ciA9PiByZXNvbHZlKHRyKSlcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGVycm9yIGlzIG5vdCBjYXVnaHQgaGVyZSwgaXQgd2lsbCB0aHJvdywgcmVzdWx0aW5nIGluIGFuIHVuaGFuZGxlZFJlamVjdGlvblxuICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1lbXB0eVxuICAgICAgICAgICAgICAgIC5jYXRjaChfZSA9PiB7IH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxufVxuXG5sZXQgYmVmb3JlSW5zZXJ0VHJhbnNmb3JtID0gdW5kZWZpbmVkIGFzXG4gICAgfCB1bmRlZmluZWRcbiAgICB8ICgoaXRlbTogYW55LCB0eXBlZFF1ZXJ5QnVpbGRlcjogYW55KSA9PiBhbnkpO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCZWZvcmVJbnNlcnRUcmFuc2Zvcm08VD4oXG4gICAgZjogKGl0ZW06IFQsIHR5cGVkUXVlcnlCdWlsZGVyOiBJVHlwZWRRdWVyeUJ1aWxkZXI8e30sIHt9LCB7fT4pID0+IFRcbikge1xuICAgIGJlZm9yZUluc2VydFRyYW5zZm9ybSA9IGY7XG59XG5cbmxldCBiZWZvcmVVcGRhdGVUcmFuc2Zvcm0gPSB1bmRlZmluZWQgYXNcbiAgICB8IHVuZGVmaW5lZFxuICAgIHwgKChpdGVtOiBhbnksIHR5cGVkUXVlcnlCdWlsZGVyOiBhbnkpID0+IGFueSk7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckJlZm9yZVVwZGF0ZVRyYW5zZm9ybTxUPihcbiAgICBmOiAoaXRlbTogVCwgdHlwZWRRdWVyeUJ1aWxkZXI6IElUeXBlZFF1ZXJ5QnVpbGRlcjx7fSwge30sIHt9PikgPT4gVFxuKSB7XG4gICAgYmVmb3JlVXBkYXRlVHJhbnNmb3JtID0gZjtcbn1cblxuY2xhc3MgTm90SW1wbGVtZW50ZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PiB7XG4gICAgY29sdW1uczogeyBuYW1lOiBzdHJpbmcgfVtdO1xuXG4gICAgd2hlcmU6IElXaGVyZVdpdGhPcGVyYXRvcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuICAgIGFuZFdoZXJlOiBJV2hlcmVXaXRoT3BlcmF0b3I8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcbiAgICBvcldoZXJlOiBJV2hlcmVXaXRoT3BlcmF0b3I8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcbiAgICB3aGVyZU5vdDogSVdoZXJlPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG4gICAgc2VsZWN0OiBJU2VsZWN0V2l0aEZ1bmN0aW9uQ29sdW1uczM8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93IGV4dGVuZHMgTW9kZWwgPyB7fSA6IFJvdz47XG5cbiAgICBzZWxlY3RRdWVyeTogSVNlbGVjdFF1ZXJ5PE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICBvcmRlckJ5OiBJT3JkZXJCeTxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuICAgIGlubmVySm9pbkNvbHVtbjogSUtleUZ1bmN0aW9uQXNQYXJhbWV0ZXJzUmV0dXJuUXVlcnlCdWlkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcbiAgICBsZWZ0T3V0ZXJKb2luQ29sdW1uOiBJS2V5RnVuY3Rpb25Bc1BhcmFtZXRlcnNSZXR1cm5RdWVyeUJ1aWRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG4gICAgd2hlcmVDb2x1bW46IElXaGVyZUNvbXBhcmVUd29Db2x1bW5zPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICB3aGVyZU51bGw6IElDb2x1bW5QYXJhbWV0ZXJOb1Jvd1RyYW5zZm9ybWF0aW9uPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG4gICAgd2hlcmVOb3ROdWxsOiBJQ29sdW1uUGFyYW1ldGVyTm9Sb3dUcmFuc2Zvcm1hdGlvbjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuICAgIG9yV2hlcmVOdWxsOiBJQ29sdW1uUGFyYW1ldGVyTm9Sb3dUcmFuc2Zvcm1hdGlvbjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuICAgIG9yV2hlcmVOb3ROdWxsOiBJQ29sdW1uUGFyYW1ldGVyTm9Sb3dUcmFuc2Zvcm1hdGlvbjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG4gICAgbGVmdE91dGVySm9pblRhYmxlT25GdW5jdGlvbjogSUpvaW5UYWJsZU11bHRpcGxlT25DbGF1c2VzPFxuICAgICAgICBNb2RlbCxcbiAgICAgICAgU2VsZWN0YWJsZU1vZGVsLFxuICAgICAgICBSb3cgZXh0ZW5kcyBNb2RlbCA/IHt9IDogUm93XG4gICAgPjtcbiAgICBpbm5lckpvaW5UYWJsZU9uRnVuY3Rpb246IElKb2luVGFibGVNdWx0aXBsZU9uQ2xhdXNlczxcbiAgICAgICAgTW9kZWwsXG4gICAgICAgIFNlbGVjdGFibGVNb2RlbCxcbiAgICAgICAgUm93IGV4dGVuZHMgTW9kZWwgPyB7fSA6IFJvd1xuICAgID47XG5cbiAgICBzZWxlY3RSYXc6IElTZWxlY3RSYXc8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93IGV4dGVuZHMgTW9kZWwgPyB7fSA6IFJvdz47XG5cbiAgICBmaW5kQnlQcmltYXJ5S2V5OiBJRmluZEJ5UHJpbWFyeUtleTxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3cgZXh0ZW5kcyBNb2RlbCA/IHt9IDogUm93PjtcblxuICAgIHdoZXJlSW46IElXaGVyZUluPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG4gICAgd2hlcmVOb3RJbjogSVdoZXJlSW48TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcblxuICAgIG9yV2hlcmVJbjogSVdoZXJlSW48TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcbiAgICBvcldoZXJlTm90SW46IElXaGVyZUluPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICB3aGVyZUJldHdlZW46IElXaGVyZUJldHdlZW48TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcbiAgICB3aGVyZU5vdEJldHdlZW46IElXaGVyZUJldHdlZW48TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcbiAgICBvcldoZXJlQmV0d2VlbjogSVdoZXJlQmV0d2VlbjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuICAgIG9yV2hlcmVOb3RCZXR3ZWVuOiBJV2hlcmVCZXR3ZWVuPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICB3aGVyZUV4aXN0czogSVdoZXJlRXhpc3RzPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICBvcldoZXJlRXhpc3RzOiBJV2hlcmVFeGlzdHM8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcbiAgICB3aGVyZU5vdEV4aXN0czogSVdoZXJlRXhpc3RzPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG4gICAgb3JXaGVyZU5vdEV4aXN0czogSVdoZXJlRXhpc3RzPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICB3aGVyZVBhcmVudGhlc2VzOiBJV2hlcmVQYXJlbnRoZXNlczxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG4gICAgZ3JvdXBCeTogSVNlbGVjdGFibGVDb2x1bW5LZXlGdW5jdGlvbkFzUGFyYW1ldGVyc1JldHVyblF1ZXJ5QnVpZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICBoYXZpbmc6IElIYXZpbmc8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcblxuICAgIGhhdmluZ051bGw6IElTZWxlY3RhYmxlQ29sdW1uS2V5RnVuY3Rpb25Bc1BhcmFtZXRlcnNSZXR1cm5RdWVyeUJ1aWRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuICAgIGhhdmluZ05vdE51bGw6IElTZWxlY3RhYmxlQ29sdW1uS2V5RnVuY3Rpb25Bc1BhcmFtZXRlcnNSZXR1cm5RdWVyeUJ1aWRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG4gICAgaGF2aW5nSW46IElXaGVyZUluPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG4gICAgaGF2aW5nTm90SW46IElXaGVyZUluPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICBoYXZpbmdFeGlzdHM6IElXaGVyZUV4aXN0czxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuICAgIGhhdmluZ05vdEV4aXN0czogSVdoZXJlRXhpc3RzPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICBoYXZpbmdCZXR3ZWVuOiBJV2hlcmVCZXR3ZWVuPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG4gICAgaGF2aW5nTm90QmV0d2VlbjogSVdoZXJlQmV0d2VlbjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG4gICAgdW5pb246IElVbmlvbjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuICAgIHVuaW9uQWxsOiBJVW5pb248TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcblxuICAgIG1pbjogSURiRnVuY3Rpb25XaXRoQWxpYXM8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93IGV4dGVuZHMgTW9kZWwgPyB7fSA6IFJvdz47XG5cbiAgICBjb3VudDogSURiRnVuY3Rpb25XaXRoQWxpYXM8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93IGV4dGVuZHMgTW9kZWwgPyB7fSA6IFJvdz47XG4gICAgY291bnREaXN0aW5jdDogSURiRnVuY3Rpb25XaXRoQWxpYXM8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93IGV4dGVuZHMgTW9kZWwgPyB7fSA6IFJvdz47XG4gICAgbWF4OiBJRGJGdW5jdGlvbldpdGhBbGlhczxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3cgZXh0ZW5kcyBNb2RlbCA/IHt9IDogUm93PjtcbiAgICBzdW06IElEYkZ1bmN0aW9uV2l0aEFsaWFzPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdyBleHRlbmRzIE1vZGVsID8ge30gOiBSb3c+O1xuICAgIHN1bURpc3RpbmN0OiBJRGJGdW5jdGlvbldpdGhBbGlhczxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3cgZXh0ZW5kcyBNb2RlbCA/IHt9IDogUm93PjtcbiAgICBhdmc6IElEYkZ1bmN0aW9uV2l0aEFsaWFzPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdyBleHRlbmRzIE1vZGVsID8ge30gOiBSb3c+O1xuICAgIGF2Z0Rpc3RpbmN0OiBJRGJGdW5jdGlvbldpdGhBbGlhczxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3cgZXh0ZW5kcyBNb2RlbCA/IHt9IDogUm93PjtcblxuICAgIGluc2VydFNlbGVjdDogSUluc2VydFNlbGVjdDtcblxuICAgIGNsZWFyU2VsZWN0KCk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBNb2RlbD47XG4gICAgY2xlYXJXaGVyZSgpOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcbiAgICBjbGVhck9yZGVyKCk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG4gICAgbGltaXQodmFsdWU6IG51bWJlcik6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuICAgIG9mZnNldCh2YWx1ZTogbnVtYmVyKTogSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICB1c2VLbmV4UXVlcnlCdWlsZGVyKGY6IChxdWVyeTogS25leC5RdWVyeUJ1aWxkZXIpID0+IHZvaWQpOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcbiAgICB0b1F1ZXJ5KCk6IHN0cmluZztcblxuICAgIGdldEZpcnN0T3JOdWxsKGZsYXR0ZW5PcHRpb24/OiBGbGF0dGVuT3B0aW9uKTogUHJvbWlzZTxSb3cgfCBudWxsPjtcbiAgICBnZXRGaXJzdChmbGF0dGVuT3B0aW9uPzogRmxhdHRlbk9wdGlvbik6IFByb21pc2U8Um93PjtcbiAgICBnZXRTaW5nbGVPck51bGwoZmxhdHRlbk9wdGlvbj86IEZsYXR0ZW5PcHRpb24pOiBQcm9taXNlPFJvdyB8IG51bGw+O1xuICAgIGdldFNpbmdsZShmbGF0dGVuT3B0aW9uPzogRmxhdHRlbk9wdGlvbik6IFByb21pc2U8Um93PjtcbiAgICBnZXRNYW55KGZsYXR0ZW5PcHRpb24/OiBGbGF0dGVuT3B0aW9uKTogUHJvbWlzZTxSb3dbXT47XG4gICAgZ2V0Q291bnQoKTogUHJvbWlzZTxudW1iZXI+O1xuICAgIGluc2VydEl0ZW0obmV3T2JqZWN0OiBQYXJ0aWFsPFJlbW92ZU9iamVjdHNGcm9tPE1vZGVsPj4pOiBQcm9taXNlPHZvaWQ+O1xuICAgIGluc2VydEl0ZW1zKGl0ZW1zOiBQYXJ0aWFsPFJlbW92ZU9iamVjdHNGcm9tPE1vZGVsPj5bXSk6IFByb21pc2U8dm9pZD47XG4gICAgZGVsKCk6IFByb21pc2U8dm9pZD47XG4gICAgZGVsQnlQcmltYXJ5S2V5KHByaW1hcnlLZXlWYWx1ZTogYW55KTogUHJvbWlzZTx2b2lkPjtcbiAgICB1cGRhdGVJdGVtKGl0ZW06IFBhcnRpYWw8UmVtb3ZlT2JqZWN0c0Zyb208TW9kZWw+Pik6IFByb21pc2U8dm9pZD47XG4gICAgdXBkYXRlSXRlbUJ5UHJpbWFyeUtleShcbiAgICAgICAgcHJpbWFyeUtleVZhbHVlOiBhbnksXG4gICAgICAgIGl0ZW06IFBhcnRpYWw8UmVtb3ZlT2JqZWN0c0Zyb208TW9kZWw+PlxuICAgICk6IFByb21pc2U8dm9pZD47XG4gICAgdXBkYXRlSXRlbXNCeVByaW1hcnlLZXkoXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICBwcmltYXJ5S2V5VmFsdWU6IGFueTtcbiAgICAgICAgICAgIGRhdGE6IFBhcnRpYWw8UmVtb3ZlT2JqZWN0c0Zyb208TW9kZWw+PjtcbiAgICAgICAgfVtdXG4gICAgKTogUHJvbWlzZTx2b2lkPjtcbiAgICBleGVjdXRlKCk6IFByb21pc2U8dm9pZD47XG4gICAgd2hlcmVSYXcoXG4gICAgICAgIHNxbDogc3RyaW5nLFxuICAgICAgICAuLi5iaW5kaW5nczogc3RyaW5nW11cbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcbiAgICBoYXZpbmdSYXcoXG4gICAgICAgIHNxbDogc3RyaW5nLFxuICAgICAgICAuLi5iaW5kaW5nczogc3RyaW5nW11cbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcblxuICAgIHRyYW5zYWN0aW5nKHRyeDogS25leC5UcmFuc2FjdGlvbik6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG4gICAgdHJ1bmNhdGUoKTogUHJvbWlzZTx2b2lkPjtcbiAgICBkaXN0aW5jdCgpOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcblxuICAgIGNsb25lKCk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG4gICAgZ3JvdXBCeVJhdyhcbiAgICAgICAgc3FsOiBzdHJpbmcsXG4gICAgICAgIC4uLmJpbmRpbmdzOiBzdHJpbmdbXVxuICAgICk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG4gICAgb3JkZXJCeVJhdyhcbiAgICAgICAgc3FsOiBzdHJpbmcsXG4gICAgICAgIC4uLmJpbmRpbmdzOiBzdHJpbmdbXVxuICAgICk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG4gICAga2VlcEZsYXQoKTogSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIGFueT47XG59XG5cbnR5cGUgUmV0dXJuTm9uT2JqZWN0c05hbWVzT25seTxUPiA9IHsgW0sgaW4ga2V5b2YgVF06IFRbS10gZXh0ZW5kcyBTZWxlY3RhYmxlQ29sdW1uVHlwZXMgPyBLIDogbmV2ZXIgfVtrZXlvZiBUXTtcblxudHlwZSBSZW1vdmVPYmplY3RzRnJvbTxUPiA9IHsgW1AgaW4gUmV0dXJuTm9uT2JqZWN0c05hbWVzT25seTxUPl06IFRbUF0gfTtcblxuZXhwb3J0IHR5cGUgT2JqZWN0VG9QcmltaXRpdmU8VD4gPSBUIGV4dGVuZHMgU3RyaW5nXG4gICAgPyBzdHJpbmdcbiAgICA6IFQgZXh0ZW5kcyBOdW1iZXJcbiAgICA/IG51bWJlclxuICAgIDogVCBleHRlbmRzIEJvb2xlYW5cbiAgICA/IGJvb2xlYW5cbiAgICA6IG5ldmVyO1xuXG5leHBvcnQgdHlwZSBPcGVyYXRvciA9ICc9JyB8ICchPScgfCAnPicgfCAnPCcgfCBzdHJpbmc7XG5cbmludGVyZmFjZSBJQ29uc3RydWN0b3I8VD4ge1xuICAgIG5ldyguLi5hcmdzOiBhbnlbXSk6IFQ7XG59XG5cbmV4cG9ydCB0eXBlIEFkZFByb3BlcnR5V2l0aFR5cGU8XG4gICAgT3JpZ2luYWwsXG4gICAgTmV3S2V5IGV4dGVuZHMga2V5b2YgYW55LFxuICAgIE5ld0tleVR5cGVcbiAgICA+ID0gT3JpZ2luYWwgJiBSZWNvcmQ8TmV3S2V5LCBOZXdLZXlUeXBlPjtcblxuaW50ZXJmYWNlIElDb2x1bW5QYXJhbWV0ZXJOb1Jvd1RyYW5zZm9ybWF0aW9uPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz4ge1xuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFVzZSBzdHJpbmdzIGluc3RlYWQgb2YgZnVuY3Rpb25zIHNpbmNlIHZlcnNpb24gMy4wLCB1c2UgYG5weCB0eXBlZC1rbmV4IC11IHN0cmluZy1wYXJhbWV0ZXJzYCB0byB1cGdyYWRlLlxuICAgICAqL1xuICAgIDxQcm9wZXJ0eVR5cGUxPihcbiAgICAgICAgc2VsZWN0Q29sdW1uMUZ1bmN0aW9uOiAoXG4gICAgICAgICAgICBjOiBUcmFuc2Zvcm1Qcm9wc1RvRnVuY3Rpb25zUmV0dXJuUHJvcGVydHlUeXBlPE1vZGVsPlxuICAgICAgICApID0+ICgpID0+IFByb3BlcnR5VHlwZTFcbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcblxuICAgIDxDb25jYXRLZXkgZXh0ZW5kcyBOZXN0ZWRLZXlzT2Y8Tm9uTnVsbGFibGVSZWN1cnNpdmU8TW9kZWw+LCBrZXlvZiBOb25OdWxsYWJsZVJlY3Vyc2l2ZTxNb2RlbD4sICcnPj4oXG4gICAgICAgIGtleTogQ29uY2F0S2V5XG4gICAgKTogSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG59XG5cbi8vIGRlcHJlY2F0ZWRcbmludGVyZmFjZSBJSm9pbk9uQ29sdW1uczxNb2RlbCwgSm9pbmVkTW9kZWw+IHtcblxuICAgIDxQcm9wZXJ0eVR5cGUxLCBQcm9wZXJ0eVR5cGUyPihcbiAgICAgICAgc2VsZWN0Q29sdW1uMUZ1bmN0aW9uOiAoXG4gICAgICAgICAgICBjOiBUcmFuc2Zvcm1Qcm9wc1RvRnVuY3Rpb25zUmV0dXJuUHJvcGVydHlUeXBlPE1vZGVsPlxuICAgICAgICApID0+ICgpID0+IFByb3BlcnR5VHlwZTEsXG4gICAgICAgIG9wZXJhdG9yOiBPcGVyYXRvcixcbiAgICAgICAgc2VsZWN0Q29sdW1uMkZ1bmN0aW9uOiAoXG4gICAgICAgICAgICBjOiBUcmFuc2Zvcm1Qcm9wc1RvRnVuY3Rpb25zUmV0dXJuUHJvcGVydHlUeXBlPEpvaW5lZE1vZGVsPlxuICAgICAgICApID0+ICgpID0+IFByb3BlcnR5VHlwZTJcbiAgICApOiBJSm9pbk9uQ2xhdXNlMjxNb2RlbCwgSm9pbmVkTW9kZWw+O1xufVxuXG5pbnRlcmZhY2UgSUpvaW5PbjxNb2RlbCwgSm9pbmVkTW9kZWw+IHtcblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFVzZSBzdHJpbmdzIGluc3RlYWQgb2YgZnVuY3Rpb25zIHNpbmNlIHZlcnNpb24gMy4wLCB1c2UgYG5weCB0eXBlZC1rbmV4IC11IHN0cmluZy1wYXJhbWV0ZXJzYCB0byB1cGdyYWRlLlxuICAgICAqL1xuICAgIDxQcm9wZXJ0eVR5cGUxLCBQcm9wZXJ0eVR5cGUyPihcbiAgICAgICAgc2VsZWN0Q29sdW1uMUZ1bmN0aW9uOiAoXG4gICAgICAgICAgICBjOiBUcmFuc2Zvcm1Qcm9wc1RvRnVuY3Rpb25zUmV0dXJuUHJvcGVydHlUeXBlPEpvaW5lZE1vZGVsPlxuICAgICAgICApID0+ICgpID0+IFByb3BlcnR5VHlwZTEsXG4gICAgICAgIG9wZXJhdG9yOiBPcGVyYXRvcixcbiAgICAgICAgc2VsZWN0Q29sdW1uMkZ1bmN0aW9uOiAoXG4gICAgICAgICAgICBjOiBUcmFuc2Zvcm1Qcm9wc1RvRnVuY3Rpb25zUmV0dXJuUHJvcGVydHlUeXBlPE1vZGVsPlxuICAgICAgICApID0+ICgpID0+IFByb3BlcnR5VHlwZTJcbiAgICApOiBJSm9pbk9uQ2xhdXNlMjxNb2RlbCwgSm9pbmVkTW9kZWw+O1xuXG4gICAgPENvbmNhdEtleTEgZXh0ZW5kcyBOZXN0ZWRLZXlzT2Y8Tm9uTnVsbGFibGVSZWN1cnNpdmU8Sm9pbmVkTW9kZWw+LCBrZXlvZiBOb25OdWxsYWJsZVJlY3Vyc2l2ZTxKb2luZWRNb2RlbD4sICcnPixcbiAgICAgICAgQ29uY2F0S2V5MiBleHRlbmRzIE5lc3RlZEtleXNPZjxOb25OdWxsYWJsZVJlY3Vyc2l2ZTxNb2RlbD4sIGtleW9mIE5vbk51bGxhYmxlUmVjdXJzaXZlPE1vZGVsPiwgJyc+PihcbiAgICAgICAga2V5MTogQ29uY2F0S2V5MSxcbiAgICAgICAgb3BlcmF0b3I6IE9wZXJhdG9yLFxuICAgICAgICBrZXkyOiBDb25jYXRLZXkyXG5cbiAgICApOiBJSm9pbk9uQ2xhdXNlMjxNb2RlbCwgSm9pbmVkTW9kZWw+O1xufVxuXG5pbnRlcmZhY2UgSUpvaW5PblZhbDxNb2RlbCwgSm9pbmVkTW9kZWw+IHtcblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFVzZSBzdHJpbmdzIGluc3RlYWQgb2YgZnVuY3Rpb25zIHNpbmNlIHZlcnNpb24gMy4wLCB1c2UgYG5weCB0eXBlZC1rbmV4IC11IHN0cmluZy1wYXJhbWV0ZXJzYCB0byB1cGdyYWRlLlxuICAgICAqL1xuICAgIDxQcm9wZXJ0eVR5cGUxPihcbiAgICAgICAgc2VsZWN0Q29sdW1uMUZ1bmN0aW9uOiAoXG4gICAgICAgICAgICBjOiBUcmFuc2Zvcm1Qcm9wc1RvRnVuY3Rpb25zUmV0dXJuUHJvcGVydHlUeXBlPEpvaW5lZE1vZGVsPlxuICAgICAgICApID0+ICgpID0+IFByb3BlcnR5VHlwZTEsXG4gICAgICAgIG9wZXJhdG9yOiBPcGVyYXRvcixcbiAgICAgICAgdmFsdWU6IGFueVxuICAgICk6IElKb2luT25DbGF1c2UyPE1vZGVsLCBKb2luZWRNb2RlbD47XG5cbiAgICA8Q29uY2F0S2V5IGV4dGVuZHMgTmVzdGVkS2V5c09mPE5vbk51bGxhYmxlUmVjdXJzaXZlPEpvaW5lZE1vZGVsPiwga2V5b2YgTm9uTnVsbGFibGVSZWN1cnNpdmU8Sm9pbmVkTW9kZWw+LCAnJz4+KFxuICAgICAgICBrZXk6IENvbmNhdEtleSxcbiAgICAgICAgb3BlcmF0b3I6IE9wZXJhdG9yLFxuICAgICAgICB2YWx1ZTogYW55XG4gICAgKTogSUpvaW5PbkNsYXVzZTI8TW9kZWwsIEpvaW5lZE1vZGVsPjtcbn1cblxuaW50ZXJmYWNlIElKb2luT25OdWxsPE1vZGVsLCBKb2luZWRNb2RlbD4ge1xuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgVXNlIHN0cmluZ3MgaW5zdGVhZCBvZiBmdW5jdGlvbnMgc2luY2UgdmVyc2lvbiAzLjAsIHVzZSBgbnB4IHR5cGVkLWtuZXggLXUgc3RyaW5nLXBhcmFtZXRlcnNgIHRvIHVwZ3JhZGUuXG4gICAgICovXG4gICAgPFg+KFxuICAgICAgICBzZWxlY3RDb2x1bW4xRnVuY3Rpb246IChcbiAgICAgICAgICAgIGM6IFRyYW5zZm9ybVByb3BzVG9GdW5jdGlvbnNSZXR1cm5Qcm9wZXJ0eVR5cGU8Sm9pbmVkTW9kZWw+XG4gICAgICAgICkgPT4gKCkgPT4gWFxuICAgICk6IElKb2luT25DbGF1c2UyPE1vZGVsLCBKb2luZWRNb2RlbD47XG5cbiAgICA8Q29uY2F0S2V5IGV4dGVuZHMgTmVzdGVkS2V5c09mPE5vbk51bGxhYmxlUmVjdXJzaXZlPEpvaW5lZE1vZGVsPiwga2V5b2YgTm9uTnVsbGFibGVSZWN1cnNpdmU8Sm9pbmVkTW9kZWw+LCAnJz4+KFxuICAgICAgICBrZXk6IENvbmNhdEtleVxuICAgICk6IElKb2luT25DbGF1c2UyPE1vZGVsLCBKb2luZWRNb2RlbD47XG59XG5cblxuaW50ZXJmYWNlIElKb2luT25DbGF1c2UyPE1vZGVsLCBKb2luZWRNb2RlbD4ge1xuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIHNpbmNlIHZlcnNpb24gMi45LCB1c2UgLm9uKCkuIFJlbWVtYmVyIHRoYXQgdGhlIGNvbHVtbnMgc3dpdGNoZWQgZWcgLm9uQ29sdW1ucyhpPT5pLnByb3AsICc9JyBqPT5qLnByb3ApIHNob3VsZCBiZWNvbWUgLm9uKGo9PmoucHJvcCwgJz0nLCBpPT5pLnByb3ApLlxuICAgICAqIFVzZSBgbnB4IHR5cGVkLWtuZXggLXUgam9pbi1vbi1jb2x1bW5zLXRvLW9uYCB0byB1cGdyYWRlLlxuICAgICAqL1xuICAgIG9uQ29sdW1uczogSUpvaW5PbkNvbHVtbnM8TW9kZWwsIEpvaW5lZE1vZGVsPjtcbiAgICBvbjogSUpvaW5PbjxNb2RlbCwgSm9pbmVkTW9kZWw+O1xuICAgIG9yT246IElKb2luT248TW9kZWwsIEpvaW5lZE1vZGVsPjtcbiAgICBhbmRPbjogSUpvaW5PbjxNb2RlbCwgSm9pbmVkTW9kZWw+O1xuICAgIG9uVmFsOiBJSm9pbk9uVmFsPE1vZGVsLCBKb2luZWRNb2RlbD47XG4gICAgYW5kT25WYWw6IElKb2luT25WYWw8TW9kZWwsIEpvaW5lZE1vZGVsPjtcbiAgICBvck9uVmFsOiBJSm9pbk9uVmFsPE1vZGVsLCBKb2luZWRNb2RlbD47XG4gICAgb25OdWxsOiBJSm9pbk9uTnVsbDxNb2RlbCwgSm9pbmVkTW9kZWw+O1xufVxuXG5pbnRlcmZhY2UgSUluc2VydFNlbGVjdCB7XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgVXNlIHN0cmluZ3MgaW5zdGVhZCBvZiBmdW5jdGlvbnMgc2luY2UgdmVyc2lvbiAzLjAsIHVzZSBgbnB4IHR5cGVkLWtuZXggLXUgc3RyaW5nLXBhcmFtZXRlcnNgIHRvIHVwZ3JhZGUuXG4gICAgICovXG4gICAgPE5ld1Byb3BlcnR5VHlwZT4oXG4gICAgICAgIG5ld1Byb3BlcnR5Q2xhc3M6IG5ldyAoKSA9PiBOZXdQcm9wZXJ0eVR5cGUsXG4gICAgICAgIHNlbGVjdENvbHVtbjFGdW5jdGlvbjogKFxuICAgICAgICAgICAgYzogVHJhbnNmb3JtUHJvcHNUb0Z1bmN0aW9uc1JldHVyblByb3BlcnR5VHlwZTxOZXdQcm9wZXJ0eVR5cGU+XG4gICAgICAgICkgPT4gYW55XG4gICAgKTogUHJvbWlzZTx2b2lkPjtcblxuXG4gICAgPE5ld1Byb3BlcnR5VHlwZSwgQ29uY2F0S2V5IGV4dGVuZHMgTmVzdGVkS2V5c09mPE5vbk51bGxhYmxlUmVjdXJzaXZlPE5ld1Byb3BlcnR5VHlwZT4sIGtleW9mIE5vbk51bGxhYmxlUmVjdXJzaXZlPE5ld1Byb3BlcnR5VHlwZT4sICcnPj5cbiAgICAgICAgKFxuICAgICAgICBuZXdQcm9wZXJ0eUNsYXNzOiBuZXcgKCkgPT4gTmV3UHJvcGVydHlUeXBlLFxuICAgICAgICAuLi5jb2x1bW5OYW1lczogQ29uY2F0S2V5W10pOlxuICAgICAgICBQcm9taXNlPHZvaWQ+O1xufVxuXG5pbnRlcmZhY2UgSUpvaW5UYWJsZU11bHRpcGxlT25DbGF1c2VzPE1vZGVsLCBfU2VsZWN0YWJsZU1vZGVsLCBSb3c+IHtcbiAgICA8XG4gICAgICAgIE5ld1Byb3BlcnR5VHlwZSxcbiAgICAgICAgTmV3UHJvcGVydHlLZXkgZXh0ZW5kcyBrZXlvZiBhbnlcbiAgICAgICAgPihcbiAgICAgICAgbmV3UHJvcGVydHlLZXk6IE5ld1Byb3BlcnR5S2V5LFxuICAgICAgICBuZXdQcm9wZXJ0eUNsYXNzOiBuZXcgKCkgPT4gTmV3UHJvcGVydHlUeXBlLFxuICAgICAgICBvbjogKFxuICAgICAgICAgICAgam9pbjogSUpvaW5PbkNsYXVzZTI8XG4gICAgICAgICAgICAgICAgQWRkUHJvcGVydHlXaXRoVHlwZTxNb2RlbCwgTmV3UHJvcGVydHlLZXksIE5ld1Byb3BlcnR5VHlwZT4sXG4gICAgICAgICAgICAgICAgTmV3UHJvcGVydHlUeXBlXG4gICAgICAgICAgICA+XG4gICAgICAgICkgPT4gdm9pZFxuICAgICk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxcbiAgICAgICAgQWRkUHJvcGVydHlXaXRoVHlwZTxNb2RlbCwgTmV3UHJvcGVydHlLZXksIE5ld1Byb3BlcnR5VHlwZT4sXG4gICAgICAgIEFkZFByb3BlcnR5V2l0aFR5cGU8TW9kZWwsIE5ld1Byb3BlcnR5S2V5LCBOZXdQcm9wZXJ0eVR5cGU+LFxuICAgICAgICBSb3dcbiAgICA+O1xufVxuXG5pbnRlcmZhY2UgSVNlbGVjdFJhdzxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+IHtcbiAgICA8XG4gICAgICAgIFRSZXR1cm4gZXh0ZW5kcyBCb29sZWFuIHwgU3RyaW5nIHwgTnVtYmVyLFxuICAgICAgICBUTmFtZSBleHRlbmRzIGtleW9mIGFueVxuICAgICAgICA+KFxuICAgICAgICBuYW1lOiBUTmFtZSxcbiAgICAgICAgcmV0dXJuVHlwZTogSUNvbnN0cnVjdG9yPFRSZXR1cm4+LFxuICAgICAgICBxdWVyeTogc3RyaW5nXG4gICAgKTogSVR5cGVkUXVlcnlCdWlsZGVyPFxuICAgICAgICBNb2RlbCxcbiAgICAgICAgU2VsZWN0YWJsZU1vZGVsLFxuICAgICAgICBSZWNvcmQ8VE5hbWUsIE9iamVjdFRvUHJpbWl0aXZlPFRSZXR1cm4+PiAmIFJvd1xuICAgID47XG59XG5cbmludGVyZmFjZSBJU2VsZWN0UXVlcnk8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PiB7XG4gICAgPFxuICAgICAgICBUUmV0dXJuIGV4dGVuZHMgQm9vbGVhbiB8IFN0cmluZyB8IE51bWJlcixcbiAgICAgICAgVE5hbWUgZXh0ZW5kcyBrZXlvZiBhbnksXG4gICAgICAgIFN1YlF1ZXJ5TW9kZWxcbiAgICAgICAgPihcbiAgICAgICAgbmFtZTogVE5hbWUsXG4gICAgICAgIHJldHVyblR5cGU6IElDb25zdHJ1Y3RvcjxUUmV0dXJuPixcbiAgICAgICAgc3ViUXVlcnlNb2RlbDogbmV3ICgpID0+IFN1YlF1ZXJ5TW9kZWwsXG4gICAgICAgIGNvZGU6IChcbiAgICAgICAgICAgIHN1YlF1ZXJ5OiBJVHlwZWRRdWVyeUJ1aWxkZXI8U3ViUXVlcnlNb2RlbCwgU3ViUXVlcnlNb2RlbCwge30+LFxuICAgICAgICAgICAgcGFyZW50OiBUcmFuc2Zvcm1Qcm9wc1RvRnVuY3Rpb25zUmV0dXJuUHJvcGVydHlOYW1lPE1vZGVsPlxuICAgICAgICApID0+IHZvaWRcbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8XG4gICAgICAgIE1vZGVsLFxuICAgICAgICBTZWxlY3RhYmxlTW9kZWwsXG4gICAgICAgIFJlY29yZDxUTmFtZSwgT2JqZWN0VG9QcmltaXRpdmU8VFJldHVybj4+ICYgUm93XG4gICAgPjtcbn1cblxudHlwZSBUcmFuc2Zvcm1Qcm9wc1RvRnVuY3Rpb25zT25seUxldmVsMTxMZXZlbDFUeXBlPiA9IHtcbiAgICBbTGV2ZWwxUHJvcGVydHkgaW4ga2V5b2YgUmVtb3ZlT2JqZWN0c0Zyb208XG4gICAgICAgIExldmVsMVR5cGVcbiAgICA+XTogTGV2ZWwxVHlwZVtMZXZlbDFQcm9wZXJ0eV0gZXh0ZW5kcyBTZWxlY3RhYmxlQ29sdW1uVHlwZXNcbiAgICA/ICgoKSA9PiBQaWNrPExldmVsMVR5cGUsIExldmVsMVByb3BlcnR5PilcbiAgICA6IG5ldmVyXG59O1xuXG50eXBlIFRyYW5zZm9ybVByb3BzVG9GdW5jdGlvbnNSZXR1cm5Qcm9wZXJ0eU5hbWU8TW9kZWw+ID0ge1xuICAgIFtQIGluIGtleW9mIE1vZGVsXTogTW9kZWxbUF0gZXh0ZW5kcyBvYmplY3QgP1xuICAgIE1vZGVsW1BdIGV4dGVuZHMgUmVxdWlyZWQ8Tm9uRm9yZWlnbktleU9iamVjdHM+ID9cbiAgICAoKSA9PiBQXG4gICAgOlxuICAgIFRyYW5zZm9ybVByb3BzVG9GdW5jdGlvbnNSZXR1cm5Qcm9wZXJ0eU5hbWU8TW9kZWxbUF0+XG4gICAgOlxuICAgICgpID0+IFBcbn07XG5cblxuXG50eXBlIFRyYW5zZm9ybVByb3BzVG9GdW5jdGlvbnNSZXR1cm5Qcm9wZXJ0eVR5cGU8TW9kZWw+ID0ge1xuICAgIFtQIGluIGtleW9mIE1vZGVsXTpcbiAgICBNb2RlbFtQXSBleHRlbmRzIG9iamVjdCA/XG4gICAgTW9kZWxbUF0gZXh0ZW5kcyBSZXF1aXJlZDxOb25Gb3JlaWduS2V5T2JqZWN0cz4gP1xuICAgICgpID0+IE1vZGVsW1BdXG4gICAgOlxuICAgIFRyYW5zZm9ybVByb3BzVG9GdW5jdGlvbnNSZXR1cm5Qcm9wZXJ0eVR5cGU8TW9kZWxbUF0+XG4gICAgOlxuICAgICgpID0+IE1vZGVsW1BdXG59O1xuXG5cbmludGVyZmFjZSBJT3JkZXJCeTxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+IHtcbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZCBVc2Ugc3RyaW5ncyBpbnN0ZWFkIG9mIGZ1bmN0aW9ucyBzaW5jZSB2ZXJzaW9uIDMuMCwgdXNlIGBucHggdHlwZWQta25leCAtdSBzdHJpbmctcGFyYW1ldGVyc2AgdG8gdXBncmFkZS5cbiAgICAgKi9cbiAgICA8TmV3Um93PihcbiAgICAgICAgc2VsZWN0Q29sdW1uRnVuY3Rpb246IChcbiAgICAgICAgICAgIGM6IFRyYW5zZm9ybVByb3BlcnRpZXNUb0Z1bmN0aW9uPE5vbk51bGxhYmxlUmVjdXJzaXZlPE1vZGVsPj5cbiAgICAgICAgKSA9PiAoKSA9PiBOZXdSb3csXG4gICAgICAgIGRpcmVjdGlvbj86ICdhc2MnIHwgJ2Rlc2MnXG4gICAgKTogSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cblxuICAgIDxDb25jYXRLZXkgZXh0ZW5kcyBOZXN0ZWRLZXlzT2Y8Tm9uTnVsbGFibGVSZWN1cnNpdmU8U2VsZWN0YWJsZU1vZGVsPiwga2V5b2YgTm9uTnVsbGFibGVSZWN1cnNpdmU8U2VsZWN0YWJsZU1vZGVsPiwgJyc+LCBUTmFtZSBleHRlbmRzIGtleW9mIGFueT5cbiAgICAgICAgKGNvbHVtbk5hbWVzOiBDb25jYXRLZXksIGRpcmVjdGlvbj86ICdhc2MnIHwgJ2Rlc2MnKTpcbiAgICAgICAgSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdyAmIFJlY29yZDxUTmFtZSwgR2V0TmVzdGVkUHJvcGVydHlUeXBlPFNlbGVjdGFibGVNb2RlbCwgQ29uY2F0S2V5Pj4+O1xufVxuXG5pbnRlcmZhY2UgSURiRnVuY3Rpb25XaXRoQWxpYXM8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PiB7XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgVXNlIHN0cmluZ3MgaW5zdGVhZCBvZiBmdW5jdGlvbnMgc2luY2UgdmVyc2lvbiAzLjAsIHVzZSBgbnB4IHR5cGVkLWtuZXggLXUgc3RyaW5nLXBhcmFtZXRlcnNgIHRvIHVwZ3JhZGUuXG4gICAgICovXG4gICAgPE5ld1Byb3BlcnR5VHlwZSwgVE5hbWUgZXh0ZW5kcyBrZXlvZiBhbnk+KFxuICAgICAgICBzZWxlY3RDb2x1bW5GdW5jdGlvbjogKFxuICAgICAgICAgICAgYzogVHJhbnNmb3JtUHJvcHNUb0Z1bmN0aW9uc1JldHVyblByb3BlcnR5VHlwZTxOb25OdWxsYWJsZVJlY3Vyc2l2ZTxNb2RlbD4+XG4gICAgICAgICkgPT4gKCkgPT4gTmV3UHJvcGVydHlUeXBlLFxuICAgICAgICBuYW1lOiBUTmFtZVxuICAgICk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxcbiAgICAgICAgTW9kZWwsXG4gICAgICAgIFNlbGVjdGFibGVNb2RlbCxcbiAgICAgICAgUmVjb3JkPFROYW1lLCBPYmplY3RUb1ByaW1pdGl2ZTxOZXdQcm9wZXJ0eVR5cGU+PiAmIFJvd1xuICAgID47XG5cbiAgICA8Q29uY2F0S2V5IGV4dGVuZHMgTmVzdGVkS2V5c09mPE5vbk51bGxhYmxlUmVjdXJzaXZlPFNlbGVjdGFibGVNb2RlbD4sIGtleW9mIE5vbk51bGxhYmxlUmVjdXJzaXZlPFNlbGVjdGFibGVNb2RlbD4sICcnPiwgVE5hbWUgZXh0ZW5kcyBrZXlvZiBhbnk+XG4gICAgICAgIChjb2x1bW5OYW1lczogQ29uY2F0S2V5LCBuYW1lOiBUTmFtZSk6XG4gICAgICAgIElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3cgJiBSZWNvcmQ8VE5hbWUsIEdldE5lc3RlZFByb3BlcnR5VHlwZTxTZWxlY3RhYmxlTW9kZWwsIENvbmNhdEtleT4+PjtcblxufVxuXG5cblxuXG50eXBlIFVuaW9uVG9JbnRlcnNlY3Rpb248VT4gPVxuICAgIChVIGV4dGVuZHMgYW55ID8gKGs6IFUpID0+IHZvaWQgOiBuZXZlcikgZXh0ZW5kcyAoKGs6IGluZmVyIEkpID0+IHZvaWQpID8gSSA6IG5ldmVyO1xuXG5pbnRlcmZhY2UgSVNlbGVjdFdpdGhGdW5jdGlvbkNvbHVtbnMzPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz4ge1xuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFVzZSBzdHJpbmdzIGluc3RlYWQgb2YgZnVuY3Rpb25zIHNpbmNlIHZlcnNpb24gMy4wLCB1c2UgYG5weCB0eXBlZC1rbmV4IC11IHN0cmluZy1wYXJhbWV0ZXJzYCB0byB1cGdyYWRlLlxuICAgICAqL1xuICAgIDxcbiAgICAgICAgUjEsXG4gICAgICAgIFIyLFxuICAgICAgICBSMyxcbiAgICAgICAgUjQsXG4gICAgICAgIFI1LFxuICAgICAgICBSNixcbiAgICAgICAgUjcsXG4gICAgICAgIFI4LFxuICAgICAgICBSOSxcbiAgICAgICAgUjEwLFxuICAgICAgICBSMTEsXG4gICAgICAgIFIxMixcbiAgICAgICAgUjEzLFxuICAgICAgICBSMTQsXG4gICAgICAgIFIxNSxcbiAgICAgICAgUjE2LFxuICAgICAgICBSMTcsXG4gICAgICAgIFIxOCxcbiAgICAgICAgUjE5LFxuICAgICAgICBSMjAsXG4gICAgICAgIFIyMSxcbiAgICAgICAgUjIyLFxuICAgICAgICBSMjMsXG4gICAgICAgIFIyNCxcbiAgICAgICAgUjI1LFxuICAgICAgICBSMjYsXG4gICAgICAgIFIyNyxcbiAgICAgICAgUjI4LFxuICAgICAgICBSMjlcbiAgICAgICAgPihcbiAgICAgICAgc2VsZWN0Q29sdW1uRnVuY3Rpb246IChcbiAgICAgICAgICAgIGM6IFRyYW5zZm9ybVByb3BlcnRpZXNUb0Z1bmN0aW9uPFNlbGVjdGFibGVNb2RlbD5cbiAgICAgICAgKSA9PiBbXG4gICAgICAgICAgICAgICAgKCkgPT4gUjEsXG4gICAgICAgICAgICAgICAgKCgpID0+IFIyKT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIzKT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFI0KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFI1KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFI2KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFI3KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFI4KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFI5KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIxMCk/LFxuICAgICAgICAgICAgICAgICgoKSA9PiBSMTIpPyxcbiAgICAgICAgICAgICAgICAoKCkgPT4gUjEzKT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIxNCk/LFxuICAgICAgICAgICAgICAgICgoKSA9PiBSMTUpPyxcbiAgICAgICAgICAgICAgICAoKCkgPT4gUjE2KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIxNyk/LFxuICAgICAgICAgICAgICAgICgoKSA9PiBSMTgpPyxcbiAgICAgICAgICAgICAgICAoKCkgPT4gUjE5KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIyMCk/LFxuICAgICAgICAgICAgICAgICgoKSA9PiBSMjIpPyxcbiAgICAgICAgICAgICAgICAoKCkgPT4gUjIzKT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIyNCk/LFxuICAgICAgICAgICAgICAgICgoKSA9PiBSMjUpPyxcbiAgICAgICAgICAgICAgICAoKCkgPT4gUjI2KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIyNyk/LFxuICAgICAgICAgICAgICAgICgoKSA9PiBSMjgpPyxcbiAgICAgICAgICAgICAgICAoKCkgPT4gUjI5KT9cbiAgICAgICAgICAgIF1cbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8XG4gICAgICAgIE1vZGVsLFxuICAgICAgICBTZWxlY3RhYmxlTW9kZWwsXG4gICAgICAgIFJvdyAmXG4gICAgICAgIFIxICZcbiAgICAgICAgUjIgJlxuICAgICAgICBSMyAmXG4gICAgICAgIFI0ICZcbiAgICAgICAgUjUgJlxuICAgICAgICBSNiAmXG4gICAgICAgIFI3ICZcbiAgICAgICAgUjggJlxuICAgICAgICBSOCAmXG4gICAgICAgIFI5ICZcbiAgICAgICAgUjEwICZcbiAgICAgICAgUjExICZcbiAgICAgICAgUjEyICZcbiAgICAgICAgUjEzICZcbiAgICAgICAgUjE0ICZcbiAgICAgICAgUjE1ICZcbiAgICAgICAgUjE2ICZcbiAgICAgICAgUjE3ICZcbiAgICAgICAgUjE4ICZcbiAgICAgICAgUjE4ICZcbiAgICAgICAgUjE5ICZcbiAgICAgICAgUjIwICZcbiAgICAgICAgUjIxICZcbiAgICAgICAgUjIyICZcbiAgICAgICAgUjIzICZcbiAgICAgICAgUjI0ICZcbiAgICAgICAgUjI1ICZcbiAgICAgICAgUjI2ICZcbiAgICAgICAgUjI3ICZcbiAgICAgICAgUjI4ICZcbiAgICAgICAgUjI4ICZcbiAgICAgICAgUjI5XG4gICAgPjtcblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFVzZSBzdHJpbmdzIGluc3RlYWQgb2YgZnVuY3Rpb25zIHNpbmNlIHZlcnNpb24gMy4wLCB1c2UgYG5weCB0eXBlZC1rbmV4IC11IHN0cmluZy1wYXJhbWV0ZXJzYCB0byB1cGdyYWRlLlxuICAgICAqL1xuICAgIDxSMT4oXG4gICAgICAgIHNlbGVjdENvbHVtbkZ1bmN0aW9uOiAoXG4gICAgICAgICAgICBjOiBUcmFuc2Zvcm1Qcm9wZXJ0aWVzVG9GdW5jdGlvbjxTZWxlY3RhYmxlTW9kZWw+XG4gICAgICAgICkgPT4gKCkgPT4gUjFcbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93ICYgUjE+O1xuXG5cbiAgICA8Q29uY2F0S2V5IGV4dGVuZHMgTmVzdGVkS2V5c09mPE5vbk51bGxhYmxlUmVjdXJzaXZlPFNlbGVjdGFibGVNb2RlbD4sIGtleW9mIE5vbk51bGxhYmxlUmVjdXJzaXZlPFNlbGVjdGFibGVNb2RlbD4sICcnPj5cbiAgICAgICAgKC4uLmNvbHVtbk5hbWVzOiBDb25jYXRLZXlbXSk6XG4gICAgICAgIElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3cgJiBVbmlvblRvSW50ZXJzZWN0aW9uPEdldE5lc3RlZFByb3BlcnR5PFNlbGVjdGFibGVNb2RlbCwgQ29uY2F0S2V5Pj4+O1xuXG59XG5cbmludGVyZmFjZSBJRmluZEJ5UHJpbWFyeUtleTxfTW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PiB7XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgVXNlIHN0cmluZ3MgaW5zdGVhZCBvZiBmdW5jdGlvbnMgc2luY2UgdmVyc2lvbiAzLjAsIHVzZSBgbnB4IHR5cGVkLWtuZXggLXUgc3RyaW5nLXBhcmFtZXRlcnNgIHRvIHVwZ3JhZGUuXG4gICAgICovXG4gICAgPFxuICAgICAgICBSMSxcbiAgICAgICAgUjIsXG4gICAgICAgIFIzLFxuICAgICAgICBSNCxcbiAgICAgICAgUjUsXG4gICAgICAgIFI2LFxuICAgICAgICBSNyxcbiAgICAgICAgUjgsXG4gICAgICAgIFI5LFxuICAgICAgICBSMTAsXG4gICAgICAgIFIxMSxcbiAgICAgICAgUjEyLFxuICAgICAgICBSMTMsXG4gICAgICAgIFIxNCxcbiAgICAgICAgUjE1LFxuICAgICAgICBSMTYsXG4gICAgICAgIFIxNyxcbiAgICAgICAgUjE4LFxuICAgICAgICBSMTksXG4gICAgICAgIFIyMCxcbiAgICAgICAgUjIxLFxuICAgICAgICBSMjIsXG4gICAgICAgIFIyMyxcbiAgICAgICAgUjI0LFxuICAgICAgICBSMjUsXG4gICAgICAgIFIyNixcbiAgICAgICAgUjI3LFxuICAgICAgICBSMjgsXG4gICAgICAgIFIyOVxuICAgICAgICA+KFxuICAgICAgICBwcmltYXJ5S2V5VmFsdWU6IGFueSxcbiAgICAgICAgc2VsZWN0Q29sdW1uRnVuY3Rpb246IChcbiAgICAgICAgICAgIGM6IFRyYW5zZm9ybVByb3BzVG9GdW5jdGlvbnNPbmx5TGV2ZWwxPFNlbGVjdGFibGVNb2RlbD5cbiAgICAgICAgKSA9PiBbXG4gICAgICAgICAgICAgICAgKCkgPT4gUjEsXG4gICAgICAgICAgICAgICAgKCgpID0+IFIyKT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIzKT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFI0KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFI1KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFI2KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFI3KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFI4KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFI5KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIxMCk/LFxuICAgICAgICAgICAgICAgICgoKSA9PiBSMTIpPyxcbiAgICAgICAgICAgICAgICAoKCkgPT4gUjEzKT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIxNCk/LFxuICAgICAgICAgICAgICAgICgoKSA9PiBSMTUpPyxcbiAgICAgICAgICAgICAgICAoKCkgPT4gUjE2KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIxNyk/LFxuICAgICAgICAgICAgICAgICgoKSA9PiBSMTgpPyxcbiAgICAgICAgICAgICAgICAoKCkgPT4gUjE5KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIyMCk/LFxuICAgICAgICAgICAgICAgICgoKSA9PiBSMjIpPyxcbiAgICAgICAgICAgICAgICAoKCkgPT4gUjIzKT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIyNCk/LFxuICAgICAgICAgICAgICAgICgoKSA9PiBSMjUpPyxcbiAgICAgICAgICAgICAgICAoKCkgPT4gUjI2KT8sXG4gICAgICAgICAgICAgICAgKCgpID0+IFIyNyk/LFxuICAgICAgICAgICAgICAgICgoKSA9PiBSMjgpPyxcbiAgICAgICAgICAgICAgICAoKCkgPT4gUjI5KT9cbiAgICAgICAgICAgIF1cbiAgICApOiBQcm9taXNlPFxuICAgICAgICB8IFJvdyAmXG4gICAgICAgIFIxICZcbiAgICAgICAgUjIgJlxuICAgICAgICBSMyAmXG4gICAgICAgIFI0ICZcbiAgICAgICAgUjUgJlxuICAgICAgICBSNiAmXG4gICAgICAgIFI3ICZcbiAgICAgICAgUjggJlxuICAgICAgICBSOCAmXG4gICAgICAgIFI5ICZcbiAgICAgICAgUjEwICZcbiAgICAgICAgUjExICZcbiAgICAgICAgUjEyICZcbiAgICAgICAgUjEzICZcbiAgICAgICAgUjE0ICZcbiAgICAgICAgUjE1ICZcbiAgICAgICAgUjE2ICZcbiAgICAgICAgUjE3ICZcbiAgICAgICAgUjE4ICZcbiAgICAgICAgUjE4ICZcbiAgICAgICAgUjE5ICZcbiAgICAgICAgUjIwICZcbiAgICAgICAgUjIxICZcbiAgICAgICAgUjIyICZcbiAgICAgICAgUjIzICZcbiAgICAgICAgUjI0ICZcbiAgICAgICAgUjI1ICZcbiAgICAgICAgUjI2ICZcbiAgICAgICAgUjI3ICZcbiAgICAgICAgUjI4ICZcbiAgICAgICAgUjI4ICZcbiAgICAgICAgUjI5XG4gICAgICAgIHwgdW5kZWZpbmVkXG4gICAgPjtcblxuICAgIDxDb25jYXRLZXkgZXh0ZW5kcyBOZXN0ZWRLZXlzT2Y8Tm9uTnVsbGFibGVSZWN1cnNpdmU8U2VsZWN0YWJsZU1vZGVsPiwga2V5b2YgTm9uTnVsbGFibGVSZWN1cnNpdmU8U2VsZWN0YWJsZU1vZGVsPiwgJyc+PlxuICAgICAgICAocHJpbWFyeUtleVZhbHVlOiBhbnksIC4uLmNvbHVtbk5hbWVzOiBDb25jYXRLZXlbXSk6XG4gICAgICAgIFByb21pc2U8Um93ICYgVW5pb25Ub0ludGVyc2VjdGlvbjxHZXROZXN0ZWRQcm9wZXJ0eTxTZWxlY3RhYmxlTW9kZWwsIENvbmNhdEtleT4+IHwgdW5kZWZpbmVkPjtcbn1cblxuXG5pbnRlcmZhY2UgSUtleUZ1bmN0aW9uQXNQYXJhbWV0ZXJzUmV0dXJuUXVlcnlCdWlkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PiB7XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgVXNlIHN0cmluZ3MgaW5zdGVhZCBvZiBmdW5jdGlvbnMgc2luY2UgdmVyc2lvbiAzLjAsIHVzZSBgbnB4IHR5cGVkLWtuZXggLXUgc3RyaW5nLXBhcmFtZXRlcnNgIHRvIHVwZ3JhZGUuXG4gICAgICovXG4gICAgKFxuICAgICAgICBzZWxlY3RDb2x1bW5GdW5jdGlvbjogKFxuICAgICAgICAgICAgYzogVHJhbnNmb3JtUHJvcGVydGllc1RvRnVuY3Rpb248Tm9uTnVsbGFibGVSZWN1cnNpdmU8TW9kZWw+PlxuICAgICAgICApID0+IHZvaWRcbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFVzZSBzdHJpbmdzIGluc3RlYWQgb2YgZnVuY3Rpb25zIHNpbmNlIHZlcnNpb24gMy4wLCB1c2UgYG5weCB0eXBlZC1rbmV4IC11IHN0cmluZy1wYXJhbWV0ZXJzYCB0byB1cGdyYWRlLlxuICAgICAqL1xuICAgIChcbiAgICAgICAgc2VsZWN0Q29sdW1uRnVuY3Rpb246IChcbiAgICAgICAgICAgIGM6IFRyYW5zZm9ybVByb3BlcnRpZXNUb0Z1bmN0aW9uPE5vbk51bGxhYmxlUmVjdXJzaXZlPE1vZGVsPj5cbiAgICAgICAgKSA9PiB2b2lkLFxuICAgICAgICBzZXRUb051bGxJZk51bGxGdW5jdGlvbjogKHI6IFJvdykgPT4gdm9pZFxuICAgICk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG5cbiAgICA8Q29uY2F0S2V5IGV4dGVuZHMgTmVzdGVkRm9yZWlnbktleUtleXNPZjxOb25OdWxsYWJsZVJlY3Vyc2l2ZTxNb2RlbD4sIGtleW9mIE5vbk51bGxhYmxlUmVjdXJzaXZlPE1vZGVsPiwgJyc+PihcbiAgICAgICAga2V5OiBDb25jYXRLZXlcbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93Pjtcbn1cblxuaW50ZXJmYWNlIElTZWxlY3RhYmxlQ29sdW1uS2V5RnVuY3Rpb25Bc1BhcmFtZXRlcnNSZXR1cm5RdWVyeUJ1aWRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+IHtcbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZCBVc2Ugc3RyaW5ncyBpbnN0ZWFkIG9mIGZ1bmN0aW9ucyBzaW5jZSB2ZXJzaW9uIDMuMCwgdXNlIGBucHggdHlwZWQta25leCAtdSBzdHJpbmctcGFyYW1ldGVyc2AgdG8gdXBncmFkZS5cbiAgICAgKi9cbiAgICAoXG4gICAgICAgIHNlbGVjdENvbHVtbkZ1bmN0aW9uOiAoXG4gICAgICAgICAgICBjOiBUcmFuc2Zvcm1Qcm9wZXJ0aWVzVG9GdW5jdGlvbjxOb25OdWxsYWJsZVJlY3Vyc2l2ZTxNb2RlbD4+XG4gICAgICAgICkgPT4gdm9pZFxuICAgICk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgVXNlIHN0cmluZ3MgaW5zdGVhZCBvZiBmdW5jdGlvbnMgc2luY2UgdmVyc2lvbiAzLjAsIHVzZSBgbnB4IHR5cGVkLWtuZXggLXUgc3RyaW5nLXBhcmFtZXRlcnNgIHRvIHVwZ3JhZGUuXG4gICAgICovXG4gICAgKFxuICAgICAgICBzZWxlY3RDb2x1bW5GdW5jdGlvbjogKFxuICAgICAgICAgICAgYzogVHJhbnNmb3JtUHJvcGVydGllc1RvRnVuY3Rpb248Tm9uTnVsbGFibGVSZWN1cnNpdmU8TW9kZWw+PlxuICAgICAgICApID0+IHZvaWQsXG4gICAgICAgIHNldFRvTnVsbElmTnVsbEZ1bmN0aW9uOiAocjogUm93KSA9PiB2b2lkXG4gICAgKTogSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cblxuICAgIDxDb25jYXRLZXkgZXh0ZW5kcyBOZXN0ZWRLZXlzT2Y8Tm9uTnVsbGFibGVSZWN1cnNpdmU8TW9kZWw+LCBrZXlvZiBOb25OdWxsYWJsZVJlY3Vyc2l2ZTxNb2RlbD4sICcnPj4oXG4gICAgICAgIGtleTogQ29uY2F0S2V5XG4gICAgKTogSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG59XG5cbmludGVyZmFjZSBJV2hlcmU8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PiB7XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgVXNlIHN0cmluZ3MgaW5zdGVhZCBvZiBmdW5jdGlvbnMgc2luY2UgdmVyc2lvbiAzLjAsIHVzZSBgbnB4IHR5cGVkLWtuZXggLXUgc3RyaW5nLXBhcmFtZXRlcnNgIHRvIHVwZ3JhZGUuXG4gICAgICovXG4gICAgPFByb3BlcnR5VHlwZT4oXG4gICAgICAgIHNlbGVjdENvbHVtbkZ1bmN0aW9uOiAoXG4gICAgICAgICAgICBjOiBUcmFuc2Zvcm1Qcm9wc1RvRnVuY3Rpb25zUmV0dXJuUHJvcGVydHlUeXBlPE5vbk51bGxhYmxlUmVjdXJzaXZlPFNlbGVjdGFibGVNb2RlbD4+XG4gICAgICAgICkgPT4gKCkgPT4gUHJvcGVydHlUeXBlLFxuICAgICAgICB2YWx1ZTogUHJvcGVydHlUeXBlXG4gICAgKTogSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICA8Q29uY2F0S2V5IGV4dGVuZHMgTmVzdGVkS2V5c09mPE5vbk51bGxhYmxlUmVjdXJzaXZlPE1vZGVsPiwga2V5b2YgTm9uTnVsbGFibGVSZWN1cnNpdmU8TW9kZWw+LCAnJz4+KFxuICAgICAgICBrZXk6IENvbmNhdEtleSxcbiAgICAgICAgdmFsdWU6IEdldE5lc3RlZFByb3BlcnR5VHlwZTxNb2RlbCwgQ29uY2F0S2V5PlxuICAgICk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xufVxuXG5pbnRlcmZhY2UgSVdoZXJlV2l0aE9wZXJhdG9yPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz4ge1xuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFVzZSBzdHJpbmdzIGluc3RlYWQgb2YgZnVuY3Rpb25zIHNpbmNlIHZlcnNpb24gMy4wLCB1c2UgYG5weCB0eXBlZC1rbmV4IC11IHN0cmluZy1wYXJhbWV0ZXJzYCB0byB1cGdyYWRlLlxuICAgICAqL1xuICAgIDxQcm9wZXJ0eVR5cGU+KFxuICAgICAgICBzZWxlY3RDb2x1bW5GdW5jdGlvbjogKFxuICAgICAgICAgICAgYzogVHJhbnNmb3JtUHJvcHNUb0Z1bmN0aW9uc1JldHVyblByb3BlcnR5VHlwZTxOb25OdWxsYWJsZVJlY3Vyc2l2ZTxTZWxlY3RhYmxlTW9kZWw+PlxuICAgICAgICApID0+ICgpID0+IFByb3BlcnR5VHlwZSxcbiAgICAgICAgdmFsdWU6IFByb3BlcnR5VHlwZVxuICAgICk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgVXNlIHN0cmluZ3MgaW5zdGVhZCBvZiBmdW5jdGlvbnMgc2luY2UgdmVyc2lvbiAzLjAsIHVzZSBgbnB4IHR5cGVkLWtuZXggLXUgc3RyaW5nLXBhcmFtZXRlcnNgIHRvIHVwZ3JhZGUuXG4gICAgICovXG4gICAgPFByb3BlcnR5VHlwZT4oXG4gICAgICAgIHNlbGVjdENvbHVtbkZ1bmN0aW9uOiAoXG4gICAgICAgICAgICBjOiBUcmFuc2Zvcm1Qcm9wc1RvRnVuY3Rpb25zUmV0dXJuUHJvcGVydHlUeXBlPE5vbk51bGxhYmxlUmVjdXJzaXZlPFNlbGVjdGFibGVNb2RlbD4+XG4gICAgICAgICkgPT4gKCkgPT4gUHJvcGVydHlUeXBlLFxuICAgICAgICBvcGVyYXRvcjogT3BlcmF0b3IsXG4gICAgICAgIHZhbHVlOiBQcm9wZXJ0eVR5cGVcbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcblxuICAgIDxDb25jYXRLZXkgZXh0ZW5kcyBOZXN0ZWRLZXlzT2Y8Tm9uTnVsbGFibGVSZWN1cnNpdmU8TW9kZWw+LCBrZXlvZiBOb25OdWxsYWJsZVJlY3Vyc2l2ZTxNb2RlbD4sICcnPj4oXG4gICAgICAgIGtleTogQ29uY2F0S2V5LFxuICAgICAgICB2YWx1ZTogR2V0TmVzdGVkUHJvcGVydHlUeXBlPE1vZGVsLCBDb25jYXRLZXk+XG4gICAgKTogSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICA8Q29uY2F0S2V5IGV4dGVuZHMgTmVzdGVkS2V5c09mPE5vbk51bGxhYmxlUmVjdXJzaXZlPE1vZGVsPiwga2V5b2YgTm9uTnVsbGFibGVSZWN1cnNpdmU8TW9kZWw+LCAnJz4+KFxuICAgICAgICBrZXk6IENvbmNhdEtleSxcbiAgICAgICAgb3BlcmF0b3I6IE9wZXJhdG9yLFxuICAgICAgICB2YWx1ZTogR2V0TmVzdGVkUHJvcGVydHlUeXBlPE1vZGVsLCBDb25jYXRLZXk+XG4gICAgKTogSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG59XG5cbmludGVyZmFjZSBJV2hlcmVJbjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+IHtcbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZCBVc2Ugc3RyaW5ncyBpbnN0ZWFkIG9mIGZ1bmN0aW9ucyBzaW5jZSB2ZXJzaW9uIDMuMCwgdXNlIGBucHggdHlwZWQta25leCAtdSBzdHJpbmctcGFyYW1ldGVyc2AgdG8gdXBncmFkZS5cbiAgICAgKi9cbiAgICA8UHJvcGVydHlUeXBlPihcbiAgICAgICAgc2VsZWN0Q29sdW1uRnVuY3Rpb246IChcbiAgICAgICAgICAgIGM6IFRyYW5zZm9ybVByb3BzVG9GdW5jdGlvbnNSZXR1cm5Qcm9wZXJ0eVR5cGU8Tm9uTnVsbGFibGVSZWN1cnNpdmU8U2VsZWN0YWJsZU1vZGVsPj5cbiAgICAgICAgKSA9PiAoKSA9PiBQcm9wZXJ0eVR5cGUsXG4gICAgICAgIHZhbHVlczogUHJvcGVydHlUeXBlW11cbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcblxuICAgIDxDb25jYXRLZXkgZXh0ZW5kcyBOZXN0ZWRLZXlzT2Y8Tm9uTnVsbGFibGVSZWN1cnNpdmU8TW9kZWw+LCBrZXlvZiBOb25OdWxsYWJsZVJlY3Vyc2l2ZTxNb2RlbD4sICcnPj4oXG4gICAgICAgIGtleTogQ29uY2F0S2V5LFxuICAgICAgICB2YWx1ZTogR2V0TmVzdGVkUHJvcGVydHlUeXBlPE1vZGVsLCBDb25jYXRLZXk+W11cbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcblxufVxuXG5pbnRlcmZhY2UgSVdoZXJlQmV0d2VlbjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+IHtcbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZCBVc2Ugc3RyaW5ncyBpbnN0ZWFkIG9mIGZ1bmN0aW9ucyBzaW5jZSB2ZXJzaW9uIDMuMCwgdXNlIGBucHggdHlwZWQta25leCAtdSBzdHJpbmctcGFyYW1ldGVyc2AgdG8gdXBncmFkZS5cbiAgICAgKi9cbiAgICA8UHJvcGVydHlUeXBlPihcbiAgICAgICAgc2VsZWN0Q29sdW1uRnVuY3Rpb246IChcbiAgICAgICAgICAgIGM6IFRyYW5zZm9ybVByb3BzVG9GdW5jdGlvbnNSZXR1cm5Qcm9wZXJ0eVR5cGU8Tm9uTnVsbGFibGVSZWN1cnNpdmU8U2VsZWN0YWJsZU1vZGVsPj5cbiAgICAgICAgKSA9PiAoKSA9PiBQcm9wZXJ0eVR5cGUsXG4gICAgICAgIHJhbmdlOiBbUHJvcGVydHlUeXBlLCBQcm9wZXJ0eVR5cGVdXG4gICAgKTogSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICA8Q29uY2F0S2V5IGV4dGVuZHMgTmVzdGVkS2V5c09mPE5vbk51bGxhYmxlUmVjdXJzaXZlPE1vZGVsPiwga2V5b2YgTm9uTnVsbGFibGVSZWN1cnNpdmU8TW9kZWw+LCAnJz4sXG4gICAgICAgIFByb3BlcnR5VHlwZSBleHRlbmRzIEdldE5lc3RlZFByb3BlcnR5VHlwZTxNb2RlbCwgQ29uY2F0S2V5Pj4oXG4gICAgICAgIGtleTogQ29uY2F0S2V5LFxuICAgICAgICB2YWx1ZTogW1Byb3BlcnR5VHlwZSwgUHJvcGVydHlUeXBlXVxuICAgICk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG59XG5cbmludGVyZmFjZSBJSGF2aW5nPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz4ge1xuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFVzZSBzdHJpbmdzIGluc3RlYWQgb2YgZnVuY3Rpb25zIHNpbmNlIHZlcnNpb24gMy4wLCB1c2UgYG5weCB0eXBlZC1rbmV4IC11IHN0cmluZy1wYXJhbWV0ZXJzYCB0byB1cGdyYWRlLlxuICAgICAqL1xuICAgIDxQcm9wZXJ0eVR5cGU+KFxuICAgICAgICBzZWxlY3RDb2x1bW5GdW5jdGlvbjogKFxuICAgICAgICAgICAgYzogVHJhbnNmb3JtUHJvcHNUb0Z1bmN0aW9uc1JldHVyblByb3BlcnR5VHlwZTxOb25OdWxsYWJsZVJlY3Vyc2l2ZTxTZWxlY3RhYmxlTW9kZWw+PlxuICAgICAgICApID0+ICgpID0+IFByb3BlcnR5VHlwZSxcbiAgICAgICAgb3BlcmF0b3I6IE9wZXJhdG9yLFxuICAgICAgICB2YWx1ZTogUHJvcGVydHlUeXBlXG4gICAgKTogSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG5cbiAgICA8Q29uY2F0S2V5IGV4dGVuZHMgTmVzdGVkS2V5c09mPE5vbk51bGxhYmxlUmVjdXJzaXZlPE1vZGVsPiwga2V5b2YgTm9uTnVsbGFibGVSZWN1cnNpdmU8TW9kZWw+LCAnJz4+KFxuICAgICAgICBrZXk6IENvbmNhdEtleSxcbiAgICAgICAgb3BlcmF0b3I6IE9wZXJhdG9yLFxuICAgICAgICB2YWx1ZTogR2V0TmVzdGVkUHJvcGVydHlUeXBlPE1vZGVsLCBDb25jYXRLZXk+XG4gICAgKTogSVR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz47XG59XG5cbmludGVyZmFjZSBJV2hlcmVDb21wYXJlVHdvQ29sdW1uczxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+IHtcbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZCBVc2Ugc3RyaW5ncyBpbnN0ZWFkIG9mIGZ1bmN0aW9ucyBzaW5jZSB2ZXJzaW9uIDMuMCwgdXNlIGBucHggdHlwZWQta25leCAtdSBzdHJpbmctcGFyYW1ldGVyc2AgdG8gdXBncmFkZS5cbiAgICAgKi9cbiAgICA8UHJvcGVydHlUeXBlMSwgX1Byb3BlcnR5VHlwZTIsIE1vZGVsMj4oXG4gICAgICAgIHNlbGVjdENvbHVtbjFGdW5jdGlvbjogKFxuICAgICAgICAgICAgYzogVHJhbnNmb3JtUHJvcHNUb0Z1bmN0aW9uc1JldHVyblByb3BlcnR5VHlwZTxOb25OdWxsYWJsZVJlY3Vyc2l2ZTxNb2RlbD4+XG4gICAgICAgICkgPT4gKCkgPT4gUHJvcGVydHlUeXBlMSxcbiAgICAgICAgb3BlcmF0b3I6IE9wZXJhdG9yLFxuICAgICAgICBzZWxlY3RDb2x1bW4yRnVuY3Rpb246IChcbiAgICAgICAgICAgIGM6IFRyYW5zZm9ybVByb3BzVG9GdW5jdGlvbnNSZXR1cm5Qcm9wZXJ0eVR5cGU8TW9kZWwyPlxuICAgICAgICApID0+IGFueVxuICAgICk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xuXG5cblxuICAgIDxfUHJvcGVydHlUeXBlMSwgX1Byb3BlcnR5VHlwZTIsIE1vZGVsMj4oXG4gICAgICAgIGtleTE6IE5lc3RlZEtleXNPZjxOb25OdWxsYWJsZVJlY3Vyc2l2ZTxNb2RlbD4sIGtleW9mIE5vbk51bGxhYmxlUmVjdXJzaXZlPE1vZGVsPiwgJyc+LFxuICAgICAgICBvcGVyYXRvcjogT3BlcmF0b3IsXG4gICAgICAgIGtleTI6IE5lc3RlZEtleXNPZjxOb25OdWxsYWJsZVJlY3Vyc2l2ZTxNb2RlbDI+LCBrZXlvZiBOb25OdWxsYWJsZVJlY3Vyc2l2ZTxNb2RlbDI+LCAnJz5cbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PjtcblxuXG59XG5cbmludGVyZmFjZSBJV2hlcmVFeGlzdHM8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PiB7XG4gICAgPFN1YlF1ZXJ5TW9kZWw+KFxuICAgICAgICBzdWJRdWVyeU1vZGVsOiBuZXcgKCkgPT4gU3ViUXVlcnlNb2RlbCxcbiAgICAgICAgY29kZTogKFxuICAgICAgICAgICAgc3ViUXVlcnk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxTdWJRdWVyeU1vZGVsLCBTdWJRdWVyeU1vZGVsLCB7fT4sXG4gICAgICAgICAgICBwYXJlbnQ6IFRyYW5zZm9ybVByb3BzVG9GdW5jdGlvbnNSZXR1cm5Qcm9wZXJ0eU5hbWU8U2VsZWN0YWJsZU1vZGVsPlxuICAgICAgICApID0+IHZvaWRcbiAgICApOiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93Pjtcbn1cblxuaW50ZXJmYWNlIElXaGVyZVBhcmVudGhlc2VzPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz4ge1xuICAgIChcbiAgICAgICAgY29kZTogKHN1YlF1ZXJ5OiBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWwsIFNlbGVjdGFibGVNb2RlbCwgUm93PikgPT4gdm9pZFxuICAgICk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xufVxuXG5pbnRlcmZhY2UgSVVuaW9uPE1vZGVsLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz4ge1xuICAgIDxTdWJRdWVyeU1vZGVsPihcbiAgICAgICAgc3ViUXVlcnlNb2RlbDogbmV3ICgpID0+IFN1YlF1ZXJ5TW9kZWwsXG4gICAgICAgIGNvZGU6IChzdWJRdWVyeTogSVR5cGVkUXVlcnlCdWlsZGVyPFN1YlF1ZXJ5TW9kZWwsIFN1YlF1ZXJ5TW9kZWwsIHt9PikgPT4gdm9pZFxuICAgICk6IElUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbCwgU2VsZWN0YWJsZU1vZGVsLCBSb3c+O1xufVxuXG5mdW5jdGlvbiBnZXRQcm94eUFuZE1lbW9yaWVzPE1vZGVsVHlwZSwgUm93PihcbiAgICB0eXBlZFF1ZXJ5QnVpbGRlcj86IFR5cGVkUXVlcnlCdWlsZGVyPE1vZGVsVHlwZSwgUm93PlxuKSB7XG4gICAgY29uc3QgbWVtb3JpZXMgPSBbXSBhcyBzdHJpbmdbXTtcblxuICAgIGZ1bmN0aW9uIGFsbEdldChfdGFyZ2V0OiBhbnksIG5hbWU6IGFueSk6IGFueSB7XG4gICAgICAgIGlmIChuYW1lID09PSAnbWVtb3JpZXMnKSB7XG4gICAgICAgICAgICByZXR1cm4gbWVtb3JpZXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmFtZSA9PT0gJ2dldENvbHVtbk5hbWUnKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZWRRdWVyeUJ1aWxkZXIhLmdldENvbHVtbk5hbWUoLi4ubWVtb3JpZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgbWVtb3JpZXMucHVzaChuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZ2V0OiBhbGxHZXQsXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdCA9IG5ldyBQcm94eShcbiAgICAgICAge30sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGdldDogYWxsR2V0LFxuICAgICAgICB9XG4gICAgKTtcblxuICAgIHJldHVybiB7IHJvb3QsIG1lbW9yaWVzIH07XG59XG5cbmZ1bmN0aW9uIGdldFByb3h5QW5kTWVtb3JpZXNGb3JBcnJheTxNb2RlbFR5cGUsIFJvdz4oXG4gICAgdHlwZWRRdWVyeUJ1aWxkZXI/OiBUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbFR5cGUsIFJvdz5cbikge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdIGFzIHN0cmluZ1tdW107XG5cbiAgICBsZXQgY291bnRlciA9IC0xO1xuXG4gICAgZnVuY3Rpb24gYWxsR2V0KF90YXJnZXQ6IGFueSwgbmFtZTogYW55KTogYW55IHtcbiAgICAgICAgaWYgKF90YXJnZXQubGV2ZWwgPT09IDApIHtcbiAgICAgICAgICAgIGNvdW50ZXIrKztcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKFtdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZSA9PT0gJ21lbW9yaWVzJykge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFtjb3VudGVyXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZSA9PT0gJ3Jlc3VsdCcpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWUgPT09ICdsZXZlbCcpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGFyZ2V0LmxldmVsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lID09PSAnZ2V0Q29sdW1uTmFtZScpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlZFF1ZXJ5QnVpbGRlciEuZ2V0Q29sdW1uTmFtZSguLi5yZXN1bHRbY291bnRlcl0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJlc3VsdFtjb3VudGVyXS5wdXNoKG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJveHkoXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBnZXQ6IGFsbEdldCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCByb290ID0gbmV3IFByb3h5KFxuICAgICAgICB7IGxldmVsOiAwIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGdldDogYWxsR2V0LFxuICAgICAgICB9XG4gICAgKTtcblxuICAgIHJldHVybiB7IHJvb3QsIHJlc3VsdCB9O1xufVxuXG5jbGFzcyBUeXBlZFF1ZXJ5QnVpbGRlcjxNb2RlbFR5cGUsIFNlbGVjdGFibGVNb2RlbCwgUm93ID0ge30+XG4gICAgaW1wbGVtZW50cyBJVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWxUeXBlLCBTZWxlY3RhYmxlTW9kZWwsIFJvdz4ge1xuICAgIHB1YmxpYyBjb2x1bW5zOiB7IG5hbWU6IHN0cmluZyB9W107XG5cbiAgICBwdWJsaWMgb25seUxvZ1F1ZXJ5ID0gZmFsc2U7XG4gICAgcHVibGljIHF1ZXJ5TG9nID0gJyc7XG5cbiAgICBwcml2YXRlIHF1ZXJ5QnVpbGRlcjogS25leC5RdWVyeUJ1aWxkZXI7XG4gICAgcHJpdmF0ZSB0YWJsZU5hbWU6IHN0cmluZztcbiAgICBwcml2YXRlIHNob3VsZFVuZmxhdHRlbjogYm9vbGVhbjtcbiAgICBwcml2YXRlIGV4dHJhSm9pbmVkUHJvcGVydGllczoge1xuICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgIHByb3BlcnR5VHlwZTogbmV3ICgpID0+IGFueTtcbiAgICB9W107XG5cbiAgICBwcml2YXRlIHRyYW5zYWN0aW9uPzogS25leC5UcmFuc2FjdGlvbjtcblxuXG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSB0YWJsZUNsYXNzOiBuZXcgKCkgPT4gTW9kZWxUeXBlLFxuICAgICAgICBwcml2YXRlIGtuZXg6IEtuZXgsXG4gICAgICAgIHF1ZXJ5QnVpbGRlcj86IEtuZXguUXVlcnlCdWlsZGVyLFxuICAgICAgICBwcml2YXRlIHBhcmVudFR5cGVkUXVlcnlCdWlsZGVyPzogYW55XG4gICAgKSB7XG4gICAgICAgIHRoaXMudGFibGVOYW1lID0gZ2V0VGFibGVNZXRhZGF0YSh0YWJsZUNsYXNzKS50YWJsZU5hbWU7XG4gICAgICAgIHRoaXMuY29sdW1ucyA9IGdldENvbHVtblByb3BlcnRpZXModGFibGVDbGFzcyk7XG5cbiAgICAgICAgaWYgKHF1ZXJ5QnVpbGRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5QnVpbGRlciA9IHF1ZXJ5QnVpbGRlcjtcbiAgICAgICAgICAgIHRoaXMucXVlcnlCdWlsZGVyLmZyb20odGhpcy50YWJsZU5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5xdWVyeUJ1aWxkZXIgPSB0aGlzLmtuZXguZnJvbSh0aGlzLnRhYmxlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmV4dHJhSm9pbmVkUHJvcGVydGllcyA9IFtdO1xuICAgICAgICB0aGlzLnNob3VsZFVuZmxhdHRlbiA9IHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIGtlZXBGbGF0KCkge1xuICAgICAgICB0aGlzLnNob3VsZFVuZmxhdHRlbiA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZGVsKCkge1xuICAgICAgICBhd2FpdCB0aGlzLnF1ZXJ5QnVpbGRlci5kZWwoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZGVsQnlQcmltYXJ5S2V5KHZhbHVlOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcHJpbWFyeUtleUNvbHVtbkluZm8gPSBnZXRQcmltYXJ5S2V5Q29sdW1uKHRoaXMudGFibGVDbGFzcyk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5xdWVyeUJ1aWxkZXIuZGVsKCkud2hlcmUocHJpbWFyeUtleUNvbHVtbkluZm8ubmFtZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBpbnNlcnRJdGVtKG5ld09iamVjdDogUGFydGlhbDxSZW1vdmVPYmplY3RzRnJvbTxNb2RlbFR5cGU+Pikge1xuICAgICAgICBhd2FpdCB0aGlzLmluc2VydEl0ZW1zKFtuZXdPYmplY3RdKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgaW5zZXJ0SXRlbXMoaXRlbXM6IFBhcnRpYWw8UmVtb3ZlT2JqZWN0c0Zyb208TW9kZWxUeXBlPj5bXSkge1xuICAgICAgICBpdGVtcyA9IFsuLi5pdGVtc107XG5cbiAgICAgICAgZm9yIChsZXQgaXRlbSBvZiBpdGVtcykge1xuICAgICAgICAgICAgaWYgKGJlZm9yZUluc2VydFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgIGl0ZW0gPSBiZWZvcmVJbnNlcnRUcmFuc2Zvcm0oaXRlbSwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpdGVtcyA9IGl0ZW1zLm1hcChpdGVtID0+IG1hcE9iamVjdFRvVGFibGVPYmplY3QodGhpcy50YWJsZUNsYXNzLCBpdGVtKSk7XG5cbiAgICAgICAgd2hpbGUgKGl0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rID0gaXRlbXMuc3BsaWNlKDAsIDUwMCk7XG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IHRoaXMua25leC5mcm9tKHRoaXMudGFibGVOYW1lKS5pbnNlcnQoY2h1bmspO1xuICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNhY3Rpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHF1ZXJ5LnRyYW5zYWN0aW5nKHRoaXMudHJhbnNhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMub25seUxvZ1F1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5xdWVyeUxvZyArPSBxdWVyeS50b1F1ZXJ5KCkgKyAnXFxuJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgcXVlcnk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdXBkYXRlSXRlbShpdGVtOiBQYXJ0aWFsPFJlbW92ZU9iamVjdHNGcm9tPE1vZGVsVHlwZT4+KSB7XG4gICAgICAgIGlmIChiZWZvcmVVcGRhdGVUcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgIGl0ZW0gPSBiZWZvcmVVcGRhdGVUcmFuc2Zvcm0oaXRlbSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtYXBwZWRJdGVtID0gbWFwT2JqZWN0VG9UYWJsZU9iamVjdCh0aGlzLnRhYmxlQ2xhc3MsIGl0ZW0pO1xuICAgICAgICBpZiAodGhpcy5vbmx5TG9nUXVlcnkpIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlMb2cgKz0gdGhpcy5xdWVyeUJ1aWxkZXIudXBkYXRlKG1hcHBlZEl0ZW0pLnRvUXVlcnkoKSArICdcXG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5xdWVyeUJ1aWxkZXIudXBkYXRlKG1hcHBlZEl0ZW0pO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdXBkYXRlSXRlbUJ5UHJpbWFyeUtleShcbiAgICAgICAgcHJpbWFyeUtleVZhbHVlOiBhbnksXG4gICAgICAgIGl0ZW06IFBhcnRpYWw8UmVtb3ZlT2JqZWN0c0Zyb208TW9kZWxUeXBlPj5cbiAgICApIHtcbiAgICAgICAgaWYgKGJlZm9yZVVwZGF0ZVRyYW5zZm9ybSkge1xuICAgICAgICAgICAgaXRlbSA9IGJlZm9yZVVwZGF0ZVRyYW5zZm9ybShpdGVtLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1hcHBlZEl0ZW0gPSBtYXBPYmplY3RUb1RhYmxlT2JqZWN0KHRoaXMudGFibGVDbGFzcywgaXRlbSk7XG5cbiAgICAgICAgY29uc3QgcHJpbWFyeUtleUNvbHVtbkluZm8gPSBnZXRQcmltYXJ5S2V5Q29sdW1uKHRoaXMudGFibGVDbGFzcyk7XG5cbiAgICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLnF1ZXJ5QnVpbGRlclxuICAgICAgICAgICAgLnVwZGF0ZShtYXBwZWRJdGVtKVxuICAgICAgICAgICAgLndoZXJlKHByaW1hcnlLZXlDb2x1bW5JbmZvLm5hbWUsIHByaW1hcnlLZXlWYWx1ZSk7XG5cbiAgICAgICAgaWYgKHRoaXMub25seUxvZ1F1ZXJ5KSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5TG9nICs9IHF1ZXJ5LnRvUXVlcnkoKSArICdcXG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgcXVlcnk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdXBkYXRlSXRlbXNCeVByaW1hcnlLZXkoXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICBwcmltYXJ5S2V5VmFsdWU6IGFueTtcbiAgICAgICAgICAgIGRhdGE6IFBhcnRpYWw8UmVtb3ZlT2JqZWN0c0Zyb208TW9kZWxUeXBlPj47XG4gICAgICAgIH1bXVxuICAgICkge1xuICAgICAgICBjb25zdCBwcmltYXJ5S2V5Q29sdW1uSW5mbyA9IGdldFByaW1hcnlLZXlDb2x1bW4odGhpcy50YWJsZUNsYXNzKTtcblxuICAgICAgICBpdGVtcyA9IFsuLi5pdGVtc107XG4gICAgICAgIHdoaWxlIChpdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBjaHVuayA9IGl0ZW1zLnNwbGljZSgwLCA1MDApO1xuXG4gICAgICAgICAgICBsZXQgc3FsID0gJyc7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgY2h1bmspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IHRoaXMua25leC5mcm9tKHRoaXMudGFibGVOYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAoYmVmb3JlVXBkYXRlVHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IGJlZm9yZVVwZGF0ZVRyYW5zZm9ybShpdGVtLmRhdGEsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBtYXBPYmplY3RUb1RhYmxlT2JqZWN0KHRoaXMudGFibGVDbGFzcywgaXRlbS5kYXRhKTtcblxuICAgICAgICAgICAgICAgIHF1ZXJ5LnVwZGF0ZShpdGVtLmRhdGEpO1xuICAgICAgICAgICAgICAgIHNxbCArPVxuICAgICAgICAgICAgICAgICAgICBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAgICAgLndoZXJlKHByaW1hcnlLZXlDb2x1bW5JbmZvLm5hbWUsIGl0ZW0ucHJpbWFyeUtleVZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCc/JywgJ1xcXFw/JykgKyAnO1xcbic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGZpbmFsUXVlcnkgPSB0aGlzLmtuZXgucmF3KHNxbCk7XG4gICAgICAgICAgICBpZiAodGhpcy50cmFuc2FjdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZmluYWxRdWVyeS50cmFuc2FjdGluZyh0aGlzLnRyYW5zYWN0aW9uKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub25seUxvZ1F1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5xdWVyeUxvZyArPSBmaW5hbFF1ZXJ5LnRvUXVlcnkoKSArICdcXG4nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBmaW5hbFF1ZXJ5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZXhlY3V0ZSgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5xdWVyeUJ1aWxkZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGxpbWl0KHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5xdWVyeUJ1aWxkZXIubGltaXQodmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcyBhcyBhbnk7XG4gICAgfVxuXG4gICAgcHVibGljIG9mZnNldCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMucXVlcnlCdWlsZGVyLm9mZnNldCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzIGFzIGFueTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZmluZEJ5SWQoaWQ6IHN0cmluZywgY29sdW1uczogKGtleW9mIE1vZGVsVHlwZSlbXSkge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5xdWVyeUJ1aWxkZXJcbiAgICAgICAgICAgIC5zZWxlY3QoY29sdW1ucyBhcyBhbnkpXG4gICAgICAgICAgICAud2hlcmUodGhpcy50YWJsZU5hbWUgKyAnLmlkJywgaWQpXG4gICAgICAgICAgICAuZmlyc3QoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZ2V0Q291bnQoKSB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5xdWVyeUJ1aWxkZXIuY291bnQoeyBjb3VudDogJyonIH0pO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBxdWVyeTtcbiAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRbMF0uY291bnQ7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGdldEZpcnN0T3JOdWxsKCkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IGF3YWl0IHRoaXMucXVlcnlCdWlsZGVyO1xuICAgICAgICBpZiAoIWl0ZW1zIHx8IGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5mbGF0dGVuQnlPcHRpb24oaXRlbXNbMF0sIGFyZ3VtZW50c1swXSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGdldEZpcnN0KCkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IGF3YWl0IHRoaXMucXVlcnlCdWlsZGVyO1xuICAgICAgICBpZiAoIWl0ZW1zIHx8IGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdGVtIG5vdCBmb3VuZC4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmZsYXR0ZW5CeU9wdGlvbihpdGVtc1swXSwgYXJndW1lbnRzWzBdKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZ2V0U2luZ2xlT3JOdWxsKCkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IGF3YWl0IHRoaXMucXVlcnlCdWlsZGVyO1xuICAgICAgICBpZiAoIWl0ZW1zIHx8IGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAoaXRlbXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNb3JlIHRoYW4gb25lIGl0ZW0gZm91bmQ6ICR7aXRlbXMubGVuZ3RofS5gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mbGF0dGVuQnlPcHRpb24oaXRlbXNbMF0sIGFyZ3VtZW50c1swXSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGdldFNpbmdsZSgpIHtcbiAgICAgICAgY29uc3QgaXRlbXMgPSBhd2FpdCB0aGlzLnF1ZXJ5QnVpbGRlcjtcbiAgICAgICAgaWYgKCFpdGVtcyB8fCBpdGVtcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSXRlbSBub3QgZm91bmQuJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXRlbXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNb3JlIHRoYW4gb25lIGl0ZW0gZm91bmQ6ICR7aXRlbXMubGVuZ3RofS5gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5mbGF0dGVuQnlPcHRpb24oaXRlbXNbMF0sIGFyZ3VtZW50c1swXSk7XG4gICAgfVxuXG4gICAgcHVibGljIHNlbGVjdENvbHVtbigpIHtcbiAgICAgICAgbGV0IGNhbGxlZEFyZ3VtZW50cyA9IFtdIGFzIHN0cmluZ1tdO1xuXG4gICAgICAgIGZ1bmN0aW9uIHNhdmVBcmd1bWVudHMoLi4uYXJnczogc3RyaW5nW10pIHtcbiAgICAgICAgICAgIGNhbGxlZEFyZ3VtZW50cyA9IGFyZ3M7XG4gICAgICAgIH1cblxuICAgICAgICBhcmd1bWVudHNbMF0oc2F2ZUFyZ3VtZW50cyk7XG5cbiAgICAgICAgdGhpcy5xdWVyeUJ1aWxkZXIuc2VsZWN0KFxuICAgICAgICAgICAgdGhpcy5nZXRDb2x1bW5OYW1lKC4uLmNhbGxlZEFyZ3VtZW50cykgK1xuICAgICAgICAgICAgJyBhcyAnICtcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29sdW1uU2VsZWN0QWxpYXMoLi4uY2FsbGVkQXJndW1lbnRzKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB0aGlzIGFzIGFueTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0QXJndW1lbnRzRnJvbUNvbHVtbkZ1bmN0aW9uMyhmOiBhbnkpIHtcbiAgICAgICAgY29uc3QgeyByb290LCByZXN1bHQgfSA9IGdldFByb3h5QW5kTWVtb3JpZXNGb3JBcnJheSgpO1xuXG4gICAgICAgIGYocm9vdCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2VsZWN0MigpIHtcbiAgICAgICAgY29uc3QgZiA9IGFyZ3VtZW50c1swXTtcblxuICAgICAgICBjb25zdCBjb2x1bW5Bcmd1bWVudHNMaXN0ID0gdGhpcy5nZXRBcmd1bWVudHNGcm9tQ29sdW1uRnVuY3Rpb24zKGYpO1xuXG4gICAgICAgIGZvciAoY29uc3QgY29sdW1uQXJndW1lbnRzIG9mIGNvbHVtbkFyZ3VtZW50c0xpc3QpIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlCdWlsZGVyLnNlbGVjdChcbiAgICAgICAgICAgICAgICB0aGlzLmdldENvbHVtbk5hbWUoLi4uY29sdW1uQXJndW1lbnRzKSArXG4gICAgICAgICAgICAgICAgJyBhcyAnICtcbiAgICAgICAgICAgICAgICB0aGlzLmdldENvbHVtblNlbGVjdEFsaWFzKC4uLmNvbHVtbkFyZ3VtZW50cylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICAgIH1cblxuICAgIHB1YmxpYyBzZWxlY3QoKSB7XG4gICAgICAgIGxldCBjb2x1bW5Bcmd1bWVudHNMaXN0OiBzdHJpbmdbXVtdO1xuXG4gICAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29sdW1uQXJndW1lbnRzTGlzdCA9IFsuLi5hcmd1bWVudHNdLm1hcCgoY29uY2F0S2V5OiBzdHJpbmcpID0+IGNvbmNhdEtleS5zcGxpdCgnLicpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGYgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICBjb2x1bW5Bcmd1bWVudHNMaXN0ID0gdGhpcy5nZXRBcmd1bWVudHNGcm9tQ29sdW1uRnVuY3Rpb24zKGYpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBjb2x1bW5Bcmd1bWVudHMgb2YgY29sdW1uQXJndW1lbnRzTGlzdCkge1xuICAgICAgICAgICAgdGhpcy5xdWVyeUJ1aWxkZXIuc2VsZWN0KFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Q29sdW1uTmFtZSguLi5jb2x1bW5Bcmd1bWVudHMpICtcbiAgICAgICAgICAgICAgICAnIGFzICcgK1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Q29sdW1uU2VsZWN0QWxpYXMoLi4uY29sdW1uQXJndW1lbnRzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcyBhcyBhbnk7XG4gICAgfVxuXG4gICAgcHVibGljIG9yZGVyQnkoKSB7XG4gICAgICAgIHRoaXMucXVlcnlCdWlsZGVyLm9yZGVyQnkoXG4gICAgICAgICAgICB0aGlzLmdldENvbHVtbk5hbWVXaXRob3V0QWxpYXNGcm9tRnVuY3Rpb25PclN0cmluZyhhcmd1bWVudHNbMF0pLFxuICAgICAgICAgICAgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBnZXRNYW55KCkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IGF3YWl0IHRoaXMucXVlcnlCdWlsZGVyO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmZsYXR0ZW5CeU9wdGlvbihpdGVtcywgYXJndW1lbnRzWzBdKSBhcyBSb3dbXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2VsZWN0UmF3KCkge1xuICAgICAgICBjb25zdCBuYW1lID0gYXJndW1lbnRzWzBdO1xuICAgICAgICBjb25zdCBxdWVyeSA9IGFyZ3VtZW50c1syXTtcblxuICAgICAgICB0aGlzLnF1ZXJ5QnVpbGRlci5zZWxlY3QodGhpcy5rbmV4LnJhdyhgKCR7cXVlcnl9KSBhcyBcIiR7bmFtZX1cImApKTtcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICAgIH1cblxuICAgIHB1YmxpYyBpbm5lckpvaW5Db2x1bW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmpvaW5Db2x1bW4oJ2lubmVySm9pbicsIGFyZ3VtZW50c1swXSk7XG4gICAgfVxuICAgIHB1YmxpYyBsZWZ0T3V0ZXJKb2luQ29sdW1uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qb2luQ29sdW1uKCdsZWZ0T3V0ZXJKb2luJywgYXJndW1lbnRzWzBdKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5uZXJKb2luVGFibGUoKSB7XG4gICAgICAgIGNvbnN0IG5ld1Byb3BlcnR5S2V5ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICBjb25zdCBuZXdQcm9wZXJ0eVR5cGUgPSBhcmd1bWVudHNbMV07XG4gICAgICAgIGNvbnN0IGNvbHVtbjFQYXJ0cyA9IGFyZ3VtZW50c1syXTtcbiAgICAgICAgY29uc3Qgb3BlcmF0b3IgPSBhcmd1bWVudHNbM107XG4gICAgICAgIGNvbnN0IGNvbHVtbjJQYXJ0cyA9IGFyZ3VtZW50c1s0XTtcblxuICAgICAgICB0aGlzLmV4dHJhSm9pbmVkUHJvcGVydGllcy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IG5ld1Byb3BlcnR5S2V5LFxuICAgICAgICAgICAgcHJvcGVydHlUeXBlOiBuZXdQcm9wZXJ0eVR5cGUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHRhYmxlVG9Kb2luQ2xhc3MgPSBuZXdQcm9wZXJ0eVR5cGU7XG4gICAgICAgIGNvbnN0IHRhYmxlVG9Kb2luTmFtZSA9IGdldFRhYmxlTWV0YWRhdGEodGFibGVUb0pvaW5DbGFzcykudGFibGVOYW1lO1xuICAgICAgICBjb25zdCB0YWJsZVRvSm9pbkFsaWFzID0gbmV3UHJvcGVydHlLZXk7XG5cbiAgICAgICAgY29uc3QgdGFibGUxQ29sdW1uID0gdGhpcy5nZXRDb2x1bW5OYW1lKC4uLmNvbHVtbjFQYXJ0cyk7XG4gICAgICAgIGNvbnN0IHRhYmxlMkNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uTmFtZSguLi5jb2x1bW4yUGFydHMpO1xuXG4gICAgICAgIHRoaXMucXVlcnlCdWlsZGVyLmlubmVySm9pbihcbiAgICAgICAgICAgIGAke3RhYmxlVG9Kb2luTmFtZX0gYXMgJHt0YWJsZVRvSm9pbkFsaWFzfWAsXG4gICAgICAgICAgICB0YWJsZTFDb2x1bW4sXG4gICAgICAgICAgICBvcGVyYXRvcixcbiAgICAgICAgICAgIHRhYmxlMkNvbHVtblxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG4gICAgcHVibGljIGlubmVySm9pblRhYmxlT25GdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuam9pblRhYmxlT25GdW5jdGlvbih0aGlzLnF1ZXJ5QnVpbGRlci5pbm5lckpvaW4uYmluZCh0aGlzLnF1ZXJ5QnVpbGRlciksIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBsZWZ0T3V0ZXJKb2luVGFibGVPbkZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qb2luVGFibGVPbkZ1bmN0aW9uKHRoaXMucXVlcnlCdWlsZGVyLmxlZnRPdXRlckpvaW4uYmluZCh0aGlzLnF1ZXJ5QnVpbGRlciksIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGxlZnRPdXRlckpvaW5UYWJsZSgpIHtcbiAgICAgICAgY29uc3QgbmV3UHJvcGVydHlLZXkgPSBhcmd1bWVudHNbMF07XG4gICAgICAgIGNvbnN0IG5ld1Byb3BlcnR5VHlwZSA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgY29uc3QgY29sdW1uMVBhcnRzID0gYXJndW1lbnRzWzJdO1xuICAgICAgICBjb25zdCBvcGVyYXRvciA9IGFyZ3VtZW50c1szXTtcbiAgICAgICAgY29uc3QgY29sdW1uMlBhcnRzID0gYXJndW1lbnRzWzRdO1xuXG4gICAgICAgIHRoaXMuZXh0cmFKb2luZWRQcm9wZXJ0aWVzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogbmV3UHJvcGVydHlLZXksXG4gICAgICAgICAgICBwcm9wZXJ0eVR5cGU6IG5ld1Byb3BlcnR5VHlwZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgdGFibGVUb0pvaW5DbGFzcyA9IG5ld1Byb3BlcnR5VHlwZTtcbiAgICAgICAgY29uc3QgdGFibGVUb0pvaW5OYW1lID0gZ2V0VGFibGVNZXRhZGF0YSh0YWJsZVRvSm9pbkNsYXNzKS50YWJsZU5hbWU7XG4gICAgICAgIGNvbnN0IHRhYmxlVG9Kb2luQWxpYXMgPSBuZXdQcm9wZXJ0eUtleTtcblxuICAgICAgICBjb25zdCB0YWJsZTFDb2x1bW4gPSB0aGlzLmdldENvbHVtbk5hbWUoLi4uY29sdW1uMVBhcnRzKTtcbiAgICAgICAgY29uc3QgdGFibGUyQ29sdW1uID0gdGhpcy5nZXRDb2x1bW5OYW1lKC4uLmNvbHVtbjJQYXJ0cyk7XG5cbiAgICAgICAgdGhpcy5xdWVyeUJ1aWxkZXIubGVmdE91dGVySm9pbihcbiAgICAgICAgICAgIGAke3RhYmxlVG9Kb2luTmFtZX0gYXMgJHt0YWJsZVRvSm9pbkFsaWFzfWAsXG4gICAgICAgICAgICB0YWJsZTFDb2x1bW4sXG4gICAgICAgICAgICBvcGVyYXRvcixcbiAgICAgICAgICAgIHRhYmxlMkNvbHVtblxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyB3aGVyZUNvbHVtbigpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBjYWxsZWQgZnJvbSB0aGUgc3ViLXF1ZXJ5XG4gICAgICAgIC8vIFRoZSBmaXJzdCBjb2x1bW4gaXMgZnJvbSB0aGUgc3ViLXF1ZXJ5XG4gICAgICAgIC8vIFRoZSBzZWNvbmQgY29sdW1uIGlzIGZyb20gdGhlIHBhcmVudCBxdWVyeVxuICAgICAgICBsZXQgY29sdW1uMU5hbWU7XG4gICAgICAgIGxldCBjb2x1bW4yTmFtZTtcblxuICAgICAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGNvbHVtbjFOYW1lID0gdGhpcy5nZXRDb2x1bW5OYW1lKC4uLmFyZ3VtZW50c1swXS5zcGxpdCgnLicpKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5wYXJlbnRUeXBlZFF1ZXJ5QnVpbGRlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUGFyZW50IHF1ZXJ5IGJ1aWxkZXIgaXMgbWlzc2luZywgXCJ3aGVyZUNvbHVtblwiIGNhbiBvbmx5IGJlIHVzZWQgaW4gc3ViLXF1ZXJ5LicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29sdW1uMk5hbWUgPSB0aGlzLnBhcmVudFR5cGVkUXVlcnlCdWlsZGVyLmdldENvbHVtbk5hbWUoLi4uYXJndW1lbnRzWzJdLnNwbGl0KCcuJykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29sdW1uMU5hbWUgPSB0aGlzLmdldENvbHVtbk5hbWUoXG4gICAgICAgICAgICAgICAgLi4udGhpcy5nZXRBcmd1bWVudHNGcm9tQ29sdW1uRnVuY3Rpb24oYXJndW1lbnRzWzBdKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMl0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29sdW1uMk5hbWUgPSBhcmd1bWVudHNbMl07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3VtZW50c1syXS5tZW1vcmllcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29sdW1uMk5hbWUgPSBhcmd1bWVudHNbMl0uZ2V0Q29sdW1uTmFtZTsgLy8gcGFyZW50IHRoaXMgbmVlZGVkIC4uLlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb2x1bW4yTmFtZSA9IHRoaXMuZ2V0Q29sdW1uTmFtZShcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5nZXRBcmd1bWVudHNGcm9tQ29sdW1uRnVuY3Rpb24oYXJndW1lbnRzWzJdKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvcGVyYXRvciA9IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB0aGlzLnF1ZXJ5QnVpbGRlci53aGVyZVJhdyhgPz8gJHtvcGVyYXRvcn0gPz9gLCBbXG4gICAgICAgICAgICBjb2x1bW4xTmFtZSxcbiAgICAgICAgICAgIGNvbHVtbjJOYW1lLFxuICAgICAgICBdKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9RdWVyeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlCdWlsZGVyLnRvUXVlcnkoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgd2hlcmVOdWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxsS25leEZ1bmN0aW9uV2l0aENvbHVtbkZ1bmN0aW9uKHRoaXMucXVlcnlCdWlsZGVyLndoZXJlTnVsbC5iaW5kKHRoaXMucXVlcnlCdWlsZGVyKSwgLi4uYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgd2hlcmVOb3ROdWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxsS25leEZ1bmN0aW9uV2l0aENvbHVtbkZ1bmN0aW9uKHRoaXMucXVlcnlCdWlsZGVyLndoZXJlTm90TnVsbC5iaW5kKHRoaXMucXVlcnlCdWlsZGVyKSwgLi4uYXJndW1lbnRzKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBvcldoZXJlTnVsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbEtuZXhGdW5jdGlvbldpdGhDb2x1bW5GdW5jdGlvbih0aGlzLnF1ZXJ5QnVpbGRlci5vcldoZXJlTnVsbC5iaW5kKHRoaXMucXVlcnlCdWlsZGVyKSwgLi4uYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3JXaGVyZU5vdE51bGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxLbmV4RnVuY3Rpb25XaXRoQ29sdW1uRnVuY3Rpb24odGhpcy5xdWVyeUJ1aWxkZXIub3JXaGVyZU5vdE51bGwuYmluZCh0aGlzLnF1ZXJ5QnVpbGRlciksIC4uLmFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEFyZ3VtZW50c0Zyb21Db2x1bW5GdW5jdGlvbihmOiBhbnkpIHtcblxuICAgICAgICBpZiAodHlwZW9mIGYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gZi5zcGxpdCgnLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeyByb290LCBtZW1vcmllcyB9ID0gZ2V0UHJveHlBbmRNZW1vcmllcygpO1xuXG4gICAgICAgIGYocm9vdCk7XG5cbiAgICAgICAgcmV0dXJuIG1lbW9yaWVzO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBmaW5kQnlQcmltYXJ5S2V5KCkge1xuICAgICAgICBjb25zdCBwcmltYXJ5S2V5Q29sdW1uSW5mbyA9IGdldFByaW1hcnlLZXlDb2x1bW4odGhpcy50YWJsZUNsYXNzKTtcblxuICAgICAgICBjb25zdCBwcmltYXJ5S2V5VmFsdWUgPSBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgbGV0IGNvbHVtbkFyZ3VtZW50c0xpc3Q7XG4gICAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29uc3QgWywgLi4uY29sdW1uQXJndW1lbnRzXSA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIGNvbHVtbkFyZ3VtZW50c0xpc3QgPSBjb2x1bW5Bcmd1bWVudHMubWFwKChjb25jYXRLZXk6IHN0cmluZykgPT4gY29uY2F0S2V5LnNwbGl0KCcuJykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZiA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIGNvbHVtbkFyZ3VtZW50c0xpc3QgPSB0aGlzLmdldEFyZ3VtZW50c0Zyb21Db2x1bW5GdW5jdGlvbjMoZik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGNvbHVtbkFyZ3VtZW50cyBvZiBjb2x1bW5Bcmd1bWVudHNMaXN0KSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5QnVpbGRlci5zZWxlY3QoXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRDb2x1bW5OYW1lKC4uLmNvbHVtbkFyZ3VtZW50cykgK1xuICAgICAgICAgICAgICAgICcgYXMgJyArXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRDb2x1bW5TZWxlY3RBbGlhcyguLi5jb2x1bW5Bcmd1bWVudHMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5xdWVyeUJ1aWxkZXIud2hlcmUocHJpbWFyeUtleUNvbHVtbkluZm8ubmFtZSwgcHJpbWFyeUtleVZhbHVlKTtcblxuICAgICAgICBpZiAodGhpcy5vbmx5TG9nUXVlcnkpIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlMb2cgKz0gdGhpcy5xdWVyeUJ1aWxkZXIudG9RdWVyeSgpICsgJ1xcbic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5xdWVyeUJ1aWxkZXIuZmlyc3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbiAgICBwdWJsaWMgd2hlcmUoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbEtuZXhGdW5jdGlvbldpdGhDb25jYXRLZXlDb2x1bW4odGhpcy5xdWVyeUJ1aWxkZXIud2hlcmUuYmluZCh0aGlzLnF1ZXJ5QnVpbGRlciksIC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbEtuZXhGdW5jdGlvbldpdGhDb2x1bW5GdW5jdGlvbih0aGlzLnF1ZXJ5QnVpbGRlci53aGVyZS5iaW5kKHRoaXMucXVlcnlCdWlsZGVyKSwgLi4uYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgd2hlcmVOb3QoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbEtuZXhGdW5jdGlvbldpdGhDb25jYXRLZXlDb2x1bW4odGhpcy5xdWVyeUJ1aWxkZXIud2hlcmVOb3QuYmluZCh0aGlzLnF1ZXJ5QnVpbGRlciksIC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29sdW1uQXJndW1lbnRzID0gdGhpcy5nZXRBcmd1bWVudHNGcm9tQ29sdW1uRnVuY3Rpb24oXG4gICAgICAgICAgICBhcmd1bWVudHNbMF1cbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnF1ZXJ5QnVpbGRlci53aGVyZU5vdChcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29sdW1uTmFtZSguLi5jb2x1bW5Bcmd1bWVudHMpLFxuICAgICAgICAgICAgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBhbmRXaGVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbEtuZXhGdW5jdGlvbldpdGhDb2x1bW5GdW5jdGlvbih0aGlzLnF1ZXJ5QnVpbGRlci5hbmRXaGVyZS5iaW5kKHRoaXMucXVlcnlCdWlsZGVyKSwgLi4uYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3JXaGVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbEtuZXhGdW5jdGlvbldpdGhDb2x1bW5GdW5jdGlvbih0aGlzLnF1ZXJ5QnVpbGRlci5vcldoZXJlLmJpbmQodGhpcy5xdWVyeUJ1aWxkZXIpLCAuLi5hcmd1bWVudHMpO1xuICAgIH1cblxuICAgIHB1YmxpYyB3aGVyZUluKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxsS25leEZ1bmN0aW9uV2l0aENvbHVtbkZ1bmN0aW9uKHRoaXMucXVlcnlCdWlsZGVyLndoZXJlSW4uYmluZCh0aGlzLnF1ZXJ5QnVpbGRlciksIC4uLmFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgcHVibGljIHdoZXJlTm90SW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxLbmV4RnVuY3Rpb25XaXRoQ29sdW1uRnVuY3Rpb24odGhpcy5xdWVyeUJ1aWxkZXIud2hlcmVOb3RJbi5iaW5kKHRoaXMucXVlcnlCdWlsZGVyKSwgLi4uYXJndW1lbnRzKTtcbiAgICB9XG4gICAgcHVibGljIG9yV2hlcmVJbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbEtuZXhGdW5jdGlvbldpdGhDb2x1bW5GdW5jdGlvbih0aGlzLnF1ZXJ5QnVpbGRlci5vcldoZXJlSW4uYmluZCh0aGlzLnF1ZXJ5QnVpbGRlciksIC4uLmFyZ3VtZW50cyk7XG4gICAgfVxuICAgIHB1YmxpYyBvcldoZXJlTm90SW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxLbmV4RnVuY3Rpb25XaXRoQ29sdW1uRnVuY3Rpb24odGhpcy5xdWVyeUJ1aWxkZXIub3JXaGVyZU5vdEluLmJpbmQodGhpcy5xdWVyeUJ1aWxkZXIpLCAuLi5hcmd1bWVudHMpO1xuICAgIH1cblxuICAgIHB1YmxpYyB3aGVyZUJldHdlZW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxLbmV4RnVuY3Rpb25XaXRoQ29sdW1uRnVuY3Rpb24odGhpcy5xdWVyeUJ1aWxkZXIud2hlcmVCZXR3ZWVuLmJpbmQodGhpcy5xdWVyeUJ1aWxkZXIpLCAuLi5hcmd1bWVudHMpO1xuICAgIH1cbiAgICBwdWJsaWMgd2hlcmVOb3RCZXR3ZWVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxsS25leEZ1bmN0aW9uV2l0aENvbHVtbkZ1bmN0aW9uKHRoaXMucXVlcnlCdWlsZGVyLndoZXJlTm90QmV0d2Vlbi5iaW5kKHRoaXMucXVlcnlCdWlsZGVyKSwgLi4uYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3JXaGVyZUJldHdlZW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxLbmV4RnVuY3Rpb25XaXRoQ29sdW1uRnVuY3Rpb24odGhpcy5xdWVyeUJ1aWxkZXIub3JXaGVyZUJldHdlZW4uYmluZCh0aGlzLnF1ZXJ5QnVpbGRlciksIC4uLmFyZ3VtZW50cyk7XG4gICAgfVxuICAgIHB1YmxpYyBvcldoZXJlTm90QmV0d2VlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbEtuZXhGdW5jdGlvbldpdGhDb2x1bW5GdW5jdGlvbih0aGlzLnF1ZXJ5QnVpbGRlci5vcldoZXJlTm90QmV0d2Vlbi5iaW5kKHRoaXMucXVlcnlCdWlsZGVyKSwgLi4uYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2FsbFF1ZXJ5Q2FsbGJhY2tGdW5jdGlvbihcbiAgICAgICAgZnVuY3Rpb25OYW1lOiBzdHJpbmcsXG4gICAgICAgIHR5cGVPZlN1YlF1ZXJ5OiBhbnksXG4gICAgICAgIGZ1bmN0aW9uVG9DYWxsOiBhbnlcbiAgICApIHtcbiAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgICAgICgodGhpcy5xdWVyeUJ1aWxkZXIgYXMgYW55KVtmdW5jdGlvbk5hbWVdIGFzIChcbiAgICAgICAgICAgIGNhbGxiYWNrOiBLbmV4LlF1ZXJ5Q2FsbGJhY2tcbiAgICAgICAgKSA9PiBLbmV4LlF1ZXJ5QnVpbGRlcikoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zdCBzdWJRdWVyeSA9IHRoaXM7XG4gICAgICAgICAgICBjb25zdCB7IHJvb3QsIG1lbW9yaWVzIH0gPSBnZXRQcm94eUFuZE1lbW9yaWVzKHRoYXQpO1xuXG4gICAgICAgICAgICBjb25zdCBzdWJRQiA9IG5ldyBUeXBlZFF1ZXJ5QnVpbGRlcih0eXBlT2ZTdWJRdWVyeSwgdGhhdC5rbmV4LCBzdWJRdWVyeSwgdGhhdCk7XG4gICAgICAgICAgICBzdWJRQi5leHRyYUpvaW5lZFByb3BlcnRpZXMgPSB0aGF0LmV4dHJhSm9pbmVkUHJvcGVydGllcztcbiAgICAgICAgICAgIGZ1bmN0aW9uVG9DYWxsKFxuICAgICAgICAgICAgICAgIHN1YlFCLFxuICAgICAgICAgICAgICAgIHJvb3QsXG4gICAgICAgICAgICAgICAgbWVtb3JpZXNcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZWxlY3RRdWVyeSgpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgY29uc3QgdHlwZU9mU3ViUXVlcnkgPSBhcmd1bWVudHNbMl07XG4gICAgICAgIGNvbnN0IGZ1bmN0aW9uVG9DYWxsID0gYXJndW1lbnRzWzNdO1xuXG4gICAgICAgIGNvbnN0IHsgcm9vdCwgbWVtb3JpZXMgfSA9IGdldFByb3h5QW5kTWVtb3JpZXModGhpcyk7XG5cbiAgICAgICAgY29uc3Qgc3ViUXVlcnlCdWlsZGVyID0gbmV3IFR5cGVkUXVlcnlCdWlsZGVyKFxuICAgICAgICAgICAgdHlwZU9mU3ViUXVlcnksXG4gICAgICAgICAgICB0aGlzLmtuZXgsXG4gICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICB0aGlzXG4gICAgICAgICk7XG4gICAgICAgIGZ1bmN0aW9uVG9DYWxsKHN1YlF1ZXJ5QnVpbGRlciwgcm9vdCwgbWVtb3JpZXMpO1xuXG4gICAgICAgICh0aGlzLnNlbGVjdFJhdyBhcyBhbnkpKG5hbWUsIHVuZGVmaW5lZCwgc3ViUXVlcnlCdWlsZGVyLnRvUXVlcnkoKSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICAgIH1cblxuICAgIHB1YmxpYyB3aGVyZVBhcmVudGhlc2VzKCkge1xuICAgICAgICB0aGlzLmNhbGxRdWVyeUNhbGxiYWNrRnVuY3Rpb24oJ3doZXJlJywgdGhpcy50YWJsZUNsYXNzLCBhcmd1bWVudHNbMF0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyB3aGVyZUV4aXN0cygpIHtcbiAgICAgICAgY29uc3QgdHlwZU9mU3ViUXVlcnkgPSBhcmd1bWVudHNbMF07XG4gICAgICAgIGNvbnN0IGZ1bmN0aW9uVG9DYWxsID0gYXJndW1lbnRzWzFdO1xuXG4gICAgICAgIHRoaXMuY2FsbFF1ZXJ5Q2FsbGJhY2tGdW5jdGlvbihcbiAgICAgICAgICAgICd3aGVyZUV4aXN0cycsXG4gICAgICAgICAgICB0eXBlT2ZTdWJRdWVyeSxcbiAgICAgICAgICAgIGZ1bmN0aW9uVG9DYWxsXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHB1YmxpYyBvcldoZXJlRXhpc3RzKCkge1xuICAgICAgICBjb25zdCB0eXBlT2ZTdWJRdWVyeSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgY29uc3QgZnVuY3Rpb25Ub0NhbGwgPSBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgdGhpcy5jYWxsUXVlcnlDYWxsYmFja0Z1bmN0aW9uKFxuICAgICAgICAgICAgJ29yV2hlcmVFeGlzdHMnLFxuICAgICAgICAgICAgdHlwZU9mU3ViUXVlcnksXG4gICAgICAgICAgICBmdW5jdGlvblRvQ2FsbFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyB3aGVyZU5vdEV4aXN0cygpIHtcbiAgICAgICAgY29uc3QgdHlwZU9mU3ViUXVlcnkgPSBhcmd1bWVudHNbMF07XG4gICAgICAgIGNvbnN0IGZ1bmN0aW9uVG9DYWxsID0gYXJndW1lbnRzWzFdO1xuXG4gICAgICAgIHRoaXMuY2FsbFF1ZXJ5Q2FsbGJhY2tGdW5jdGlvbihcbiAgICAgICAgICAgICd3aGVyZU5vdEV4aXN0cycsXG4gICAgICAgICAgICB0eXBlT2ZTdWJRdWVyeSxcbiAgICAgICAgICAgIGZ1bmN0aW9uVG9DYWxsXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHB1YmxpYyBvcldoZXJlTm90RXhpc3RzKCkge1xuICAgICAgICBjb25zdCB0eXBlT2ZTdWJRdWVyeSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgY29uc3QgZnVuY3Rpb25Ub0NhbGwgPSBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgdGhpcy5jYWxsUXVlcnlDYWxsYmFja0Z1bmN0aW9uKFxuICAgICAgICAgICAgJ29yV2hlcmVOb3RFeGlzdHMnLFxuICAgICAgICAgICAgdHlwZU9mU3ViUXVlcnksXG4gICAgICAgICAgICBmdW5jdGlvblRvQ2FsbFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyB3aGVyZVJhdyhzcWw6IHN0cmluZywgLi4uYmluZGluZ3M6IHN0cmluZ1tdKSB7XG4gICAgICAgIHRoaXMucXVlcnlCdWlsZGVyLndoZXJlUmF3KHNxbCwgYmluZGluZ3MpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgaGF2aW5nKCkge1xuICAgICAgICBjb25zdCBvcGVyYXRvciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBhcmd1bWVudHNbMl07XG4gICAgICAgIHRoaXMucXVlcnlCdWlsZGVyLmhhdmluZyhcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29sdW1uTmFtZUZyb21GdW5jdGlvbk9yU3RyaW5nKGFyZ3VtZW50c1swXSksXG4gICAgICAgICAgICBvcGVyYXRvcixcbiAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBoYXZpbmdJbigpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBhcmd1bWVudHNbMV07XG4gICAgICAgIHRoaXMucXVlcnlCdWlsZGVyLmhhdmluZ0luKFxuICAgICAgICAgICAgdGhpcy5nZXRDb2x1bW5OYW1lRnJvbUZ1bmN0aW9uT3JTdHJpbmcoYXJndW1lbnRzWzBdKSxcbiAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBoYXZpbmdOb3RJbigpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICh0aGlzLnF1ZXJ5QnVpbGRlciBhcyBhbnkpLmhhdmluZ05vdEluKFxuICAgICAgICAgICAgdGhpcy5nZXRDb2x1bW5OYW1lRnJvbUZ1bmN0aW9uT3JTdHJpbmcoYXJndW1lbnRzWzBdKSxcbiAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBoYXZpbmdOdWxsKCkge1xuICAgICAgICAodGhpcy5xdWVyeUJ1aWxkZXIgYXMgYW55KS5oYXZpbmdOdWxsKFxuICAgICAgICAgICAgdGhpcy5nZXRDb2x1bW5OYW1lRnJvbUZ1bmN0aW9uT3JTdHJpbmcoYXJndW1lbnRzWzBdKVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgaGF2aW5nTm90TnVsbCgpIHtcbiAgICAgICAgKHRoaXMucXVlcnlCdWlsZGVyIGFzIGFueSkuaGF2aW5nTm90TnVsbChcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29sdW1uTmFtZUZyb21GdW5jdGlvbk9yU3RyaW5nKGFyZ3VtZW50c1swXSlcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGhhdmluZ0V4aXN0cygpIHtcbiAgICAgICAgY29uc3QgdHlwZU9mU3ViUXVlcnkgPSBhcmd1bWVudHNbMF07XG4gICAgICAgIGNvbnN0IGZ1bmN0aW9uVG9DYWxsID0gYXJndW1lbnRzWzFdO1xuXG4gICAgICAgIHRoaXMuY2FsbFF1ZXJ5Q2FsbGJhY2tGdW5jdGlvbihcbiAgICAgICAgICAgICdoYXZpbmdFeGlzdHMnLFxuICAgICAgICAgICAgdHlwZU9mU3ViUXVlcnksXG4gICAgICAgICAgICBmdW5jdGlvblRvQ2FsbFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBoYXZpbmdOb3RFeGlzdHMoKSB7XG4gICAgICAgIGNvbnN0IHR5cGVPZlN1YlF1ZXJ5ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICBjb25zdCBmdW5jdGlvblRvQ2FsbCA9IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB0aGlzLmNhbGxRdWVyeUNhbGxiYWNrRnVuY3Rpb24oXG4gICAgICAgICAgICAnaGF2aW5nTm90RXhpc3RzJyxcbiAgICAgICAgICAgIHR5cGVPZlN1YlF1ZXJ5LFxuICAgICAgICAgICAgZnVuY3Rpb25Ub0NhbGxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgaGF2aW5nUmF3KHNxbDogc3RyaW5nLCAuLi5iaW5kaW5nczogc3RyaW5nW10pIHtcbiAgICAgICAgdGhpcy5xdWVyeUJ1aWxkZXIuaGF2aW5nUmF3KHNxbCwgYmluZGluZ3MpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgaGF2aW5nQmV0d2VlbigpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICh0aGlzLnF1ZXJ5QnVpbGRlciBhcyBhbnkpLmhhdmluZ0JldHdlZW4oXG4gICAgICAgICAgICB0aGlzLmdldENvbHVtbk5hbWVGcm9tRnVuY3Rpb25PclN0cmluZyhhcmd1bWVudHNbMF0pLFxuICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGhhdmluZ05vdEJldHdlZW4oKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAodGhpcy5xdWVyeUJ1aWxkZXIgYXMgYW55KS5oYXZpbmdOb3RCZXR3ZWVuKFxuICAgICAgICAgICAgdGhpcy5nZXRDb2x1bW5OYW1lRnJvbUZ1bmN0aW9uT3JTdHJpbmcoYXJndW1lbnRzWzBdKSxcbiAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBvcmRlckJ5UmF3KHNxbDogc3RyaW5nLCAuLi5iaW5kaW5nczogc3RyaW5nW10pIHtcbiAgICAgICAgdGhpcy5xdWVyeUJ1aWxkZXIub3JkZXJCeVJhdyhzcWwsIGJpbmRpbmdzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdW5pb24oKSB7XG4gICAgICAgIGNvbnN0IHR5cGVPZlN1YlF1ZXJ5ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICBjb25zdCBmdW5jdGlvblRvQ2FsbCA9IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB0aGlzLmNhbGxRdWVyeUNhbGxiYWNrRnVuY3Rpb24oJ3VuaW9uJywgdHlwZU9mU3ViUXVlcnksIGZ1bmN0aW9uVG9DYWxsKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgdW5pb25BbGwoKSB7XG4gICAgICAgIGNvbnN0IHR5cGVPZlN1YlF1ZXJ5ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICBjb25zdCBmdW5jdGlvblRvQ2FsbCA9IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB0aGlzLmNhbGxRdWVyeUNhbGxiYWNrRnVuY3Rpb24oXG4gICAgICAgICAgICAndW5pb25BbGwnLFxuICAgICAgICAgICAgdHlwZU9mU3ViUXVlcnksXG4gICAgICAgICAgICBmdW5jdGlvblRvQ2FsbFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyByZXR1cm5pbmdDb2x1bW4oKSB7XG4gICAgICAgIHRocm93IG5ldyBOb3RJbXBsZW1lbnRlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHJldHVybmluZ0NvbHVtbnMoKSB7XG4gICAgICAgIHRocm93IG5ldyBOb3RJbXBsZW1lbnRlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHRyYW5zYWN0aW5nKHRyeDogS25leC5UcmFuc2FjdGlvbikge1xuICAgICAgICB0aGlzLnF1ZXJ5QnVpbGRlci50cmFuc2FjdGluZyh0cngpO1xuXG4gICAgICAgIHRoaXMudHJhbnNhY3Rpb24gPSB0cng7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIG1pbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZnVuY3Rpb25XaXRoQWxpYXMoJ21pbicsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZ1bmN0aW9uV2l0aEFsaWFzKCdjb3VudCcsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY291bnREaXN0aW5jdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZnVuY3Rpb25XaXRoQWxpYXMoXG4gICAgICAgICAgICAnY291bnREaXN0aW5jdCcsXG4gICAgICAgICAgICBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgICBhcmd1bWVudHNbMV1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbWF4KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mdW5jdGlvbldpdGhBbGlhcygnbWF4JywgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZ1bmN0aW9uV2l0aEFsaWFzKCdzdW0nLCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7XG4gICAgfVxuXG4gICAgcHVibGljIHN1bURpc3RpbmN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mdW5jdGlvbldpdGhBbGlhcyhcbiAgICAgICAgICAgICdzdW1EaXN0aW5jdCcsXG4gICAgICAgICAgICBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgICBhcmd1bWVudHNbMV1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXZnKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mdW5jdGlvbldpdGhBbGlhcygnYXZnJywgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBhdmdEaXN0aW5jdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZnVuY3Rpb25XaXRoQWxpYXMoXG4gICAgICAgICAgICAnYXZnRGlzdGluY3QnLFxuICAgICAgICAgICAgYXJndW1lbnRzWzBdLFxuICAgICAgICAgICAgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIGluY3JlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICB0aGlzLnF1ZXJ5QnVpbGRlci5pbmNyZW1lbnQoXG4gICAgICAgICAgICB0aGlzLmdldENvbHVtbk5hbWVGcm9tQXJndW1lbnRzSWdub3JpbmdMYXN0UGFyYW1ldGVyKC4uLmFyZ3VtZW50cyksXG4gICAgICAgICAgICB2YWx1ZVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcHVibGljIGRlY3JlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICB0aGlzLnF1ZXJ5QnVpbGRlci5kZWNyZW1lbnQoXG4gICAgICAgICAgICB0aGlzLmdldENvbHVtbk5hbWVGcm9tQXJndW1lbnRzSWdub3JpbmdMYXN0UGFyYW1ldGVyKC4uLmFyZ3VtZW50cyksXG4gICAgICAgICAgICB2YWx1ZVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdHJ1bmNhdGUoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucXVlcnlCdWlsZGVyLnRydW5jYXRlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGluc2VydFNlbGVjdCgpIHtcbiAgICAgICAgY29uc3QgdGFibGVOYW1lID0gZ2V0VGFibGVNZXRhZGF0YShhcmd1bWVudHNbMF0pLnRhYmxlTmFtZTtcblxuICAgICAgICBjb25zdCB0eXBlZFF1ZXJ5QnVpbGRlckZvckluc2VydCA9IG5ldyBUeXBlZFF1ZXJ5QnVpbGRlcjxhbnksIGFueT4oXG4gICAgICAgICAgICBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgICB0aGlzLmtuZXhcblxuICAgICAgICApO1xuICAgICAgICBsZXQgY29sdW1uQXJndW1lbnRzTGlzdDtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb25zdCBbLCAuLi5jb2x1bW5Bcmd1bWVudHNdID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgY29sdW1uQXJndW1lbnRzTGlzdCA9IGNvbHVtbkFyZ3VtZW50cy5tYXAoKGNvbmNhdEtleTogc3RyaW5nKSA9PiBjb25jYXRLZXkuc3BsaXQoJy4nKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBmID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgY29sdW1uQXJndW1lbnRzTGlzdCA9IHRoaXMuZ2V0QXJndW1lbnRzRnJvbUNvbHVtbkZ1bmN0aW9uMyhmKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGluc2VydENvbHVtbnMgPSBjb2x1bW5Bcmd1bWVudHNMaXN0Lm1hcChpID0+IHR5cGVkUXVlcnlCdWlsZGVyRm9ySW5zZXJ0LmdldENvbHVtbk5hbWUoLi4uaSkpO1xuXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9rbmV4L2tuZXgvaXNzdWVzLzEwNTZcbiAgICAgICAgY29uc3QgcWIgPSB0aGlzLmtuZXguZnJvbSh0aGlzLmtuZXgucmF3KGA/PyAoJHtpbnNlcnRDb2x1bW5zLm1hcCgoKSA9PiAnPz8nKS5qb2luKCcsJyl9KWAsIFt0YWJsZU5hbWUsIC4uLmluc2VydENvbHVtbnNdKSlcbiAgICAgICAgICAgIC5pbnNlcnQodGhpcy5rbmV4LnJhdyh0aGlzLnRvUXVlcnkoKSkpO1xuXG4gICAgICAgIGNvbnN0IGZpbmFsUXVlcnkgPSBxYi50b1N0cmluZygpO1xuICAgICAgICB0aGlzLnRvUXVlcnkgPSAoKSA9PiBmaW5hbFF1ZXJ5O1xuXG4gICAgICAgIGF3YWl0IHFiO1xuXG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyU2VsZWN0KCkge1xuICAgICAgICB0aGlzLnF1ZXJ5QnVpbGRlci5jbGVhclNlbGVjdCgpO1xuICAgICAgICByZXR1cm4gdGhpcyBhcyBhbnk7XG4gICAgfVxuICAgIHB1YmxpYyBjbGVhcldoZXJlKCkge1xuICAgICAgICB0aGlzLnF1ZXJ5QnVpbGRlci5jbGVhcldoZXJlKCk7XG4gICAgICAgIHJldHVybiB0aGlzIGFzIGFueTtcbiAgICB9XG4gICAgcHVibGljIGNsZWFyT3JkZXIoKSB7XG4gICAgICAgICh0aGlzLnF1ZXJ5QnVpbGRlciBhcyBhbnkpLmNsZWFyT3JkZXIoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICAgIH1cblxuICAgIHB1YmxpYyBkaXN0aW5jdCgpIHtcbiAgICAgICAgdGhpcy5xdWVyeUJ1aWxkZXIuZGlzdGluY3QoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICAgIH1cblxuICAgIHB1YmxpYyBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgcXVlcnlCdWlsZGVyQ2xvbmUgPSB0aGlzLnF1ZXJ5QnVpbGRlci5jbG9uZSgpO1xuXG4gICAgICAgIGNvbnN0IHR5cGVkUXVlcnlCdWlsZGVyQ2xvbmUgPSBuZXcgVHlwZWRRdWVyeUJ1aWxkZXI8TW9kZWxUeXBlLCBSb3c+KFxuICAgICAgICAgICAgdGhpcy50YWJsZUNsYXNzLFxuICAgICAgICAgICAgdGhpcy5rbmV4LFxuICAgICAgICAgICAgcXVlcnlCdWlsZGVyQ2xvbmVcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gdHlwZWRRdWVyeUJ1aWxkZXJDbG9uZSBhcyBhbnk7XG4gICAgfVxuXG4gICAgcHVibGljIGdyb3VwQnkoKSB7XG4gICAgICAgIHRoaXMucXVlcnlCdWlsZGVyLmdyb3VwQnkodGhpcy5nZXRDb2x1bW5OYW1lRnJvbUZ1bmN0aW9uT3JTdHJpbmcoYXJndW1lbnRzWzBdKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBncm91cEJ5UmF3KHNxbDogc3RyaW5nLCAuLi5iaW5kaW5nczogc3RyaW5nW10pIHtcbiAgICAgICAgdGhpcy5xdWVyeUJ1aWxkZXIuZ3JvdXBCeVJhdyhzcWwsIGJpbmRpbmdzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHVzZUtuZXhRdWVyeUJ1aWxkZXIoZjogKHF1ZXJ5OiBLbmV4LlF1ZXJ5QnVpbGRlcikgPT4gdm9pZCkge1xuICAgICAgICBmKHRoaXMucXVlcnlCdWlsZGVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENvbHVtbk5hbWUoLi4ua2V5czogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDb2x1bW5OYW1lVGFibGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIC4uLmtleXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDb2x1bW5OYW1lVGFibGUodGFibGVOYW1lPzogc3RyaW5nLCB0YWJsZUNsYXNzPzogbmV3ICgpID0+IE1vZGVsVHlwZSwgLi4ua2V5czogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBmaXJzdFBhcnROYW1lID0gdGhpcy5nZXRDb2x1bW5OYW1lV2l0aG91dEFsaWFzVGFibGUodGFibGVOYW1lLCB0YWJsZUNsYXNzLCBrZXlzWzBdKTtcblxuICAgICAgICBpZiAoa2V5cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBmaXJzdFBhcnROYW1lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGNvbHVtbk5hbWU7XG4gICAgICAgICAgICBsZXQgY29sdW1uQWxpYXM7XG4gICAgICAgICAgICBsZXQgY3VycmVudENsYXNzO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRDb2x1bW5QYXJ0O1xuICAgICAgICAgICAgY29uc3QgZXh0cmFKb2luZWRQcm9wZXJ0eSA9IHRoaXMuZXh0cmFKb2luZWRQcm9wZXJ0aWVzLmZpbmQoXG4gICAgICAgICAgICAgICAgaSA9PiBpLm5hbWUgPT09IGtleXNbMF1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoZXh0cmFKb2luZWRQcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIGNvbHVtbk5hbWUgPSAnJztcbiAgICAgICAgICAgICAgICBjb2x1bW5BbGlhcyA9IGV4dHJhSm9pbmVkUHJvcGVydHkubmFtZTtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q2xhc3MgPSBleHRyYUpvaW5lZFByb3BlcnR5LnByb3BlcnR5VHlwZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbHVtblBhcnQgPSBnZXRDb2x1bW5JbmZvcm1hdGlvbihcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJsZUNsYXNzLFxuICAgICAgICAgICAgICAgICAgICBrZXlzWzBdXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGNvbHVtbk5hbWUgPSAnJztcbiAgICAgICAgICAgICAgICBjb2x1bW5BbGlhcyA9IGN1cnJlbnRDb2x1bW5QYXJ0LnByb3BlcnR5S2V5O1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDbGFzcyA9IGN1cnJlbnRDb2x1bW5QYXJ0LmNvbHVtbkNsYXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbHVtblBhcnQgPSBnZXRDb2x1bW5JbmZvcm1hdGlvbihjdXJyZW50Q2xhc3MsIGtleXNbaV0pO1xuXG4gICAgICAgICAgICAgICAgY29sdW1uTmFtZSA9XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbkFsaWFzICtcbiAgICAgICAgICAgICAgICAgICAgJy4nICtcbiAgICAgICAgICAgICAgICAgICAgKGtleXMubGVuZ3RoIC0gMSA9PT0gaVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBjdXJyZW50Q29sdW1uUGFydC5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGN1cnJlbnRDb2x1bW5QYXJ0LnByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgICAgICBjb2x1bW5BbGlhcyArPVxuICAgICAgICAgICAgICAgICAgICAnXycgK1xuICAgICAgICAgICAgICAgICAgICAoa2V5cy5sZW5ndGggLSAxID09PSBpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGN1cnJlbnRDb2x1bW5QYXJ0Lm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIDogY3VycmVudENvbHVtblBhcnQucHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDbGFzcyA9IGN1cnJlbnRDb2x1bW5QYXJ0LmNvbHVtbkNsYXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbHVtbk5hbWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q29sdW1uTmFtZVdpdGhEaWZmZXJlbnRSb290KFxuICAgICAgICBfcm9vdEtleTogc3RyaW5nLFxuICAgICAgICAuLi5rZXlzOiBzdHJpbmdbXVxuICAgICk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGZpcnN0UGFydE5hbWUgPSB0aGlzLmdldENvbHVtbk5hbWVXaXRob3V0QWxpYXMoa2V5c1swXSk7XG5cbiAgICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZmlyc3RQYXJ0TmFtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50Q29sdW1uUGFydCA9IGdldENvbHVtbkluZm9ybWF0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMudGFibGVDbGFzcyxcbiAgICAgICAgICAgICAgICBrZXlzWzBdXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBsZXQgY29sdW1uTmFtZSA9ICcnO1xuICAgICAgICAgICAgbGV0IGNvbHVtbkFsaWFzID0gY3VycmVudENvbHVtblBhcnQucHJvcGVydHlLZXk7XG4gICAgICAgICAgICBsZXQgY3VycmVudENsYXNzID0gY3VycmVudENvbHVtblBhcnQuY29sdW1uQ2xhc3M7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uUGFydCA9IGdldENvbHVtbkluZm9ybWF0aW9uKGN1cnJlbnRDbGFzcywga2V5c1tpXSk7XG5cbiAgICAgICAgICAgICAgICBjb2x1bW5OYW1lID1cbiAgICAgICAgICAgICAgICAgICAgY29sdW1uQWxpYXMgK1xuICAgICAgICAgICAgICAgICAgICAnLicgK1xuICAgICAgICAgICAgICAgICAgICAoa2V5cy5sZW5ndGggLSAxID09PSBpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGN1cnJlbnRDb2x1bW5QYXJ0Lm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIDogY3VycmVudENvbHVtblBhcnQucHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgICAgIGNvbHVtbkFsaWFzICs9XG4gICAgICAgICAgICAgICAgICAgICdfJyArXG4gICAgICAgICAgICAgICAgICAgIChrZXlzLmxlbmd0aCAtIDEgPT09IGlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gY3VycmVudENvbHVtblBhcnQubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBjdXJyZW50Q29sdW1uUGFydC5wcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICAgICAgY3VycmVudENsYXNzID0gY3VycmVudENvbHVtblBhcnQuY29sdW1uQ2xhc3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29sdW1uTmFtZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZnVuY3Rpb25XaXRoQWxpYXMoXG4gICAgICAgIGtuZXhGdW5jdGlvbk5hbWU6IHN0cmluZyxcbiAgICAgICAgZjogYW55LFxuICAgICAgICBhbGlhc05hbWU6IHN0cmluZ1xuICAgICkge1xuICAgICAgICAodGhpcy5xdWVyeUJ1aWxkZXIgYXMgYW55KVtrbmV4RnVuY3Rpb25OYW1lXShcbiAgICAgICAgICAgIGAke3RoaXMuZ2V0Q29sdW1uTmFtZVdpdGhvdXRBbGlhc0Zyb21GdW5jdGlvbk9yU3RyaW5nKGYpfSBhcyAke2FsaWFzTmFtZX1gXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzIGFzIGFueTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbHVtbk5hbWVGcm9tRnVuY3Rpb25PclN0cmluZyhmOiBhbnkpIHtcbiAgICAgICAgbGV0IGNvbHVtblBhcnRzO1xuICAgICAgICBpZiAodHlwZW9mIGYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb2x1bW5QYXJ0cyA9IGYuc3BsaXQoJy4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbHVtblBhcnRzID0gdGhpcy5nZXRBcmd1bWVudHNGcm9tQ29sdW1uRnVuY3Rpb24oZik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDb2x1bW5OYW1lKC4uLmNvbHVtblBhcnRzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbHVtbk5hbWVXaXRob3V0QWxpYXNGcm9tRnVuY3Rpb25PclN0cmluZyhmOiBhbnkpIHtcbiAgICAgICAgbGV0IGNvbHVtblBhcnRzO1xuICAgICAgICBpZiAodHlwZW9mIGYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb2x1bW5QYXJ0cyA9IGYuc3BsaXQoJy4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbHVtblBhcnRzID0gdGhpcy5nZXRBcmd1bWVudHNGcm9tQ29sdW1uRnVuY3Rpb24oZik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDb2x1bW5OYW1lV2l0aG91dEFsaWFzKFxuICAgICAgICAgICAgLi4uY29sdW1uUGFydHNcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGpvaW5Db2x1bW4oam9pblR5cGU6ICdpbm5lckpvaW4nIHwgJ2xlZnRPdXRlckpvaW4nLCBmOiBhbnkpIHtcbiAgICAgICAgbGV0IGNvbHVtblRvSm9pbkFyZ3VtZW50czogc3RyaW5nW107XG5cbiAgICAgICAgaWYgKHR5cGVvZiBmID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29sdW1uVG9Kb2luQXJndW1lbnRzID0gZi5zcGxpdCgnLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29sdW1uVG9Kb2luQXJndW1lbnRzID0gdGhpcy5nZXRBcmd1bWVudHNGcm9tQ29sdW1uRnVuY3Rpb24oZik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb2x1bW5Ub0pvaW5OYW1lID0gdGhpcy5nZXRDb2x1bW5OYW1lKC4uLmNvbHVtblRvSm9pbkFyZ3VtZW50cyk7XG5cbiAgICAgICAgbGV0IHNlY29uZENvbHVtbk5hbWUgPSBjb2x1bW5Ub0pvaW5Bcmd1bWVudHNbMF07XG4gICAgICAgIGxldCBzZWNvbmRDb2x1bW5BbGlhcyA9IGNvbHVtblRvSm9pbkFyZ3VtZW50c1swXTtcbiAgICAgICAgbGV0IHNlY29uZENvbHVtbkNsYXNzID0gZ2V0Q29sdW1uSW5mb3JtYXRpb24oXG4gICAgICAgICAgICB0aGlzLnRhYmxlQ2xhc3MsXG4gICAgICAgICAgICBzZWNvbmRDb2x1bW5OYW1lXG4gICAgICAgICkuY29sdW1uQ2xhc3M7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBjb2x1bW5Ub0pvaW5Bcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGJlZm9yZVNlY29uZENvbHVtbkFsaWFzID0gc2Vjb25kQ29sdW1uQWxpYXM7XG4gICAgICAgICAgICBjb25zdCBiZWZvcmVTZWNvbmRDb2x1bW5DbGFzcyA9IHNlY29uZENvbHVtbkNsYXNzO1xuXG4gICAgICAgICAgICBjb25zdCBjb2x1bW5JbmZvID0gZ2V0Q29sdW1uSW5mb3JtYXRpb24oXG4gICAgICAgICAgICAgICAgYmVmb3JlU2Vjb25kQ29sdW1uQ2xhc3MsXG4gICAgICAgICAgICAgICAgY29sdW1uVG9Kb2luQXJndW1lbnRzW2ldXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgc2Vjb25kQ29sdW1uTmFtZSA9IGNvbHVtbkluZm8ubmFtZTtcbiAgICAgICAgICAgIHNlY29uZENvbHVtbkFsaWFzID1cbiAgICAgICAgICAgICAgICBiZWZvcmVTZWNvbmRDb2x1bW5BbGlhcyArICdfJyArIGNvbHVtbkluZm8ucHJvcGVydHlLZXk7XG4gICAgICAgICAgICBzZWNvbmRDb2x1bW5DbGFzcyA9IGNvbHVtbkluZm8uY29sdW1uQ2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0YWJsZVRvSm9pbk5hbWUgPSBnZXRUYWJsZU1ldGFkYXRhKHNlY29uZENvbHVtbkNsYXNzKS50YWJsZU5hbWU7XG4gICAgICAgIGNvbnN0IHRhYmxlVG9Kb2luQWxpYXMgPSBzZWNvbmRDb2x1bW5BbGlhcztcbiAgICAgICAgY29uc3QgdGFibGVUb0pvaW5Kb2luQ29sdW1uTmFtZSA9IGAke3RhYmxlVG9Kb2luQWxpYXN9LiR7Z2V0UHJpbWFyeUtleUNvbHVtbihzZWNvbmRDb2x1bW5DbGFzcykubmFtZVxuICAgICAgICAgICAgfWA7XG5cbiAgICAgICAgaWYgKGpvaW5UeXBlID09PSAnaW5uZXJKb2luJykge1xuICAgICAgICAgICAgdGhpcy5xdWVyeUJ1aWxkZXIuaW5uZXJKb2luKFxuICAgICAgICAgICAgICAgIGAke3RhYmxlVG9Kb2luTmFtZX0gYXMgJHt0YWJsZVRvSm9pbkFsaWFzfWAsXG4gICAgICAgICAgICAgICAgdGFibGVUb0pvaW5Kb2luQ29sdW1uTmFtZSxcbiAgICAgICAgICAgICAgICBjb2x1bW5Ub0pvaW5OYW1lXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKGpvaW5UeXBlID09PSAnbGVmdE91dGVySm9pbicpIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlCdWlsZGVyLmxlZnRPdXRlckpvaW4oXG4gICAgICAgICAgICAgICAgYCR7dGFibGVUb0pvaW5OYW1lfSBhcyAke3RhYmxlVG9Kb2luQWxpYXN9YCxcbiAgICAgICAgICAgICAgICB0YWJsZVRvSm9pbkpvaW5Db2x1bW5OYW1lLFxuICAgICAgICAgICAgICAgIGNvbHVtblRvSm9pbk5hbWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbHVtbk5hbWVGcm9tQXJndW1lbnRzSWdub3JpbmdMYXN0UGFyYW1ldGVyKFxuICAgICAgICAuLi5rZXlzOiBzdHJpbmdbXVxuICAgICk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGFyZ3VtZW50c0V4Y2VwdExhc3QgPSBrZXlzLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29sdW1uTmFtZSguLi5hcmd1bWVudHNFeGNlcHRMYXN0KTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgZ2V0Q29sdW1uTmFtZVdpdGhvdXRBbGlhcyguLi5rZXlzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENvbHVtbk5hbWVXaXRob3V0QWxpYXNUYWJsZSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgLi4ua2V5cyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb2x1bW5OYW1lV2l0aG91dEFsaWFzVGFibGUodGFibGVOYW1lPzogc3RyaW5nLCB0YWJsZUNsYXNzPzogbmV3ICgpID0+IE1vZGVsVHlwZSwgLi4ua2V5czogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgICAgICBpZighdGFibGVOYW1lKSB7XG4gICAgICAgICAgICB0YWJsZU5hbWUgPSB0aGlzLnRhYmxlTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCF0YWJsZUNsYXNzKSB7XG4gICAgICAgICAgICB0YWJsZUNsYXNzID0gdGhpcy50YWJsZUNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBjb25zdCBleHRyYUpvaW5lZFByb3BlcnR5ID0gdGhpcy5leHRyYUpvaW5lZFByb3BlcnRpZXMuZmluZChcbiAgICAgICAgICAgICAgICBpID0+IGkubmFtZSA9PT0ga2V5c1swXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChleHRyYUpvaW5lZFByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4dHJhSm9pbmVkUHJvcGVydHkubmFtZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29sdW1uSW5mbyA9IGdldENvbHVtbkluZm9ybWF0aW9uKFxuICAgICAgICAgICAgICAgICAgICB0YWJsZUNsYXNzLFxuICAgICAgICAgICAgICAgICAgICBrZXlzWzBdXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFibGVOYW1lICsgJy4nICsgY29sdW1uSW5mby5uYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRDb2x1bW5QYXJ0ID0gZ2V0Q29sdW1uSW5mb3JtYXRpb24oXG4gICAgICAgICAgICAgICAgdGFibGVDbGFzcyxcbiAgICAgICAgICAgICAgICBrZXlzWzBdXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gY3VycmVudENvbHVtblBhcnQucHJvcGVydHlLZXk7XG4gICAgICAgICAgICBsZXQgY3VycmVudENsYXNzID0gY3VycmVudENvbHVtblBhcnQuY29sdW1uQ2xhc3M7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDb2x1bW5QYXJ0ID0gZ2V0Q29sdW1uSW5mb3JtYXRpb24oY3VycmVudENsYXNzLCBrZXlzW2ldKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz1cbiAgICAgICAgICAgICAgICAgICAgJy4nICtcbiAgICAgICAgICAgICAgICAgICAgKGtleXMubGVuZ3RoIC0gMSA9PT0gaVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBjdXJyZW50Q29sdW1uUGFydC5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGN1cnJlbnRDb2x1bW5QYXJ0LnByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q2xhc3MgPSBjdXJyZW50Q29sdW1uUGFydC5jb2x1bW5DbGFzcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29sdW1uU2VsZWN0QWxpYXMoLi4ua2V5czogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgICAgICBpZiAoa2V5cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBrZXlzWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGNvbHVtbkFsaWFzID0ga2V5c1swXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbHVtbkFsaWFzICs9ICcuJyArIGtleXNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29sdW1uQWxpYXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGZsYXR0ZW5CeU9wdGlvbihvOiBhbnksIGZsYXR0ZW5PcHRpb24/OiBGbGF0dGVuT3B0aW9uKSB7XG4gICAgICAgIGlmIChmbGF0dGVuT3B0aW9uID09PSBGbGF0dGVuT3B0aW9uLm5vRmxhdHRlbiB8fCB0aGlzLnNob3VsZFVuZmxhdHRlbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBvO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVuZmxhdHRlbmVkID0gdW5mbGF0dGVuKG8pO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICBmbGF0dGVuT3B0aW9uID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIGZsYXR0ZW5PcHRpb24gPT09IEZsYXR0ZW5PcHRpb24uZmxhdHRlblxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiB1bmZsYXR0ZW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0VG9OdWxsKHVuZmxhdHRlbmVkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGpvaW5UYWJsZU9uRnVuY3Rpb24ocXVlcnlCdWlsZGVySm9pbjogS25leC5Kb2luLCBuZXdQcm9wZXJ0eUtleTogYW55LCBuZXdQcm9wZXJ0eVR5cGU6IGFueSwgb25GdW5jdGlvbjogKGpvaW46IElKb2luT25DbGF1c2UyPGFueSwgYW55PikgPT4gdm9pZCkge1xuICAgICAgICB0aGlzLmV4dHJhSm9pbmVkUHJvcGVydGllcy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IG5ld1Byb3BlcnR5S2V5LFxuICAgICAgICAgICAgcHJvcGVydHlUeXBlOiBuZXdQcm9wZXJ0eVR5cGUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHRhYmxlVG9Kb2luQ2xhc3MgPSBuZXdQcm9wZXJ0eVR5cGU7XG4gICAgICAgIGNvbnN0IHRhYmxlVG9Kb2luTmFtZSA9IGdldFRhYmxlTWV0YWRhdGEodGFibGVUb0pvaW5DbGFzcykudGFibGVOYW1lO1xuICAgICAgICBjb25zdCB0YWJsZVRvSm9pbkFsaWFzID0gbmV3UHJvcGVydHlLZXk7XG5cbiAgICAgICAgbGV0IGtuZXhPbk9iamVjdDogYW55O1xuICAgICAgICBxdWVyeUJ1aWxkZXJKb2luKFxuICAgICAgICAgICAgYCR7dGFibGVUb0pvaW5OYW1lfSBhcyAke3RhYmxlVG9Kb2luQWxpYXN9YCxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGtuZXhPbk9iamVjdCA9IHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3Qgb25XaXRoSm9pbmVkQ29sdW1uT3BlcmF0b3JDb2x1bW4gPSAoam9pbmVkQ29sdW1uOiBhbnksIG9wZXJhdG9yOiBhbnksIG1vZGVsQ29sdW1uOiBhbnksIGZ1bmN0aW9uTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29sdW1uMUFyZ3VtZW50cztcbiAgICAgICAgICAgIGxldCBjb2x1bW4yQXJndW1lbnRzO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG1vZGVsQ29sdW1uID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGNvbHVtbjFBcmd1bWVudHMgPSBtb2RlbENvbHVtbi5zcGxpdCgnLicpO1xuICAgICAgICAgICAgICAgIGNvbHVtbjJBcmd1bWVudHMgPSBqb2luZWRDb2x1bW4uc3BsaXQoJy4nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29sdW1uMUFyZ3VtZW50cyA9IHRoaXMuZ2V0QXJndW1lbnRzRnJvbUNvbHVtbkZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICBtb2RlbENvbHVtblxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29sdW1uMkFyZ3VtZW50cyA9IHRoaXMuZ2V0QXJndW1lbnRzRnJvbUNvbHVtbkZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICBqb2luZWRDb2x1bW5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjb2x1bW4xTmFtZSA9IHRoaXMuZ2V0Q29sdW1uTmFtZSguLi5jb2x1bW4xQXJndW1lbnRzKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbHVtbjJOYW1lID0gdGhpcy5nZXRDb2x1bW5OYW1lVGFibGUoZ2V0VGFibGVNZXRhZGF0YSh0YWJsZVRvSm9pbkNsYXNzKS50YWJsZU5hbWUsIHRhYmxlVG9Kb2luQ2xhc3MsIC4uLmNvbHVtbjJBcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBjb25zdCBjb2x1bW4yTmFtZVdpdGhBbGlhcyA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29sdW1uMkFsaWFzQXJyID0gY29sdW1uMk5hbWUuc3BsaXQoXCIuXCIpO1xuICAgICAgICAgICAgICAgIGNvbHVtbjJBbGlhc0FyclswXSA9IHRhYmxlVG9Kb2luQWxpYXM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbHVtbjJBbGlhc0Fyci5qb2luKFwiLlwiKTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgIFxuICAgICAgICAgICAga25leE9uT2JqZWN0W2Z1bmN0aW9uTmFtZV0oXG4gICAgICAgICAgICAgICAgY29sdW1uMU5hbWUsXG4gICAgICAgICAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgICAgICAgICAgY29sdW1uMk5hbWVXaXRoQWxpYXNcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgb25XaXRoQ29sdW1uT3BlcmF0b3JWYWx1ZSA9IChqb2luZWRDb2x1bW46IGFueSwgb3BlcmF0b3I6IGFueSwgdmFsdWU6IGFueSwgZnVuY3Rpb25OYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIC8vIGNvbnN0IGNvbHVtbjFBcmd1bWVudHMgPSB0aGlzLmdldEFyZ3VtZW50c0Zyb21Db2x1bW5GdW5jdGlvbihcbiAgICAgICAgICAgIC8vICAgICBqb2luZWRDb2x1bW5cbiAgICAgICAgICAgIC8vICk7XG4gICAgICAgICAgICBjb25zdCBjb2x1bW4yQXJndW1lbnRzID0gdGhpcy5nZXRBcmd1bWVudHNGcm9tQ29sdW1uRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgam9pbmVkQ29sdW1uXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgY29sdW1uMkFyZ3VtZW50c1dpdGhKb2luZWRUYWJsZSA9IFtcbiAgICAgICAgICAgICAgICB0YWJsZVRvSm9pbkFsaWFzLFxuICAgICAgICAgICAgICAgIC4uLmNvbHVtbjJBcmd1bWVudHMsXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAga25leE9uT2JqZWN0W2Z1bmN0aW9uTmFtZV0oXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5nZXRDb2x1bW5OYW1lKC4uLmNvbHVtbjFBcmd1bWVudHMpLFxuICAgICAgICAgICAgICAgIGNvbHVtbjJBcmd1bWVudHNXaXRoSm9pbmVkVGFibGUuam9pbignLicpLFxuICAgICAgICAgICAgICAgIG9wZXJhdG9yLFxuICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICAgICAgLy8gY29sdW1uMkFyZ3VtZW50c1dpdGhKb2luZWRUYWJsZS5qb2luKCcuJylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgb25PYmplY3QgPSB7XG4gICAgICAgICAgICBvbkNvbHVtbnM6IChjb2x1bW4xOiBhbnksIG9wZXJhdG9yOiBhbnksIGNvbHVtbjI6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIG9uV2l0aEpvaW5lZENvbHVtbk9wZXJhdG9yQ29sdW1uKGNvbHVtbjIsIG9wZXJhdG9yLCBjb2x1bW4xLCAnb24nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb25PYmplY3Q7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb246IChjb2x1bW4xOiBhbnksIG9wZXJhdG9yOiBhbnksIGNvbHVtbjI6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIG9uV2l0aEpvaW5lZENvbHVtbk9wZXJhdG9yQ29sdW1uKGNvbHVtbjEsIG9wZXJhdG9yLCBjb2x1bW4yLCAnb24nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb25PYmplY3Q7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW5kT246IChjb2x1bW4xOiBhbnksIG9wZXJhdG9yOiBhbnksIGNvbHVtbjI6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIG9uV2l0aEpvaW5lZENvbHVtbk9wZXJhdG9yQ29sdW1uKGNvbHVtbjEsIG9wZXJhdG9yLCBjb2x1bW4yLCAnYW5kT24nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb25PYmplY3Q7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3JPbjogKGNvbHVtbjE6IGFueSwgb3BlcmF0b3I6IGFueSwgY29sdW1uMjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgb25XaXRoSm9pbmVkQ29sdW1uT3BlcmF0b3JDb2x1bW4oY29sdW1uMSwgb3BlcmF0b3IsIGNvbHVtbjIsICdvck9uJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9uT2JqZWN0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uVmFsOiAoY29sdW1uMTogYW55LCBvcGVyYXRvcjogYW55LCB2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgb25XaXRoQ29sdW1uT3BlcmF0b3JWYWx1ZShjb2x1bW4xLCBvcGVyYXRvciwgdmFsdWUsICdvblZhbCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBvbk9iamVjdDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbmRPblZhbDogKGNvbHVtbjE6IGFueSwgb3BlcmF0b3I6IGFueSwgdmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIG9uV2l0aENvbHVtbk9wZXJhdG9yVmFsdWUoY29sdW1uMSwgb3BlcmF0b3IsIHZhbHVlLCAnYW5kT25WYWwnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb25PYmplY3Q7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3JPblZhbDogKGNvbHVtbjE6IGFueSwgb3BlcmF0b3I6IGFueSwgdmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIG9uV2l0aENvbHVtbk9wZXJhdG9yVmFsdWUoY29sdW1uMSwgb3BlcmF0b3IsIHZhbHVlLCAnb3JPblZhbCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBvbk9iamVjdDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbk51bGw6IChmOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW4yQXJndW1lbnRzID0gdGhpcy5nZXRBcmd1bWVudHNGcm9tQ29sdW1uRnVuY3Rpb24oZik7XG4gICAgICAgICAgICAgICAgY29uc3QgY29sdW1uMkFyZ3VtZW50c1dpdGhKb2luZWRUYWJsZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVUb0pvaW5BbGlhcyxcbiAgICAgICAgICAgICAgICAgICAgLi4uY29sdW1uMkFyZ3VtZW50cyxcbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAgICAga25leE9uT2JqZWN0Lm9uTnVsbChjb2x1bW4yQXJndW1lbnRzV2l0aEpvaW5lZFRhYmxlLmpvaW4oJy4nKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9uT2JqZWN0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSBhcyBhbnk7XG5cbiAgICAgICAgb25GdW5jdGlvbihvbk9iamVjdCBhcyBhbnkpO1xuXG4gICAgICAgIHJldHVybiB0aGlzIGFzIGFueTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbGxLbmV4RnVuY3Rpb25XaXRoQ29sdW1uRnVuY3Rpb24oa25leEZ1bmN0aW9uOiBhbnksIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxLbmV4RnVuY3Rpb25XaXRoQ29uY2F0S2V5Q29sdW1uKGtuZXhGdW5jdGlvbiwgLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29sdW1uQXJndW1lbnRzID0gdGhpcy5nZXRBcmd1bWVudHNGcm9tQ29sdW1uRnVuY3Rpb24oXG4gICAgICAgICAgICBhcmdzWzBdXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBrbmV4RnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRDb2x1bW5OYW1lKC4uLmNvbHVtbkFyZ3VtZW50cyksXG4gICAgICAgICAgICAgICAgYXJnc1sxXSxcbiAgICAgICAgICAgICAgICBhcmdzWzJdXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga25leEZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Q29sdW1uTmFtZSguLi5jb2x1bW5Bcmd1bWVudHMpLFxuICAgICAgICAgICAgICAgIGFyZ3NbMV1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuICAgIHByaXZhdGUgY2FsbEtuZXhGdW5jdGlvbldpdGhDb25jYXRLZXlDb2x1bW4oa25leEZ1bmN0aW9uOiBhbnksIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGNvbnN0IGNvbHVtbk5hbWUgPSB0aGlzLmdldENvbHVtbk5hbWUoLi4uYXJnc1swXS5zcGxpdCgnLicpKTtcblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIGtuZXhGdW5jdGlvbihcbiAgICAgICAgICAgICAgICBjb2x1bW5OYW1lLFxuICAgICAgICAgICAgICAgIGFyZ3NbMV0sXG4gICAgICAgICAgICAgICAgYXJnc1syXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtuZXhGdW5jdGlvbihcbiAgICAgICAgICAgICAgICBjb2x1bW5OYW1lLFxuICAgICAgICAgICAgICAgIGFyZ3NbMV1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbn1cbiJdfQ==