import { SelectableColumnTypes } from "./SelectableColumnTypes";

export type NestedKeysOf<T extends { [key: string]: any }, Key extends keyof T, Level extends string> =
    // Make sure it won't try to go on an endless recursive loop
    Level extends "11111" ? never : Key extends string ? (T[Key] extends SelectableColumnTypes ? Key : `${Key}.${NestedKeysOf<T[Key], keyof T[Key], `1${Level}`>}`) : never;

export type NestedForeignKeyKeysOf<T extends { [key: string]: any }, Key extends keyof T, Level extends string> =
    // Make sure it won't try to go on an endless recursive loop
    Level extends "11111" ? never : Key extends string ? (T[Key] extends SelectableColumnTypes ? never : `${Key}` | `${Key}.${NestedForeignKeyKeysOf<T[Key], keyof T[Key], `1${Level}`>}`) : never;
