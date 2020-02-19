import { NonForeignKeyObjects } from './NonForeignKeyObjects';
// Removes all optional, undefined and null from type
export type NonNullableRecursive<T> = {
    [P in keyof T]-?: T[P] extends object ? T[P] extends NonForeignKeyObjects ? Required<NonNullable<T[P]>> : NonNullableRecursive<T[P]> : Required<NonNullable<T[P]>>;
};