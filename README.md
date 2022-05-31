# typed-knex

[![npm version](https://img.shields.io/npm/v/@wwwouter/typed-knex.svg)](https://www.npmjs.com/package/@wwwouter/typed-knex)
[![Build Status](https://travis-ci.org/wwwouter/typed-knex.svg?branch=master)](https://travis-ci.org/wwwouter/typed-knex)

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

_Tested with Knex.js v1.0.4, TypeScript v4.6.2 and Node.js v17.4.0_

# **Important upgrade notice**

Because TypeScript 4.1 supports template literal string types, the function syntax is no longer necessary. You can now use strings while maintaining type-safety. The function syntax is removed since version 4.

To help with the upgrade, you can run `npx typed-knex -u string-parameters` to automatically switch over to the string syntax.

# Breaking changes in v4

-   Because TypeScript 4.1 supports template literal string types, the function syntax is no longer necessary. You can now use strings while maintaining type-safety. The function syntax is removed.
    Run `npx typed-knex -u string-parameters` to automatically upgrade.
-   `.onColumn()` is deprecated. Use `.on()`. Remember that the columns switched eg `.onColumns(i=>i.prop1, '=' j=>j.prop2) should become .on("prop2", '=', "prop1")`. Run `npx typed-knex -u join-on-columns-to-on` to automatically upgrade.
-   The use of optional columns (`@Column() public nickName?: string;`) is deprecated. This was used to signal a nullable column. The correct way to do this is `@Column() public nickName: string | null;`.

# Documentation

## Quick example

To reference a column, use the name. Like this `.select("name")` or this `.where("name", "Hejlsberg")`

```ts
import * as Knex from "knex";
import { TypedKnex } from "@wwwouter/typed-knex";

const knex = Knex({
    client: "pg",
    connection: "postgres://user:pass@localhost:5432/dbname",
});

async function example() {
    const typedKnex = new TypedKnex(knex);

    const query = typedKnex.query(User).innerJoin("category", UserCategory, "id", "=", "categoryId").where("name", "Hejlsberg").select("id", "category.name");

    const oneUser = await query.getSingle();

    console.log(oneUser.id); // Ok
    console.log(oneUser.category.name); // Ok
    console.log(oneUser.name); // Compilation error
}
```

## Define tables

Use the `Table` decorator to reference a table and use the `Column` decorator to reference a column.

Use `@Column({ primary: true })` for primary key columns.

Use `@Column({ name: '[column name]' })` on property with the type of another `Table` to reference another table.

```ts
import { Column, Table } from "@wwwouter/typed-knex";

@Table("userCategories")
export class UserCategory {
    @Column({ primary: true })
    public id: string;
    @Column()
    public name: string;
    @Column()
    public year: number;
}

@Table("users")
export class User {
    @Column({ primary: true })
    public id: string;
    @Column()
    public name: string;
    @Column()
    public categoryId: string;
    @Column({ name: "categoryId" })
    public category: UserCategory;
    @Column()
    public someNullableValue: string | null;
}
```

## Create instance

```ts
import * as Knex from "knex";
import { TypedKnex } from "@wwwouter/typed-knex";

const knex = Knex({
    client: "pg",
    connection: "postgres://user:pass@localhost:5432/dbname",
});

const typedKnex = new TypedKnex(knex);
```

## Helper

-   [getTableName](#getTableName)
-   [getColumnName](#getColumnName)
-   [registerBeforeInsertTransform](#registerBeforeInsertTransform)
-   [registerBeforeUpdateTransform](#registerBeforeUpdateTransform)

## Querybuilder

### General

-   [query](#query)
-   [transacting](#transacting)
-   [toQuery](#toQuery)
-   [useKnexQueryBuilder](#useKnexQueryBuilder)
-   [keepFlat](#keepFlat)
-   [getColumnAlias](#getColumnAlias)

### Getting the results (Promises)

-   [findByPrimaryKey](#findByPrimaryKey) _deprecated_
-   [getFirstOrNull](#getFirstOrNull)
-   [getFirstOrUndefined](#getFirstOrUndefined)
-   [getFirst](#getFirst)
-   [getSingleOrNull](#getSingleOrNull)
-   [getSingleOrUndefined](#getSingleOrUndefined)
-   [getSingle](#getSingle)
-   [getMany](#getMany)
-   [getCount](#getCount)
-   [insertItem](#insertItem)
-   [insertItemWithReturning](#insertItemWithReturning)
-   [insertItems](#insertItems)
-   [insertSelect](#insertSelect)
-   [del](#del)
-   [delByPrimaryKey](#delByPrimaryKey) _deprecated_
-   [updateItem](#updateItem)
-   [updateItemWithReturning](#updateItemWithReturning)
-   [updateItemByPrimaryKey](#updateItemByPrimaryKey) _deprecated_
-   [updateItemsByPrimaryKey](#updateItemsByPrimaryKey) _deprecated_
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
-   [orderByRaw](#orderByRaw)
-   [innerJoinColumn](#innerJoinColumn)
-   [innerJoin](#innerJoin)
-   [innerJoinTableOnFunction](#innerJoinTableOnFunction)
-   [leftOuterJoin](#leftOuterJoin)
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
-   [distinctOn](#distinctOn)
-   [clone](#clone)
-   [groupByRaw](#groupByRaw)

### getTableName

```ts
const tableName = getTableName(User);

// tableName = 'users'
```

### getColumnName

```ts
const columnName = getColumnName(User, "id");

// columnName = 'id'
```

### registerBeforeInsertTransform

Hook that is run before doing an insert. Execute this function as soon as possible. For example at the top of `index.ts` or `server.ts`.

```
registerBeforeInsertTransform((item: any, typedQueryBuilder: ITypedQueryBuilder<{}, {}, {}>) => {
    if (typedQueryBuilder.columns.find(column => column.name === 'created_at') && !item.hasOwnProperty('created_at')) {
        item.created_at = new Date();
    }
    if (typedQueryBuilder.columns.find(column => column.name === 'updated_at') && !item.hasOwnProperty('updated_at')) {
        item.updated_at = new Date();
    }
    if (typedQueryBuilder.columns.find(column => column.name === 'id') && !item.hasOwnProperty('id')) {
        item.id = guid();
    }
    return item;
});
```

### registerBeforeUpdateTransform

Hook that is run before doing an update. Execute this function as soon as possible. For example at the top of `index.ts` or `server.ts`.

```
registerBeforeUpdateTransform((item: any, typedQueryBuilder: ITypedQueryBuilder<{}, {}, {}>) => {
    if (typedQueryBuilder.columns.find("name" === 'updated_at') && !item.hasOwnProperty('updated_at')) {
        item.updated_at = new Date();
    }
    return item;
});
```

### query

Use `typedKnex.query(Type)` to create a query for the table referenced by `Type`

```ts
const query = typedKnex.query(User);
```

### getColumnAlias

Use `getColumnAlias` to get the underlying alias of a column, to use in a `raw` function.

```ts
const query = typedKnex.query(UserCategory);
query.selectRaw("hash", String, `hashFunction(${query.getColumnAlias("name")})`).select("id");

// select (hashFunction("userCategories"."name")) as "hash", "userCategories"."id" as "id" from "userCategories"
```

### select

https://knexjs.org/#Builder-select

```ts
typedKnex.query(User).select("id");
```

```ts
typedKnex.query(User).select("id", "name");
```

### where

https://knexjs.org/#Builder-where

```ts
typedKnex.query(User).where("name", "name");
```

Or with operator

```ts
typedKnex.query(User).where("name", "like", "%user%");

// select * from "users" where "users"."name" like '%user%'
```

### andWhere

```ts
typedKnex.query(User).where("name", "name").andWhere("name", "name");
```

```ts
typedKnex.query(User).where("name", "name").andWhere("name", "like", "%na%");
```

### orWhere

```ts
typedKnex.query(User).where("name", "name").orWhere("name", "name");
```

```ts
typedKnex.query(User).where("name", "name").orWhere("name", "like", "%na%");
```

### whereNot

https://knexjs.org/#Builder-whereNot

```ts
typedKnex.query(User).whereNot("name", "name");
```

### whereColumn

To use in subqueries. First parameter is for sub query columns and the third parameter is for columns from the parent query.

```ts
typedKnex.query(User).whereNotExists(UserSetting, (subQuery) => {
    subQuery.whereColumn("userId", "=", "id");
});
```

Use `getColumn` when nesting

```ts
query.whereExists(User, (subQuery1) => {
    subQuery1.whereColumn("status", "=", "status"); // Compares subQuery1 with its parent (query).

    subQuery1.whereExists(User, (subQuery2) => {
        subQuery2.whereColumn(subQuery2.getColumn("status"), "=", query.getColumn("status")); // Compares subQuery2 with the first parent (query)

        subQuery2.whereExists(User, (subQuery3) => {
            subQuery3.whereColumn(subQuery3.getColumn("status"), "=", subQuery1.getColumn("status")); // Compares subQuery3 with the second parent (subQuery1)
        });
    });
});
```

### whereNull

```ts
typedKnex.query(User).whereNull("name");
```

### orWhereNull

```ts
typedKnex.query(User).whereNull("name").orWhereNull("name");
```

### whereNotNull

```ts
typedKnex.query(User).whereNotNull("name");
```

### orWhereNotNull

```ts
typedKnex.query(User).whereNotNull("name").orWhereNotNull("name");
```

### orderBy

```ts
typedKnex.query(User).orderBy("id");
```

### orderByRaw

```ts
await typedKnex.query(User).orderByRaw("SUM(??) DESC", "users.year");

//  select * from "users" order by SUM("users"."year") DESC
```

### innerJoin

```ts
typedKnex.query(User).innerJoin("category", UserCategory, "id", "=", "categoryId");

// select * from "users" inner join "userCategories" as "category" on "category"."id" = "users"."categoryId"
```

### innerJoinColumn

```ts
typedKnex.query(User).innerJoinColumn("category");
```

### innerJoinTableOnFunction

```ts
typedKnex.query(User).innerJoinTableOnFunction("evilTwin", User, (join) => {
    join.on("id", "=", "id").andOn("name", "=", "id").orOn("someValue", "=", "id").onVal("name", "=", "1").andOnVal("name", "=", "2").orOnVal("name", "=", "3").onNull("name");
});
```

### leftOuterJoin

```ts
typedKnex.query(User).leftOuterJoin("category", UserCategory, "id", "=", "categoryId");

// select * from "users" left outer join "userCategories" as "category" on "category"."id" = "users"."categoryId"
```

### leftOuterJoinColumn

```ts
typedKnex.query(User).leftOuterJoinColumn("category");
```

### leftOuterJoinTableOnFunction

```ts
typedKnex.query(User).leftOuterJoinTableOnFunction("evilTwin", User, (join) => {
    join.on("id", "=", "id").andOn("name", "=", "id").orOn("someValue", "=", "id").onVal("name", "=", "1").andOnVal("name", "=", "2").orOnVal("name", "=", "3").onNull("name");
});
```

### selectRaw

```ts
typedKnex.query(User).selectRaw("otherId", Number, "select other.id from other");
```

### selectQuery

```ts
typedKnex
    .query(UserCategory)
    .select("id")
    .selectQuery("total", Number, User, (subQuery) => {
        subQuery.count("id", "total").whereColumn("categoryId", "=", "id");
    });
```

```sql
select "userCategories"."id" as "id", (select count("users"."id") as "total" from "users" where "users"."categoryId" = "userCategories"."id") as "total" from "userCategories"
```

### findByPrimaryKey

_deprecated_

```ts
const user = await typedKnex.query(User).findByPrimaryKey("id", "d", "name");
```

### whereIn

```ts
typedKnex.query(User).whereIn("name", ["user1", "user2"]);
```

### whereNotIn

```ts
typedKnex.query(User).whereNotIn("name", ["user1", "user2"]);
```

### orWhereIn

```ts
typedKnex.query(User).whereIn("name", ["user1", "user2"]).orWhereIn("name", ["user3", "user4"]);
```

### orWhereNotIn

```ts
typedKnex.query(User).whereIn("name", ["user1", "user2"]).orWhereNotIn("name", ["user3", "user4"]);
```

### whereBetween

```ts
typedKnex.query(UserCategory).whereBetween("year", [1, 2037]);
```

### whereNotBetween

```ts
typedKnex.query(User).whereNotBetween("year", [1, 2037]);
```

### orWhereBetween

```ts
typedKnex.query(User).whereBetween("year", [1, 10]).orWhereBetween("year", [100, 1000]);
```

### orWhereNotBetween

```ts
typedKnex.query(User).whereBetween("year", [1, 10]).orWhereNotBetween("year", [100, 1000]);
```

### whereExists

```ts
typedKnex.query(User).whereExists(UserSetting, (subQuery) => {
    subQuery.whereColumn("userId", "=", "id");
});
```

### orWhereExists

```ts
typedKnex.query(User).orWhereExists(UserSetting, (subQuery) => {
    subQuery.whereColumn("userId", "=", "id");
});
```

### whereNotExists

```ts
typedKnex.query(User).whereNotExists(UserSetting, (subQuery) => {
    subQuery.whereColumn("userId", "=", "id");
});
```

### orWhereNotExists

```ts
typedKnex.query(User).orWhereNotExists(UserSetting, (subQuery) => {
    subQuery.whereColumn("userId", "=", "id");
});
```

### whereParentheses

```ts
typedKnex
    .query(User)
    .whereParentheses((sub) => sub.where("id", "1").orWhere("id", "2"))
    .orWhere("name", "Tester");

const queryString = query.toQuery();
console.log(queryString);
```

Outputs:

```sql
select * from "users" where ("users"."id" = '1' or "users"."id" = '2') or "users"."name" = 'Tester'
```

### groupBy

```ts
typedKnex.query(User).select("someValue").selectRaw("total", Number, 'SUM("numericValue")').groupBy("someValue");
```

### having

```ts
typedKnex.query(User).having("numericValue", ">", 10);
```

### havingNull

```ts
typedKnex.query(User).havingNull("numericValue");
```

### havingNotNull

```ts
typedKnex.query(User).havingNotNull("numericValue");
```

### havingIn

```ts
typedKnex.query(User).havingIn("name", ["user1", "user2"]);
```

### havingNotIn

```ts
typedKnex.query(User).havingNotIn("name", ["user1", "user2"]);
```

### havingExists

```ts
typedKnex.query(User).havingExists(UserSetting, (subQuery) => {
    subQuery.whereColumn("userId", "=", "id");
});
```

### havingNotExists

```ts
typedKnex.query(User).havingNotExists(UserSetting, (subQuery) => {
    subQuery.whereColumn("userId", "=", "id");
});
```

### havingBetween

```ts
typedKnex.query(User).havingBetween("numericValue", [1, 10]);
```

### havingNotBetween

```ts
typedKnex.query(User).havingNotBetween("numericValue", [1, 10]);
```

### union

```ts
typedKnex.query(User).union(User, (subQuery) => {
    subQuery.select("id").where("numericValue", 12);
});
```

### unionAll

```ts
typedKnex
    .query(User)
    .select("id")
    .unionAll(User, (subQuery) => {
        subQuery.select("id").where("numericValue", 12);
    });
```

### min

```ts
typedKnex.query(User).min("numericValue", "minNumericValue");
```

### count

```ts
typedKnex.query(User).count("numericValue", "countNumericValue");
```

### countDistinct

```ts
typedKnex.query(User).countDistinct("numericValue", "countDistinctNumericValue");
```

### max

```ts
typedKnex.query(User).max("numericValue", "maxNumericValue");
```

### sum

```ts
typedKnex.query(User).sum("numericValue", "sumNumericValue");
```

### sumDistinct

```ts
typedKnex.query(User).sumDistinct("numericValue", "sumDistinctNumericValue");
```

### avg

```ts
typedKnex.query(User).avg("numericValue", "avgNumericValue");
```

### avgDistinct

```ts
typedKnex.query(User).avgDistinct("numericValue", "avgDistinctNumericValue");
```

### clearSelect

```ts
typedKnex.query(User).select("id").clearSelect().select("name");
```

### clearWhere

```ts
typedKnex
    .query(User)
    .where("id", "name")
    .clearWhere()
    .where(("name", "name");
```

### clearOrder

```ts
typedKnex
    .query(User)
    .orderBy("id")
    .clearOrder()
    .orderBy(("name");
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
    .select("name");
);
```

### keepFlat

Use `keepFlat` to prevent unflattening of the result.

```ts
const item = await typedKnex
    .query(User)
    .where("name", 'name')
    .innerJoinColumn("category");
    .select("name", "category.name")
    .getFirst();

// returns { name: 'user name', category: { name: 'category name' }}

const item = await typedKnex
    .query(User)
    .where("name", 'name')
    .innerJoinColumn("category");
    .select("name", "category.name")
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

| Result                 | No item     | One item | Many items |
| ---------------------- | ----------- | -------- | ---------- |
| `getFirst`             | `Error`     | Item     | First item |
| `getSingle`            | `Error`     | Item     | `Error`    |
| `getFirstOrNull`       | `null`      | Item     | First item |
| `getSingleOrNull`      | `null`      | Item     | `Error`    |
| `getFirstOrUndefined`  | `undefined` | Item     | First item |
| `getSingleOrUndefined` | `undefined` | Item     | `Error`    |

```ts
const user = await typedKnex.query(User).where("name", "name").getFirstOrNull();
```

### getFirstOrUndefined

| Result                 | No item     | One item | Many items |
| ---------------------- | ----------- | -------- | ---------- |
| `getFirst`             | `Error`     | Item     | First item |
| `getSingle`            | `Error`     | Item     | `Error`    |
| `getFirstOrNull`       | `null`      | Item     | First item |
| `getSingleOrNull`      | `null`      | Item     | `Error`    |
| `getFirstOrUndefined`  | `undefined` | Item     | First item |
| `getSingleOrUndefined` | `undefined` | Item     | `Error`    |

```ts
const user = await typedKnex.query(User).where("name", "name").getFirstOrUndefined();
```

### getFirst

| Result                 | No item     | One item | Many items |
| ---------------------- | ----------- | -------- | ---------- |
| `getFirst`             | `Error`     | Item     | First item |
| `getSingle`            | `Error`     | Item     | `Error`    |
| `getFirstOrNull`       | `null`      | Item     | First item |
| `getSingleOrNull`      | `null`      | Item     | `Error`    |
| `getFirstOrUndefined`  | `undefined` | Item     | First item |
| `getSingleOrUndefined` | `undefined` | Item     | `Error`    |

```ts
const user = await typedKnex.query(User).where("name", "name").getFirst();
```

### getSingleOrNull

| Result                 | No item     | One item | Many items |
| ---------------------- | ----------- | -------- | ---------- |
| `getFirst`             | `Error`     | Item     | First item |
| `getSingle`            | `Error`     | Item     | `Error`    |
| `getFirstOrNull`       | `null`      | Item     | First item |
| `getSingleOrNull`      | `null`      | Item     | `Error`    |
| `getFirstOrUndefined`  | `undefined` | Item     | First item |
| `getSingleOrUndefined` | `undefined` | Item     | `Error`    |

```ts
const user = await typedKnex.query(User).where("name", "name").getSingleOrNull();
```

### getSingleOrUndefined

| Result                 | No item     | One item | Many items |
| ---------------------- | ----------- | -------- | ---------- |
| `getFirst`             | `Error`     | Item     | First item |
| `getSingle`            | `Error`     | Item     | `Error`    |
| `getFirstOrNull`       | `null`      | Item     | First item |
| `getSingleOrNull`      | `null`      | Item     | `Error`    |
| `getFirstOrUndefined`  | `undefined` | Item     | First item |
| `getSingleOrUndefined` | `undefined` | Item     | `Error`    |

```ts
const user = await typedKnex.query(User).where("name", "name").getSingleOrUndefined();
```

### getSingle

| Result                 | No item     | One item | Many items |
| ---------------------- | ----------- | -------- | ---------- |
| `getFirst`             | `Error`     | Item     | First item |
| `getSingle`            | `Error`     | Item     | `Error`    |
| `getFirstOrNull`       | `null`      | Item     | First item |
| `getSingleOrNull`      | `null`      | Item     | `Error`    |
| `getFirstOrUndefined`  | `undefined` | Item     | First item |
| `getSingleOrUndefined` | `undefined` | Item     | `Error`    |

```ts
const user = await typedKnex.query(User).where("name", "name").getSingle();
```

### getMany

```ts
const users = await typedKnex.query(User).whereNotNull("name").getMany();
```

### getCount

```ts
typedKnex.query(User);
```

### insertItem

```ts
typedKnex.query(User);
```

### insertItemWithReturning

```ts
query.insertItemWithReturning({ id: "newId" });

// insert into "users" ("id") values ('newId') returning *
```

```ts
query.insertItemWithReturning({ id: "newId" }, ["id"]);

// insert into "users" ("id") values ('newId') returning "users"."id"
```

### insertItems

```ts
typedKnex.query(User);
```

### insertSelect

```ts
await typedKnex.query(User);
    .selectRaw('f', String, '\'fixedValue\'')
    .select("name")
    .distinct()
    .whereNotNull("name")
    .insertSelect(UserSetting, "id", "initialValue");

// insert into "userSettings" ("userSettings"."id","userSettings"."initialValue") select distinct ('fixedValue') as "f", "users"."name" as "name" from "users" where "users"."name" is not null
```

### del

```ts
typedKnex.query(User);
```

### delByPrimaryKey

_deprecated_

```ts
typedKnex.query(User);
```

### updateItem

```ts
typedKnex.query(User);
```

### updateItemWithReturning

```ts
query.updateItemWithReturning({ id: "newId" });

// update "users" set "id" = 'newId' returning *
```

```ts
query.updateItemWithReturning({ id: "newId" }, ["id"]);

// update "users" set "id" = 'newId' returning "users"."id"
```

### updateItemByPrimaryKey

_deprecated_

```ts
typedKnex.query(User);
```

### updateItemsByPrimaryKey

_deprecated_

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
    await typedKnex.query(User).transacting(transaction).insertItem(user1);
    await typedKnex.query(User).transacting(transaction).insertItem(user2);
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

### distinctOn

```ts
typedKnex.query(UserCategory).select("id").distinctOn(["name"]);

// select distinct on ("userCategories"."name") "userCategories"."id" as "id" from "userCategories"
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
    await typedKnex.query(User).transacting(transaction).insertItem(user1);
    await typedKnex.query(User).transacting(transaction).insertItem(user2);
    await transaction.commit();
} catch (error) {
    await transaction.rollback();
    // handle error
}
```

## Validate tables

Use the `validateTables` function to make sure that the `Table`'s and `Column`'s in TypeScript exist in the database.

```ts
import * as Knex from "knex";
import { validateTables } from "@wwwouter/typed-knex";

const knex = Knex({
    client: "pg",
    connection: "postgres://user:pass@localhost:5432/dbname",
});

await validateTables(knex);
```

## Test

    npm test

## Update version

    npm version major|minor|patch
    update CHANGELOG.md
    git commit --amend
    npm publish --access=public --otp=CODE
    git push

for beta

    update version to x.x.x-beta.x
    npm publish --access public --tag beta --otp=CODE
