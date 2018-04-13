import * as flat from 'flat';

export function unflatten(o: any): any {
    if (o instanceof Array) {
        return o.map((i) => flat.unflatten(i));
    }
    return flat.unflatten(o);
}
