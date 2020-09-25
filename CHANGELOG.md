# Changelog

-   Documentation: registerBeforeInsertTransform and registerBeforeUpdateTransform.

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
    -   Deprecated `.onColumns`.
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
