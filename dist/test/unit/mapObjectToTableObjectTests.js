"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mapObjectToTableObject_1 = require("../../src/mapObjectToTableObject");
const testEntities_1 = require("../testEntities");
describe('mapObjectToTableObject', () => {
    it('should map object to table object', done => {
        const result = mapObjectToTableObject_1.mapObjectToTableObject(testEntities_1.User, { id: 'id', status: 'status' });
        chai_1.assert.deepEqual(result, { 'id': 'id', 'weirdDatabaseName': 'status' });
        done();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwT2JqZWN0VG9UYWJsZU9iamVjdFRlc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC91bml0L21hcE9iamVjdFRvVGFibGVPYmplY3RUZXN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtCQUE4QjtBQUM5Qiw2RUFBMEU7QUFDMUUsa0RBQXVDO0FBRXZDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7SUFDcEMsRUFBRSxDQUFDLG1DQUFtQyxFQUFFLElBQUksQ0FBQyxFQUFFO1FBRTNDLE1BQU0sTUFBTSxHQUFHLCtDQUFzQixDQUFDLG1CQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRTVFLGFBQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRXhFLElBQUksRUFBRSxDQUFDO0lBRVgsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQgeyBtYXBPYmplY3RUb1RhYmxlT2JqZWN0IH0gZnJvbSAnLi4vLi4vc3JjL21hcE9iamVjdFRvVGFibGVPYmplY3QnO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uL3Rlc3RFbnRpdGllcyc7XG5cbmRlc2NyaWJlKCdtYXBPYmplY3RUb1RhYmxlT2JqZWN0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgbWFwIG9iamVjdCB0byB0YWJsZSBvYmplY3QnLCBkb25lID0+IHtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSBtYXBPYmplY3RUb1RhYmxlT2JqZWN0KFVzZXIsIHsgaWQ6ICdpZCcsIHN0YXR1czogJ3N0YXR1cycgfSk7XG5cbiAgICAgICAgYXNzZXJ0LmRlZXBFcXVhbChyZXN1bHQsIHsgJ2lkJzogJ2lkJywgJ3dlaXJkRGF0YWJhc2VOYW1lJzogJ3N0YXR1cycgfSk7XG5cbiAgICAgICAgZG9uZSgpO1xuXG4gICAgfSk7XG59KTtcbiJdfQ==