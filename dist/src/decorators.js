"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrimaryKeyColumn = exports.getColumnProperties = exports.getColumnInformation = exports.Column = exports.getColumnName = exports.getTableName = exports.getTableMetadata = exports.Table = exports.Entity = exports.getEntities = void 0;
require("reflect-metadata");
const tableyMetadataKey = Symbol('table');
const tableColumns = new Map();
const entities = [];
// export function Entity2(tableName: string) {
//     return ((target: Function) => {
//         console.log('target: ', target);
//         return Reflect.metadata(tableyMetadataKey, { tableName: tableName });
//     })(arguments);
// }
function getEntities() {
    return entities;
}
exports.getEntities = getEntities;
function Entity(tableName) {
    return (target) => {
        Reflect.metadata(tableyMetadataKey, { tableName: tableName !== null && tableName !== void 0 ? tableName : target.name })(target);
        entities.push({ tableName: tableName !== null && tableName !== void 0 ? tableName : target.name, entityClass: target });
    };
}
exports.Entity = Entity;
// tslint:disable-next-line: variable-name
exports.Table = Entity;
function getTableMetadata(tableClass) {
    return Reflect.getMetadata(tableyMetadataKey, tableClass);
}
exports.getTableMetadata = getTableMetadata;
function getTableName(tableClass) {
    return Reflect.getMetadata(tableyMetadataKey, tableClass).tableName;
}
exports.getTableName = getTableName;
function getColumnName(tableClass, propertyName) {
    return getColumnInformation(tableClass, propertyName).name;
}
exports.getColumnName = getColumnName;
// function registerEntity(target: any, propertyKey: string): void {
//     Reflect.metadata(columnMetadataKey, { isColumn: true })(target);
//     const columns = tableColumns.get(target.constructor) || [];
//     let name = propertyKey;
//     // console.log('name: ', name);
//     let primary = false;
//     // console.log('options: ', options);
//     if (options) {
//         if (options.name !== undefined) {
//             name = options.name;
//         }
//         primary = options.primary === true;
//     }
//     columns.push({ name, primary, propertyKey });
//     tableColumns.set(target.constructor, columns);
// }
const columnMetadataKey = Symbol('column');
function Column(options) {
    return getRegisterColumn(options);
}
exports.Column = Column;
function getRegisterColumn(options) {
    function registerColumn(target, propertyKey) {
        Reflect.metadata(columnMetadataKey, { isColumn: true })(target);
        const designType = Reflect.getMetadata('design:type', target, propertyKey);
        const isForeignKey = designType
            ? ['String', 'Number', 'Boolean'].includes(designType.name) ===
                false
            : false;
        const columns = tableColumns.get(target.constructor) || [];
        let name = propertyKey;
        // console.log('name: ', name);
        let primary = false;
        // console.log('options: ', options);
        if (options) {
            if (options.name !== undefined) {
                name = options.name;
            }
            primary = options.primary === true;
        }
        columns.push({ name, primary, propertyKey, isForeignKey, designType });
        tableColumns.set(target.constructor, columns);
    }
    return registerColumn;
}
function getColumnInformation(target, propertyKey) {
    const properties = getColumnProperties(target);
    const property = properties.find(i => i.propertyKey === propertyKey);
    if (!property) {
        const fkObject = properties.find(p => p.name === propertyKey);
        if (typeof (fkObject === null || fkObject === void 0 ? void 0 : fkObject.designType) === 'function') {
            throw new Error(`It seems that class "${target.name}" only has a foreign key object "${fkObject.propertyKey}", but is missing the foreign key property "${propertyKey}". Try adding "@column() ${propertyKey} : [correct type]" to class "${target.name}"`);
        }
        throw new Error(`Cannot get column data. Did you set @Column() attribute on ${target.name}.${propertyKey}?`);
    }
    return {
        columnClass: Reflect.getMetadata('design:type', target.prototype, propertyKey),
        name: property.name,
        primary: property.primary,
        propertyKey: property.propertyKey,
        designType: property.designType,
        isForeignKey: property.isForeignKey
    };
}
exports.getColumnInformation = getColumnInformation;
function getColumnProperties(tableClass) {
    const columns = tableColumns.get(tableClass);
    if (!columns) {
        throw new Error(`Cannot get column data from ${tableClass.constructor.name}, did you set @Column() attribute?`);
    }
    return columns;
}
exports.getColumnProperties = getColumnProperties;
function getPrimaryKeyColumn(tableClass) {
    // console.log('tableClass: ', tableClass);
    const columns = tableColumns.get(tableClass);
    if (!columns) {
        throw new Error(`Cannot get column data from ${tableClass.constructor.name}, did you set @Column() attribute?`);
    }
    const primaryKeyColumn = columns.find(i => i.primary);
    if (primaryKeyColumn === undefined) {
        throw new Error(`Cannot get primary key column ${tableClass.constructor.name}, did you set @Column({primary:true}) attribute?`);
    }
    return primaryKeyColumn;
}
exports.getPrimaryKeyColumn = getPrimaryKeyColumn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZWNvcmF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDRCQUEwQjtBQUUxQixNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQVMxQyxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBMkIsQ0FBQztBQUV4RCxNQUFNLFFBQVEsR0FBRyxFQUdkLENBQUM7QUFFSiwrQ0FBK0M7QUFFL0Msc0NBQXNDO0FBQ3RDLDJDQUEyQztBQUMzQyxnRkFBZ0Y7QUFDaEYscUJBQXFCO0FBRXJCLElBQUk7QUFFSixTQUFnQixXQUFXO0lBQ3ZCLE9BQU8sUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFGRCxrQ0FFQztBQUlELFNBQWdCLE1BQU0sQ0FBQyxTQUFrQjtJQUNyQyxPQUFPLENBQUMsTUFBZ0IsRUFBRSxFQUFFO1FBQ3hCLE9BQU8sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxhQUFULFNBQVMsY0FBVCxTQUFTLEdBQUksTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFckYsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLGFBQVQsU0FBUyxjQUFULFNBQVMsR0FBSSxNQUFNLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ2hGLENBQUMsQ0FBQztBQUNOLENBQUM7QUFORCx3QkFNQztBQUVELDBDQUEwQztBQUM3QixRQUFBLEtBQUssR0FBRyxNQUFNLENBQUM7QUFFNUIsU0FBZ0IsZ0JBQWdCLENBQUMsVUFBb0I7SUFDakQsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzlELENBQUM7QUFGRCw0Q0FFQztBQUdELFNBQWdCLFlBQVksQ0FB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LFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFDdEQsb0NBQW9DLENBQ3ZDLENBQUM7S0FDTDtJQUNELE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0RCxJQUFJLGdCQUFnQixLQUFLLFNBQVMsRUFBRTtRQUNoQyxNQUFNLElBQUksS0FBSyxDQUNYLGlDQUFpQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQ3hELGtEQUFrRCxDQUNyRCxDQUFDO0tBQ0w7SUFDRCxPQUFPLGdCQUFnQixDQUFDO0FBQzVCLENBQUM7QUFqQkQsa0RBaUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdyZWZsZWN0LW1ldGFkYXRhJztcblxuY29uc3QgdGFibGV5TWV0YWRhdGFLZXkgPSBTeW1ib2woJ3RhYmxlJyk7XG5cbmludGVyZmFjZSBJQ29sdW1uRGF0YSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHByaW1hcnk6IGJvb2xlYW47XG4gICAgcHJvcGVydHlLZXk6IHN0cmluZztcbiAgICBpc0ZvcmVpZ25LZXk6IGJvb2xlYW47XG4gICAgZGVzaWduVHlwZTogYW55O1xufVxuY29uc3QgdGFibGVDb2x1bW5zID0gbmV3IE1hcDxGdW5jdGlvbiwgSUNvbHVtbkRhdGFbXT4oKTtcblxuY29uc3QgZW50aXRpZXMgPSBbXSBhcyB7XG4gICAgdGFibGVOYW1lOiBzdHJpbmc7XG4gICAgZW50aXR5Q2xhc3M6IEZ1bmN0aW9uO1xufVtdO1xuXG4vLyBleHBvcnQgZnVuY3Rpb24gRW50aXR5Mih0YWJsZU5hbWU6IHN0cmluZykge1xuXG4vLyAgICAgcmV0dXJuICgodGFyZ2V0OiBGdW5jdGlvbikgPT4ge1xuLy8gICAgICAgICBjb25zb2xlLmxvZygndGFyZ2V0OiAnLCB0YXJnZXQpO1xuLy8gICAgICAgICByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YSh0YWJsZXlNZXRhZGF0YUtleSwgeyB0YWJsZU5hbWU6IHRhYmxlTmFtZSB9KTtcbi8vICAgICB9KShhcmd1bWVudHMpO1xuXG4vLyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbnRpdGllcygpIHtcbiAgICByZXR1cm4gZW50aXRpZXM7XG59XG5cblxuXG5leHBvcnQgZnVuY3Rpb24gRW50aXR5KHRhYmxlTmFtZT86IHN0cmluZykge1xuICAgIHJldHVybiAodGFyZ2V0OiBGdW5jdGlvbikgPT4ge1xuICAgICAgICBSZWZsZWN0Lm1ldGFkYXRhKHRhYmxleU1ldGFkYXRhS2V5LCB7IHRhYmxlTmFtZTogdGFibGVOYW1lID8/IHRhcmdldC5uYW1lIH0pKHRhcmdldCk7XG5cbiAgICAgICAgZW50aXRpZXMucHVzaCh7IHRhYmxlTmFtZTogdGFibGVOYW1lID8/IHRhcmdldC5uYW1lLCBlbnRpdHlDbGFzczogdGFyZ2V0IH0pO1xuICAgIH07XG59XG5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogdmFyaWFibGUtbmFtZVxuZXhwb3J0IGNvbnN0IFRhYmxlID0gRW50aXR5O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVNZXRhZGF0YSh0YWJsZUNsYXNzOiBGdW5jdGlvbik6IHsgdGFibGVOYW1lOiBzdHJpbmcgfSB7XG4gICAgcmV0dXJuIFJlZmxlY3QuZ2V0TWV0YWRhdGEodGFibGV5TWV0YWRhdGFLZXksIHRhYmxlQ2xhc3MpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYWJsZU5hbWUodGFibGVDbGFzczogRnVuY3Rpb24pOiBzdHJpbmcge1xuICAgIHJldHVybiBSZWZsZWN0LmdldE1ldGFkYXRhKHRhYmxleU1ldGFkYXRhS2V5LCB0YWJsZUNsYXNzKS50YWJsZU5hbWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb2x1bW5OYW1lPFQ+KHRhYmxlQ2xhc3M6IG5ldyAoKSA9PiBULCBwcm9wZXJ0eU5hbWU6IGtleW9mIFQpOiBzdHJpbmcge1xuICAgIHJldHVybiBnZXRDb2x1bW5JbmZvcm1hdGlvbih0YWJsZUNsYXNzLCBwcm9wZXJ0eU5hbWUgYXMgc3RyaW5nKS5uYW1lO1xufVxuXG4vLyBmdW5jdGlvbiByZWdpc3RlckVudGl0eSh0YXJnZXQ6IGFueSwgcHJvcGVydHlLZXk6IHN0cmluZyk6IHZvaWQge1xuXG4vLyAgICAgUmVmbGVjdC5tZXRhZGF0YShjb2x1bW5NZXRhZGF0YUtleSwgeyBpc0NvbHVtbjogdHJ1ZSB9KSh0YXJnZXQpO1xuXG4vLyAgICAgY29uc3QgY29sdW1ucyA9IHRhYmxlQ29sdW1ucy5nZXQodGFyZ2V0LmNvbnN0cnVjdG9yKSB8fCBbXTtcblxuLy8gICAgIGxldCBuYW1lID0gcHJvcGVydHlLZXk7XG4vLyAgICAgLy8gY29uc29sZS5sb2coJ25hbWU6ICcsIG5hbWUpO1xuLy8gICAgIGxldCBwcmltYXJ5ID0gZmFsc2U7XG4vLyAgICAgLy8gY29uc29sZS5sb2coJ29wdGlvbnM6ICcsIG9wdGlvbnMpO1xuLy8gICAgIGlmIChvcHRpb25zKSB7XG4vLyAgICAgICAgIGlmIChvcHRpb25zLm5hbWUgIT09IHVuZGVmaW5lZCkge1xuLy8gICAgICAgICAgICAgbmFtZSA9IG9wdGlvbnMubmFtZTtcbi8vICAgICAgICAgfVxuLy8gICAgICAgICBwcmltYXJ5ID0gb3B0aW9ucy5wcmltYXJ5ID09PSB0cnVlO1xuLy8gICAgIH1cblxuLy8gICAgIGNvbHVtbnMucHVzaCh7IG5hbWUsIHByaW1hcnksIHByb3BlcnR5S2V5IH0pO1xuLy8gICAgIHRhYmxlQ29sdW1ucy5zZXQodGFyZ2V0LmNvbnN0cnVjdG9yLCBjb2x1bW5zKTtcbi8vIH1cblxuY29uc3QgY29sdW1uTWV0YWRhdGFLZXkgPSBTeW1ib2woJ2NvbHVtbicpO1xuXG5pbnRlcmZhY2UgSUNvbHVtbk9wdGlvbnMge1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBuYW1lIGluIHRoZSBkYXRhYmFzZS5cbiAgICAgKi9cbiAgICBuYW1lPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogSW5kaWNhdGVzIGlmIHRoaXMgY29sdW1uIGlzIGEgcHJpbWFyeSBrZXkuXG4gICAgICovXG4gICAgcHJpbWFyeT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDb2x1bW4oXG4gICAgb3B0aW9ucz86IElDb2x1bW5PcHRpb25zXG4pOiAodGFyZ2V0OiBvYmplY3QsIHByb3BlcnR5S2V5OiBzdHJpbmcpID0+IHZvaWQge1xuICAgIHJldHVybiBnZXRSZWdpc3RlckNvbHVtbihvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gZ2V0UmVnaXN0ZXJDb2x1bW4ob3B0aW9ucz86IElDb2x1bW5PcHRpb25zKSB7XG4gICAgZnVuY3Rpb24gcmVnaXN0ZXJDb2x1bW4odGFyZ2V0OiBhbnksIHByb3BlcnR5S2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgUmVmbGVjdC5tZXRhZGF0YShjb2x1bW5NZXRhZGF0YUtleSwgeyBpc0NvbHVtbjogdHJ1ZSB9KSh0YXJnZXQpO1xuXG4gICAgICAgIGNvbnN0IGRlc2lnblR5cGUgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFxuICAgICAgICAgICAgJ2Rlc2lnbjp0eXBlJyxcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIHByb3BlcnR5S2V5XG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGlzRm9yZWlnbktleSA9IGRlc2lnblR5cGVcbiAgICAgICAgICAgID8gWydTdHJpbmcnLCAnTnVtYmVyJywgJ0Jvb2xlYW4nXS5pbmNsdWRlcyhkZXNpZ25UeXBlLm5hbWUpID09PVxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIDogZmFsc2U7XG5cbiAgICAgICAgY29uc3QgY29sdW1ucyA9IHRhYmxlQ29sdW1ucy5nZXQodGFyZ2V0LmNvbnN0cnVjdG9yKSB8fCBbXTtcblxuICAgICAgICBsZXQgbmFtZSA9IHByb3BlcnR5S2V5O1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnbmFtZTogJywgbmFtZSk7XG4gICAgICAgIGxldCBwcmltYXJ5ID0gZmFsc2U7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdvcHRpb25zOiAnLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBvcHRpb25zLm5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmltYXJ5ID0gb3B0aW9ucy5wcmltYXJ5ID09PSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29sdW1ucy5wdXNoKHsgbmFtZSwgcHJpbWFyeSwgcHJvcGVydHlLZXksIGlzRm9yZWlnbktleSwgZGVzaWduVHlwZSB9KTtcbiAgICAgICAgdGFibGVDb2x1bW5zLnNldCh0YXJnZXQuY29uc3RydWN0b3IsIGNvbHVtbnMpO1xuICAgIH1cblxuICAgIHJldHVybiByZWdpc3RlckNvbHVtbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbHVtbkluZm9ybWF0aW9uKFxuICAgIHRhcmdldDogRnVuY3Rpb24sXG4gICAgcHJvcGVydHlLZXk6IHN0cmluZ1xuKTogeyBjb2x1bW5DbGFzczogbmV3ICgpID0+IGFueSB9ICYgSUNvbHVtbkRhdGEge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBnZXRDb2x1bW5Qcm9wZXJ0aWVzKHRhcmdldCk7XG5cbiAgICBjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnRpZXMuZmluZChpID0+IGkucHJvcGVydHlLZXkgPT09IHByb3BlcnR5S2V5KTtcbiAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICAgIGNvbnN0IGZrT2JqZWN0ID0gcHJvcGVydGllcy5maW5kKHAgPT4gcC5uYW1lID09PSBwcm9wZXJ0eUtleSk7XG4gICAgICAgIGlmICh0eXBlb2YgZmtPYmplY3Q/LmRlc2lnblR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSXQgc2VlbXMgdGhhdCBjbGFzcyBcIiR7dGFyZ2V0Lm5hbWV9XCIgb25seSBoYXMgYSBmb3JlaWduIGtleSBvYmplY3QgXCIke2ZrT2JqZWN0LnByb3BlcnR5S2V5fVwiLCBidXQgaXMgbWlzc2luZyB0aGUgZm9yZWlnbiBrZXkgcHJvcGVydHkgXCIke3Byb3BlcnR5S2V5fVwiLiBUcnkgYWRkaW5nIFwiQGNvbHVtbigpICR7cHJvcGVydHlLZXl9IDogW2NvcnJlY3QgdHlwZV1cIiB0byBjbGFzcyBcIiR7dGFyZ2V0Lm5hbWV9XCJgKTtcblxuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBDYW5ub3QgZ2V0IGNvbHVtbiBkYXRhLiBEaWQgeW91IHNldCBAQ29sdW1uKCkgYXR0cmlidXRlIG9uICR7dGFyZ2V0Lm5hbWVcbiAgICAgICAgICAgIH0uJHtwcm9wZXJ0eUtleX0/YFxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjb2x1bW5DbGFzczogUmVmbGVjdC5nZXRNZXRhZGF0YShcbiAgICAgICAgICAgICdkZXNpZ246dHlwZScsXG4gICAgICAgICAgICB0YXJnZXQucHJvdG90eXBlLFxuICAgICAgICAgICAgcHJvcGVydHlLZXlcbiAgICAgICAgKSxcbiAgICAgICAgbmFtZTogcHJvcGVydHkubmFtZSxcbiAgICAgICAgcHJpbWFyeTogcHJvcGVydHkucHJpbWFyeSxcbiAgICAgICAgcHJvcGVydHlLZXk6IHByb3BlcnR5LnByb3BlcnR5S2V5LFxuICAgICAgICBkZXNpZ25UeXBlOiBwcm9wZXJ0eS5kZXNpZ25UeXBlLFxuICAgICAgICBpc0ZvcmVpZ25LZXk6IHByb3BlcnR5LmlzRm9yZWlnbktleVxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb2x1bW5Qcm9wZXJ0aWVzKHRhYmxlQ2xhc3M6IEZ1bmN0aW9uKTogSUNvbHVtbkRhdGFbXSB7XG4gICAgY29uc3QgY29sdW1ucyA9IHRhYmxlQ29sdW1ucy5nZXQodGFibGVDbGFzcyk7XG4gICAgaWYgKCFjb2x1bW5zKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBDYW5ub3QgZ2V0IGNvbHVtbiBkYXRhIGZyb20gJHt0YWJsZUNsYXNzLmNvbnN0cnVjdG9yLm5hbWVcbiAgICAgICAgICAgIH0sIGRpZCB5b3Ugc2V0IEBDb2x1bW4oKSBhdHRyaWJ1dGU/YFxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gY29sdW1ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByaW1hcnlLZXlDb2x1bW4odGFibGVDbGFzczogRnVuY3Rpb24pOiBJQ29sdW1uRGF0YSB7XG4gICAgLy8gY29uc29sZS5sb2coJ3RhYmxlQ2xhc3M6ICcsIHRhYmxlQ2xhc3MpO1xuICAgIGNvbnN0IGNvbHVtbnMgPSB0YWJsZUNvbHVtbnMuZ2V0KHRhYmxlQ2xhc3MpO1xuICAgIGlmICghY29sdW1ucykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQ2Fubm90IGdldCBjb2x1bW4gZGF0YSBmcm9tICR7dGFibGVDbGFzcy5jb25zdHJ1Y3Rvci5uYW1lXG4gICAgICAgICAgICB9LCBkaWQgeW91IHNldCBAQ29sdW1uKCkgYXR0cmlidXRlP2BcbiAgICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgcHJpbWFyeUtleUNvbHVtbiA9IGNvbHVtbnMuZmluZChpID0+IGkucHJpbWFyeSk7XG4gICAgaWYgKHByaW1hcnlLZXlDb2x1bW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQ2Fubm90IGdldCBwcmltYXJ5IGtleSBjb2x1bW4gJHt0YWJsZUNsYXNzLmNvbnN0cnVjdG9yLm5hbWVcbiAgICAgICAgICAgIH0sIGRpZCB5b3Ugc2V0IEBDb2x1bW4oe3ByaW1hcnk6dHJ1ZX0pIGF0dHJpYnV0ZT9gXG4gICAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBwcmltYXJ5S2V5Q29sdW1uO1xufVxuIl19