/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as flat from "flat";

export enum FlattenOption {
    flatten = "flatten",
    /**
     * @deprecated since version 2.8.1, use .keepFlat()
     */
    noFlatten = "noFlatten",
    flattenAndSetToNull = "flattenAndSetToNull",
}

export function unflatten(o: any): any {
    if (o instanceof Array) {
        return o.map((i) => unflatten(i));
    }
    return flat.unflatten(o);
}

function areAllPropertiesNull(o: any) {
    if (o === null || o === undefined) {
        return false;
    }
    const keys = Object.keys(o);
    if (keys.length === 0) {
        return false;
    }
    let allNull = true;
    for (const key of keys) {
        if (o[key] !== null) {
            allNull = false;
            break;
        }
    }
    return allNull;
}

export function setToNull(o: any): any {
    if (o instanceof Array) {
        return o.map((i) => setToNull(i));
    } else {
        if (o !== null && o !== undefined) {
            const keys = Object.keys(o);
            for (const key of keys) {
                if (typeof o[key] === "object") {
                    setToNull(o[key]);
                    if (areAllPropertiesNull(o[key])) {
                        o[key] = null;
                    }
                }
            }
        }
    }
    return o;
}

export function flattenByOption(o: any, flattenOption?: FlattenOption) {
    if (flattenOption === FlattenOption.noFlatten) {
        return o;
    }
    const unflattened = unflatten(o);
    if (flattenOption === undefined || flattenOption === FlattenOption.flatten) {
        return unflattened;
    }
    return setToNull(unflattened);
}
