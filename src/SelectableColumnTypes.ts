import { ICustomDatabaseType } from "./ICustomDatabaseType";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SelectableColumnTypes = string | number | boolean | Date | undefined | null | any[] | ICustomDatabaseType;
