import { SelectableColumnTypes } from './SelectableColumnTypes';
export declare type NonNullableRecursive<T> = {
    [P in keyof T]-?: T[P] extends SelectableColumnTypes ? NonNullable<T[P]> : NonNullableRecursive<NonNullable<T[P]>>;
};
