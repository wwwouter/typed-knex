export function entity(tableName: string) {
    return (tableClass: Function) => {
        tableClass.prototype.typedKnex = { tableName: tableName };
    };
}
