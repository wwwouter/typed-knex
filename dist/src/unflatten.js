"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenByOption = exports.setToNull = exports.unflatten = exports.FlattenOption = void 0;
const flat = require("flat");
var FlattenOption;
(function (FlattenOption) {
    FlattenOption["flatten"] = "flatten";
    /**
     * @deprecated since version 2.8.1, use .keepFlat()
     */
    FlattenOption["noFlatten"] = "noFlatten";
    FlattenOption["flattenAndSetToNull"] = "flattenAndSetToNull";
})(FlattenOption = exports.FlattenOption || (exports.FlattenOption = {}));
function unflatten(o) {
    if (o instanceof Array) {
        return o.map(i => unflatten(i));
    }
    return flat.unflatten(o);
}
exports.unflatten = unflatten;
function areAllPropertiesNull(o) {
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
function setToNull(o) {
    if (o instanceof Array) {
        return o.map(i => setToNull(i));
    }
    else {
        if (o !== null && o !== undefined) {
            const keys = Object.keys(o);
            for (const key of keys) {
                if (typeof o[key] === 'object') {
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
exports.setToNull = setToNull;
function flattenByOption(o, flattenOption) {
    if (flattenOption === FlattenOption.noFlatten) {
        return o;
    }
    const unflattened = unflatten(o);
    if (flattenOption === undefined ||
        flattenOption === FlattenOption.flatten) {
        return unflattened;
    }
    return setToNull(unflattened);
}
exports.flattenByOption = flattenByOption;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5mbGF0dGVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3VuZmxhdHRlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBNkI7QUFFN0IsSUFBWSxhQU9YO0FBUEQsV0FBWSxhQUFhO0lBQ3JCLG9DQUFtQixDQUFBO0lBQ25COztPQUVHO0lBQ0gsd0NBQXVCLENBQUE7SUFDdkIsNERBQTJDLENBQUE7QUFDL0MsQ0FBQyxFQVBXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBT3hCO0FBR0QsU0FBZ0IsU0FBUyxDQUFDLENBQU07SUFDNUIsSUFBSSxDQUFDLFlBQVksS0FBSyxFQUFFO1FBQ3BCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ25DO0lBQ0QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFMRCw4QkFLQztBQUVELFNBQVMsb0JBQW9CLENBQUMsQ0FBTTtJQUNoQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRTtRQUMvQixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUNELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNuQixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUNELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQztJQUNuQixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtRQUNwQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDakIsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNoQixNQUFNO1NBQ1Q7S0FDSjtJQUNELE9BQU8sT0FBTyxDQUFDO0FBQ25CLENBQUM7QUFFRCxTQUFnQixTQUFTLENBQUMsQ0FBTTtJQUM1QixJQUFJLENBQUMsWUFBWSxLQUFLLEVBQUU7UUFDcEIsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbkM7U0FBTTtRQUNILElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQy9CLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7Z0JBQ3BCLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssUUFBUSxFQUFFO29CQUM1QixTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLElBQUksb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7d0JBQzlCLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7cUJBQ2pCO2lCQUNKO2FBQ0o7U0FDSjtLQUNKO0lBQ0QsT0FBTyxDQUFDLENBQUM7QUFDYixDQUFDO0FBakJELDhCQWlCQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxDQUFNLEVBQUUsYUFBNkI7SUFDakUsSUFBSSxhQUFhLEtBQUssYUFBYSxDQUFDLFNBQVMsRUFBRTtRQUMzQyxPQUFPLENBQUMsQ0FBQztLQUNaO0lBQ0QsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLElBQ0ksYUFBYSxLQUFLLFNBQVM7UUFDM0IsYUFBYSxLQUFLLGFBQWEsQ0FBQyxPQUFPLEVBQ3pDO1FBQ0UsT0FBTyxXQUFXLENBQUM7S0FDdEI7SUFDRCxPQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBWkQsMENBWUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmbGF0IGZyb20gJ2ZsYXQnO1xuXG5leHBvcnQgZW51bSBGbGF0dGVuT3B0aW9uIHtcbiAgICBmbGF0dGVuID0gJ2ZsYXR0ZW4nLFxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIHNpbmNlIHZlcnNpb24gMi44LjEsIHVzZSAua2VlcEZsYXQoKVxuICAgICAqL1xuICAgIG5vRmxhdHRlbiA9ICdub0ZsYXR0ZW4nLFxuICAgIGZsYXR0ZW5BbmRTZXRUb051bGwgPSAnZmxhdHRlbkFuZFNldFRvTnVsbCcsXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHVuZmxhdHRlbihvOiBhbnkpOiBhbnkge1xuICAgIGlmIChvIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIG8ubWFwKGkgPT4gdW5mbGF0dGVuKGkpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZsYXQudW5mbGF0dGVuKG8pO1xufVxuXG5mdW5jdGlvbiBhcmVBbGxQcm9wZXJ0aWVzTnVsbChvOiBhbnkpIHtcbiAgICBpZiAobyA9PT0gbnVsbCB8fCBvID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMobyk7XG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbGV0IGFsbE51bGwgPSB0cnVlO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgICAgaWYgKG9ba2V5XSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgYWxsTnVsbCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFsbE51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRUb051bGwobzogYW55KTogYW55IHtcbiAgICBpZiAobyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHJldHVybiBvLm1hcChpID0+IHNldFRvTnVsbChpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG8gIT09IG51bGwgJiYgbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMobyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvW2tleV0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRvTnVsbChvW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJlQWxsUHJvcGVydGllc051bGwob1trZXldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb1trZXldID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW5CeU9wdGlvbihvOiBhbnksIGZsYXR0ZW5PcHRpb24/OiBGbGF0dGVuT3B0aW9uKSB7XG4gICAgaWYgKGZsYXR0ZW5PcHRpb24gPT09IEZsYXR0ZW5PcHRpb24ubm9GbGF0dGVuKSB7XG4gICAgICAgIHJldHVybiBvO1xuICAgIH1cbiAgICBjb25zdCB1bmZsYXR0ZW5lZCA9IHVuZmxhdHRlbihvKTtcbiAgICBpZiAoXG4gICAgICAgIGZsYXR0ZW5PcHRpb24gPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICBmbGF0dGVuT3B0aW9uID09PSBGbGF0dGVuT3B0aW9uLmZsYXR0ZW5cbiAgICApIHtcbiAgICAgICAgcmV0dXJuIHVuZmxhdHRlbmVkO1xuICAgIH1cbiAgICByZXR1cm4gc2V0VG9OdWxsKHVuZmxhdHRlbmVkKTtcbn0iXX0=