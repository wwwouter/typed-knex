# typed-knex

[![npm version](https://img.shields.io/npm/v/@wwwouter/typed-knex.svg)](https://www.npmjs.com/package/@wwwouter/typed-knex)
[![Build Status](https://travis-ci.org/wwwouter/typed-knex.svg?branch=master)](https://travis-ci.org/wwwouter/typed-knex)
[![Dependencies Status](https://david-dm.org/wwwouter/typed-knex.svg)](https://david-dm.org/wwwouter/typed-knex)

Standing on the shoulders of [Knex.js](https://knexjs.org/), but now everything is typed!

> Goals:
>
> -   Be useful for 80% of the use cases, for the other 20% easily switch to lower-level Knex.js.
> -   Be as concise a possible.
> -   Mirror Knex.js as much a possible, with these exceptions:
>     -   Don't use `this`.
>     -   Be selective on what returns a `Promise` and what not.
>     -   Less overloading, which makes typings easier and code completion better.
> -   Get the most of the benefits TypeScript provides: type-checking of parameters, typed results, rename refactorings.

Install:

    npm install @wwwouter/typed-knex

Make sure experimentalDecorators and emitDecoratorMetadata are turned on in your tsconfig.json:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        ...
    },
    ...
}
```

_Tested with Knex.js v0.16.3, TypeScript v3.3.4000 and Node.js v10.13.0_

# Documentation

## Quick example

To reference a column, use an arrow function. Like this `.select(i=>i.name)` or this `.where(i=>i.name, "Hejlsberg")`

```ts
import * as Knex from 'knex';
import { TypedKnex } from '@wwwouter/typed-knex';

const knex = Knex({
    client: 'pg',
    connection: 'postgres://user:pass@localhost:5432/dbname'
});

async function example() {
    const typedKnex = new TypedKnex(knex);

    const query = typedKnex
        .query(User)
        .select(i => i.id)
        .where(i => i.name, 'Hejlsberg');

    const oneUser = await query.getSingle();

    console.log(oneUser.id); // Ok
    console.log(oneUser.name); // Compilation error
}
```

## Define entities

Use the `Entity` decorator to refence a table and use the `Column` decorator to reference a column.

Use `@Column({ primary: true })` for primary key columns.

Use `@Column({ name: '[column name]' })` on property with the type of another `Entity` to reference another table.

```ts
import { Column, Entity } from '@wwwouter/typed-knex';

@Entity('userCategories')
export class UserCategory {
    @Column({ primary: true })
    public id: string;
    @Column()
    public name: string;
    @Column()
    public year: number;
}

@Entity('users')
export class User {
    @Column({ primary: true })
    public id: string;
    @Column()
    public name: string;
    @Column({ name: 'categoryId' })
    public category: UserCategory;
}
```

## Create instance

```ts
import * as Knex from 'knex';
import { TypedKnex } from '@wwwouter/typed-knex';

const knex = Knex({
    client: 'pg',
    connection: 'postgres://user:pass@localhost:5432/dbname'
});

const typedKnex = new TypedKnex(knex);
```

## Helper

-   [getTableName](#getTableName)
-   [getColumnName](#getColumnName)

## Querybuilder

### General

-   [query](#query)
-   [transacting](#transacting)
-   [toQuery](#toQuery)
-   [useKnexQueryBuilder](#useKnexQueryBuilder)
-   [keepFlat](#keepFlat)

### Getting the results (Promises)

-   [findByPrimaryKey](#findByPrimaryKey)
-   [getFirstOrNull](#getFirstOrNull)
-   [getFirst](#getFirst)
-   [getSingleOrNull](#getSingleOrNull)
-   [getSingle](#getSingle)
-   [getMany](#getMany)
-   [getCount](#getCount)
-   [insertItem](#insertItem)
-   [insertItems](#insertItems)
-   [del](#del)
-   [delByPrimaryKey](#delByPrimaryKey)
-   [updateItem](#updateItem)
-   [updateItemByPrimaryKey](#updateItemByPrimaryKey)
-   [updateItemsByPrimaryKey](#updateItemsByPrimaryKey)
-   [execute](#execute)

### Building the query

-   [select](#select)
-   [where](#where)
-   [andWhere](#andWhere)
-   [orWhere](#orWhere)
-   [whereNot](#whereNot)
-   [whereColumn](#whereColumn)
-   [whereNull](#whereNull)
-   [orWhereNull](#orWhereNull)
-   [whereNotNull](#whereNotNull)
-   [orWhereNotNull](#orWhereNotNull)
-   [orderBy](#orderBy)
-   [innerJoinColumn](#innerJoinColumn)
-   [innerJoinTableOnFunction](#innerJoinTableOnFunction)
-   [leftOuterJoinColumn](#leftOuterJoinColumn)
-   [leftOuterJoinTableOnFunction](#leftOuterJoinTableOnFunction)
-   [selectRaw](#selectRaw)
-   [selectQuery](#selectQuery)
-   [whereIn](#whereIn)
-   [whereNotIn](#whereNotIn)
-   [orWhereIn](#orWhereIn)
-   [orWhereNotIn](#orWhereNotIn)
-   [whereBetween](#whereBetween)
-   [whereNotBetween](#whereNotBetween)
-   [orWhereBetween](#orWhereBetween)
-   [orWhereNotBetween](#orWhereNotBetween)
-   [whereExists](#whereExists)
-   [orWhereExists](#orWhereExists)
-   [whereNotExists](#whereNotExists)
-   [orWhereNotExists](#orWhereNotExists)
-   [whereParentheses](#whereParentheses)
-   [groupBy](#groupBy)
-   [having](#having)
-   [havingNull](#havingNull)
-   [havingNotNull](#havingNotNull)
-   [havingIn](#havingIn)
-   [havingNotIn](#havingNotIn)
-   [havingExists](#havingExists)
-   [havingNotExists](#havingNotExists)
-   [havingBetween](#havingBetween)
-   [havingNotBetween](#havingNotBetween)
-   [union](#union)
-   [unionAll](#unionAll)
-   [min](#min)
-   [count](#count)
-   [countDistinct](#countDistinct)
-   [max](#max)
-   [sum](#sum)
-   [sumDistinct](#sumDistinct)
-   [avg](#avg)
-   [avgDistinct](#avgDistinct)
-   [clearSelect](#clearSelect)
-   [clearWhere](#clearWhere)
-   [clearOrder](#clearOrder)
-   [limit](#limit)
-   [offset](#offset)
-   [whereRaw](#whereRaw)
-   [havingRaw](#havingRaw)
-   [truncate](#truncate)
-   [distinct](#distinct)
-   [clone](#clone)
-   [groupByRaw](#groupByRaw)

### getTableName

```ts
const tableName = getTableName(User);

// tableName = 'users'
```

### getTableName

```ts
const columnName = getColumnName(User, 'id');

// columnName = 'id'
```

### query

Use `typedKnex.query(Type)` to create a query for the table referenced by `Type`

```ts
const query = typedKnex.query(User);
```

### select

https://knexjs.org/#Builder-select

```ts
typedKnex.query(User).select(i => i.id);
```

```ts
typedKnex.query(User).select(i => [i.id, i.name]);
```

### where

https://knexjs.org/#Builder-where

```ts
typedKnex.query(User).where(i => i.name, 'name');
```

Or with operator

```ts
typedKnex.query(User).where(c => c.name, 'like', '%user%');

// select * from "users" where "users"."name" like '%user%'
```

### andWhere

```ts
typedKnex
    .query(User)
    .where(i => i.name, 'name')
    .andWhere(i => i.name, 'name');
```

```ts
typedKnex
    .query(User)
    .where(i => i.name, 'name')
    .andWhere(i => i.name, 'like', '%na%');
```

### orWhere

```ts
typedKnex
    .query(User)
    .where(i => i.name, 'name')
    .orWhere(i => i.name, 'name');
```

```ts
typedKnex
    .query(User)
    .where(i => i.name, 'name')
    .orWhere(i => i.name, 'like', '%na%');
```

### whereNot

https://knexjs.org/#Builder-whereNot

```ts
typedKnex.query(User).whereNot(i => i.name, 'name');
```

### whereColumn

To use in subqueries

```ts
typedKnex.query(User).whereNotExists(UserSetting, (subQuery, parentColumn) => {
    subQuery.whereColumn(i => i.userId, '=', parentColumn.id);
});
```

### whereNull

```ts
typedKnex.query(User).whereNull(i => i.name);
```

### orWhereNull

```ts
typedKnex
    .query(User)
    .whereNull(i => i.name)
    .orWhereNull(i => i.name);
```

### whereNotNull

```ts
typedKnex.query(User).whereNotNull(i => i.name);
```

### orWhereNotNull

```ts
typedKnex
    .query(User)
    .whereNotNull(i => i.name)
    .orWhereNotNull(i => i.name);
```

### orderBy

```ts
typedKnex.query(User).orderBy(i => i.id);
```

### innerJoinColumn

```ts
typedKnex.query(User).innerJoinColumn(i => i.category);
```

### innerJoinTableOnFunction

```ts
typedKnex.query(User).innerJoinTableOnFunction('evilTwin', User, join => {
    join.onColumns(
        i => i.id,
        '=',
        j => j.id
    );
});
```

### leftOuterJoinColumn

```ts
typedKnex.query(User).leftOuterJoinColumn(i => i.category);
```

### leftOuterJoinTableOnFunction

```ts
typedKnex.query(User).leftOuterJoinTableOnFunction('evilTwin', User, join => {
    join.onColumns(
        i => i.id,
        '=',
        j => j.id
    );
});
```

### selectRaw

```ts
typedKnex
    .query(User)
    .selectRaw('otherId', Number, 'select other.id from other');
```

### selectQuery

```ts
typedKnex
    .query(UserCategory)
    .select(i => i.id)
    .selectQuery('total', Number, User, (subQuery, parentColumn) => {
        subQuery
            .count(i => i.id, 'total')
            .whereColumn(c => c.categoryId, '=', parentColumn.id);
    });
```

```sql
select "userCategories"."id" as "id", (select count("users"."id") as "total" from "users" where "users"."categoryId" = "userCategories"."id") as "total" from "userCategories"
```

### findByPrimaryKey

```ts
const user = await typedKnex
    .query(User)
    .findByPrimaryKey('id', i => [i.id, i.name]);
```

### whereIn

```ts
typedKnex.query(User).whereIn(i => i.name, ['user1', 'user2']);
```

### whereNotIn

```ts
typedKnex.query(User).whereNotIn(i => i.name, ['user1', 'user2']);
```

### orWhereIn

```ts
typedKnex
    .query(User)
    .whereIn(i => i.name, ['user1', 'user2'])
    .orWhereIn(i => i.name, ['user3', 'user4']);
```

### orWhereNotIn

```ts
typedKnex
    .query(User)
    .whereIn(i => i.name, ['user1', 'user2'])
    .orWhereNotIn(i => i.name, ['user3', 'user4']);
```

### whereBetween

```ts
typedKnex.query(UserCategory).whereBetween(i => i.year, [1, 2037]);
```

### whereNotBetween

```ts
typedKnex.query(User).whereNotBetween(i => i.year, [1, 2037]);
```

### orWhereBetween

```ts
typedKnex
    .query(User)
    .whereBetween(c => c.year, [1, 10])
    .orWhereBetween(c => c.year, [100, 1000]);
```

### orWhereNotBetween

```ts
typedKnex
    .query(User)
    .whereBetween(c => c.year, [1, 10])
    .orWhereNotBetween(c => c.year, [100, 1000]);
```

### whereExists

```ts
typedKnex.query(User).whereExists(UserSetting, (subQuery, parentColumn) => {
    subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
});
```

### orWhereExists

```ts
typedKnex.query(User).orWhereExists(UserSetting, (subQuery, parentColumn) => {
    subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
});
```

### whereNotExists

```ts
typedKnex.query(User).whereNotExists(UserSetting, (subQuery, parentColumn) => {
    subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
});
```

### orWhereNotExists

```ts
typedKnex
    .query(User)
    .orWhereNotExists(UserSetting, (subQuery, parentColumn) => {
        subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
    });
```

### whereParentheses

```ts
typedKnex
    .query(User)
    .whereParentheses(sub => sub.where(c => c.id, '1').orWhere(c => c.id, '2'))
    .orWhere(c => c.name, 'Tester');

const queryString = query.toQuery();
console.log(queryString);
```

Outputs:

```sql
select * from "users" where ("users"."id" = '1' or "users"."id" = '2') or "users"."name" = 'Tester'
```

### groupBy

```ts
typedKnex
    .query(User)
    .select(c => c.someValue)
    .selectRaw('total', Number, 'SUM("numericValue")')
    .groupBy(c => c.someValue);
```

### having

```ts
typedKnex.query(User).having(c => c.numericValue, '>', 10);
```

### havingNull

```ts
typedKnex.query(User).havingNull(c => c.numericValue);
```

### havingNotNull

```ts
typedKnex.query(User).havingNotNull(c => c.numericValue);
```

### havingIn

```ts
typedKnex.query(User).havingIn(c => c.name, ['user1', 'user2']);
```

### havingNotIn

```ts
typedKnex.query(User).havingNotIn(c => c.name, ['user1', 'user2']);
```

### havingExists

```ts
typedKnex.query(User).havingExists(UserSetting, (subQuery, parentColumn) => {
    subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
});
```

### havingNotExists

```ts
typedKnex.query(User).havingNotExists(UserSetting, (subQuery, parentColumn) => {
    subQuery.whereColumn(c => c.userId, '=', parentColumn.id);
});
```

### havingBetween

```ts
typedKnex.query(User).havingBetween(c => c.numericValue, [1, 10]);
```

### havingNotBetween

```ts
typedKnex.query(User).havingNotBetween(c => c.numericValue, [1, 10]);
```

### union

```ts
typedKnex.query(User).union(User, subQuery => {
    subQuery.select(c => [c.id]).where(c => c.numericValue, 12);
});
```

### unionAll

```ts
typedKnex
    .query(User)
    .select(c => [c.id])
    .unionAll(User, subQuery => {
        subQuery.select(c => [c.id]).where(c => c.numericValue, 12);
    });
```

### min

```ts
typedKnex.query(User).min(c => c.numericValue, 'minNumericValue');
```

### count

```ts
typedKnex.query(User).count(c => c.numericValue, 'countNumericValue');
```

### countDistinct

```ts
typedKnex
    .query(User)
    .countDistinct(c => c.numericValue, 'countDistinctNumericValue');
```

### max

```ts
typedKnex.query(User).max(c => c.numericValue, 'maxNumericValue');
```

### sum

```ts
typedKnex.query(User).sum(c => c.numericValue, 'sumNumericValue');
```

### sumDistinct

```ts
typedKnex
    .query(User)
    .sumDistinct(c => c.numericValue, 'sumDistinctNumericValue');
```

### avg

```ts
typedKnex.query(User).avg(c => c.numericValue, 'avgNumericValue');
```

### avgDistinct

```ts
typedKnex
    .query(User)
    .avgDistinct(c => c.numericValue, 'avgDistinctNumericValue');
```

### clearSelect

```ts
typedKnex
    .query(User)
    .select(i => i.id)
    .clearSelect()
    .select((i = i.name));
```

### clearWhere

```ts
typedKnex
    .query(User)
    .where(i => i.id, 'name')
    .clearWhere()
    .where((i = i.name), 'name');
```

### clearOrder

```ts
typedKnex
    .query(User)
    .orderBy(i => i.id)
    .clearOrder()
    .orderBy((i = i.name));
```

### limit

```ts
typedKnex.query(User).limit(10);
```

### offset

```ts
typedKnex.query(User).offset(10);
```

### useKnexQueryBuilder

Use `useKnexQueryBuilder` to get to the underlying Knex.js query builder.

```ts
const query = typedKnex.query(User)
    .useKnexQueryBuilder(queryBuilder => queryBuilder.where('somethingelse', 'value')
    .select(i=>i.name);
);
```

### keepFlat

Use `keepFlat` to prevent unflattening of the result.

```ts
const item = await typedKnex
    .query(User)
    .where(i => i.name, 'name')
    .innerJoinColumn(i => i.category);
    .select(i=>[i.name, i.category.name)
    .getFirst();

// returns { name: 'user name', category: { name: 'category name' }}

const item = await typedKnex
    .query(User)
    .where(i => i.name, 'name')
    .innerJoinColumn(i => i.category);
    .select(i=>[i.name, i.category.name)
    .keepFlat()
    .getFirst();

// returns { name: 'user name', category.name: 'category name' }
```

### toQuery

```ts
const query = typedKnex.query(User);

console.log(query.toQuery()); // select * from "users"
```

### getFirstOrNull

| Result            | No item | One item | Many items |
| ----------------- | ------- | -------- | ---------- |
| `getFirst`        | `Error` | Item     | First item |
| `getSingle`       | `Error` | Item     | `Error`    |
| `getFirstOrNull`  | `null`  | Item     | First item |
| `getSingleOrNull` | `null`  | Item     | `Error`    |

```ts
const user = await typedKnex
    .query(User)
    .where(i => i.name, 'name')
    .getFirstOrNull();
```

### getFirst

| Result            | No item | One item | Many items |
| ----------------- | ------- | -------- | ---------- |
| `getFirst`        | `Error` | Item     | First item |
| `getSingle`       | `Error` | Item     | `Error`    |
| `getFirstOrNull`  | `null`  | Item     | First item |
| `getSingleOrNull` | `null`  | Item     | `Error`    |

```ts
const user = await typedKnex
    .query(User)
    .where(i => i.name, 'name')
    .getFirst();
```

### getSingleOrNull

| Result            | No item | One item | Many items |
| ----------------- | ------- | -------- | ---------- |
| `getFirst`        | `Error` | Item     | First item |
| `getSingle`       | `Error` | Item     | `Error`    |
| `getFirstOrNull`  | `null`  | Item     | First item |
| `getSingleOrNull` | `null`  | Item     | `Error`    |

```ts
const user = await typedKnex
    .query(User)
    .where(i => i.name, 'name')
    .getSingleOrNull();
```

### getSingle

| Result            | No item | One item | Many items |
| ----------------- | ------- | -------- | ---------- |
| `getFirst`        | `Error` | Item     | First item |
| `getSingle`       | `Error` | Item     | `Error`    |
| `getFirstOrNull`  | `null`  | Item     | First item |
| `getSingleOrNull` | `null`  | Item     | `Error`    |

```ts
const user = await typedKnex
    .query(User)
    .where(i => i.name, 'name')
    .getSingle();
```

### getMany

```ts
const users = await typedKnex
    .query(User)
    .whereNotNull(i => i.name)
    .getMany();
```

### getCount

```ts
typedKnex.query(User);
```

### insertItem

```ts
typedKnex.query(User);
```

### insertItems

```ts
typedKnex.query(User);
```

### del

```ts
typedKnex.query(User);
```

### delByPrimaryKey

```ts
typedKnex.query(User);
```

### updateItem

```ts
typedKnex.query(User);
```

### updateItemByPrimaryKey

```ts
typedKnex.query(User);
```

### updateItemsByPrimaryKey

```ts
typedKnex.query(User);
```

### execute

```ts
typedKnex.query(User);
```

### whereRaw

```ts
typedKnex.query(User);
```

### havingRaw

```ts
typedKnex.query(User);
```

### transacting

```ts
const typedKnex = new TypedKnex(database);
const transaction = await typedKnex.beginTransaction();
try {
    await typedKnex
        .query(User)
        .transacting(transaction)
        .insertItem(user1);
    await typedKnex
        .query(User)
        .transacting(transaction)
        .insertItem(user2);
    await transaction.commit();
} catch (error) {
    await transaction.rollback();
    // handle error
}
```

### truncate

```ts
typedKnex.query(User);
```

### distinct

```ts
typedKnex.query(User);
```

### clone

```ts
typedKnex.query(User);
```

### groupByRaw

```ts
typedKnex.query(User);
```

## Transactions

```ts
const typedKnex = new TypedKnex(database);
const transaction = await typedKnex.beginTransaction();
try {
    await typedKnex
        .query(User)
        .transacting(transaction)
        .insertItem(user1);
    await typedKnex
        .query(User)
        .transacting(transaction)
        .insertItem(user2);
    await transaction.commit();
} catch (error) {
    await transaction.rollback();
    // handle error
}
```

## Validate Entities

Use the `validateEntities` function to make sure that the `Entitiy`'s and `Column`'s in TypeScript exist in the database.

```ts
import * as Knex from 'knex';
import { validateEntities } from '@wwwouter/typed-knex';

const knex = Knex({
    client: 'pg',
    connection: 'postgres://user:pass@localhost:5432/dbname'
});

await validateEntities(knex);
```

## Test

    npm test

## Update version

    npm version major|minor|patch
    npm publish --access public
    git push

for beta

    npm publish --access public --tag beta
