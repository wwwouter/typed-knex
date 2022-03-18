import { SelectableColumnTypes } from "./SelectableColumnTypes";
// Removes all optional, undefined and null from type
export type NonNullableRecursive<T> = {
    [P in keyof T]-?: T[P] extends SelectableColumnTypes ? NonNullable<T[P]> : NonNullableRecursive<NonNullable<T[P]>>;
};
