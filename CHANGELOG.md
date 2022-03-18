# Changelog

## ## 4.8.2

-   Bug: Export registerQueryBuilderExtension

## ## 4.8.1

-   Bug: Export registerQueryBuilderExtension (NOT FIXED)

## 4.8.0

-   Chore: Upgrade packages: Knex.js is now tested at v1.0.4
-   Feature: registerQueryBuilderExtension
-   Chore: use prettier

## 4.7.0

-   Bug: `insertItemWithReturning` and `updateItemWithReturning` didn't use alias.

## 4.6.0

-   Attach `tableMetadataKey` and `tableColumns` references to the `Table` class prototypes
    -   This fixes a rare and unique issue where the same `Column`s and `Table`s can get registered multiple times as a side-effect of overenthusiatic tree-shaking

## 4.5.1

-   Republish of 4.5.0 with correct /dist.

## 4.5.0

-   Feature: added `updateItemWithReturning`.
-   Bug: not using database name on joined column names when using `innerJoinTableOnFunction`.

## 4.4.1

-   Bug: result of `getFirstOrNull` and `getSingleOrNull` not always union with `null`.

## 4.4.0

-   Feature: use `getColumn` in `whereColumn` in cases with nested subqueries.

## 4.3.0

-   Feature: added `getColumnAlias` to get alias of column name to use in `raw` functions.
-   Feature: `insertItemWithReturning`.
-   Feature: `distinctOn`.

## 4.2.1

-   Bug: `where` didn't use alias of joined column.

## 4.2.0

-   Added functions `innerJoin` and `leftOuterJoin`.

## 4.1.0

-   Upgrade Knex.js to v0.95.0.
-   Upgrade TypeScript to v4.2.3.
-   Fix example code for `registerBeforeInsertTransform`.

## 4.0.0

-   Dropped lamba support.

## 3.1.0

-   Return correct object(s) when omitting a select clause.

## 3.0.1

-   Fix: `orderBy` with `innerJoinTableOnFunction`.

## 3.0.0

-   Dropped support for Node 8 (Knex.js v0.21.0)
-   Minimal TypeScript version is 4.1.
-   Updated all functions to use strings as parameters and deprecated the use of lambas. Use `npx typed-knex -u string-parameters` to upgrade.
-   Better error message when there is a foreign key object, but not a foreign key property.

## 2.18.0

-   `findByPrimaryKey` returns `| undefined` instead of `| void`.

## 2.17.0

-   Allow `Date` columns in `orderBy`.

## 2.16.0

-   Documentation: registerBeforeInsertTransform and registerBeforeUpdateTransform.
-   Allow Date columns in `findByPrimaryKey`.
-   Tested with Node.js v14.11.0.
-   Added "Breaking changes in next major release" in README.

## 2.15.0

    - Fixed insert and update queries for tables with column name mappings.

## 2.14.0

-   Fixed compilation errors for sub-queries using `code` (`whereExists`, `union`, `selectQuery`)

## 2.13.0

-   Added `FlattenOption` to the default import.
-   Make `tableName` optional for `@Table`.

## 2.12.1

-   Fix `getCount` result.

## 2.12.0

-   Fix: export `validateTables`.
-   Added `orderByRaw`.

## 2.11.0

-   Fix: Table joined with `leftOuterJoinTableOnFunction` could not be referenced in a following `leftOuterJoinTableOnFunction`.
-   Add `Table` as alias for `Entity` and `validateTables` for `validateEntities`.

## 2.10.0

-   Added `insertSelect` for inserting selects (eg `INSERT INTO table (column) SELECT 'value'`)

## 2.9.0

-   Updated on clauses for joins:
    -   Deprecated `.onColumns`. Use `npx typed-knex -u join-on-columns-to-on` to upgrade.
    -   Added `.on`, `andOn`, `orOn`, `onVal`, `andOnVal`, `orOnVal`.

## 2.8.1

-   Add deprecation warning for `FlattenOption.noFlatten`.

## 2.8.0

-   Updated support for `Date` to also include nullable values.
-   Added support for array type in entities.

## 2.7.0

-   Added `getTableName` and `getColumnName`.
-   Added `keepFlat`.
-   Upgraded packages.
-   Rewritten some internal helper types.
-   Added support for `Date` type in entities.

## 2.6.0

-   Overloaded `orWhere` and `andWhere` as to also accept an operator.
-   Added `orWhereNull` and `orWhereNotNull`.

## 2.5.0

-   Added `innerJoinTableOnFunction`.
-   Overloaded `where` as to also accept an operator.

## 2.4.1

-   Fix: better handling of optional properties.

## 2.1.0

-   Added `selectQuery`.

## 2.0.0

Completely different interface, feels like I'm doing a Python 3.
