import { SelectableColumnTypes } from "./SelectableColumnTypes";

export type NestedKeysOf<T extends { [key: string]: any }, Key extends keyof T, Level extends string> =
    // Make sure it won't try to go on an endless recursive loop
    // Level extends '111111'
    Level extends '11'
    ?
    never
    :
    Key extends string
    ?
    T[Key] extends SelectableColumnTypes
    ?
    Key
    :
    `${Key}.${NestedKeysOf<T[Key], keyof T[Key], `1${Level}`>}`
    :
    never;
