export declare enum FlattenOption {
    flatten = "flatten",
    /**
     * @deprecated since version 2.8.1, use .keepFlat()
     */
    noFlatten = "noFlatten",
    flattenAndSetToNull = "flattenAndSetToNull"
}
export declare function unflatten(o: any): any;
export declare function setToNull(o: any): any;
export declare function flattenByOption(o: any, flattenOption?: FlattenOption): any;
