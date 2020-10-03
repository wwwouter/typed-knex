import { SelectableColumnTypes } from './SelectableColumnTypes';
// Removes all optional, undefined and null from type
export type NonNullableRecursive<T> = {
    [P in keyof T]-?: T[P] extends SelectableColumnTypes ? Required<NonNullable<T[P]>> : NonNullableRecursive<T[P]>;
};