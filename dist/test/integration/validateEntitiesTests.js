"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Knex = require("knex");
const validateEntities_1 = require("../../src/validateEntities");
describe('validateEntitiesTests', () => {
    it('should fail on empty database', async () => {
        const knex = Knex({
            client: 'sqlite3',
            useNullAsDefault: false,
            connection: { filename: ':memory:' },
        });
        try {
            await validateEntities_1.validateEntities(knex);
            chai_1.assert.isFalse(true);
            // tslint:disable-next-line:no-empty
        }
        catch (_error) {
        }
        await knex.destroy();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGVFbnRpdGllc1Rlc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9pbnRlZ3JhdGlvbi92YWxpZGF0ZUVudGl0aWVzVGVzdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBOEI7QUFDOUIsNkJBQTZCO0FBQzdCLGlFQUE4RDtBQUk5RCxRQUFRLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO0lBRW5DLEVBQUUsQ0FBQywrQkFBK0IsRUFBRSxLQUFLLElBQUksRUFBRTtRQUUzQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7WUFDZCxNQUFNLEVBQUUsU0FBUztZQUNqQixnQkFBZ0IsRUFBRSxLQUFLO1lBQ3ZCLFVBQVUsRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUU7U0FDdkMsQ0FBQyxDQUFDO1FBRUgsSUFBSTtZQUVBLE1BQU0sbUNBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsYUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixvQ0FBb0M7U0FDdkM7UUFBQyxPQUFPLE1BQU0sRUFBRTtTQUVoQjtRQUVELE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRXpCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhc3NlcnQgfSBmcm9tICdjaGFpJztcbmltcG9ydCAqIGFzIEtuZXggZnJvbSAna25leCc7XG5pbXBvcnQgeyB2YWxpZGF0ZUVudGl0aWVzIH0gZnJvbSAnLi4vLi4vc3JjL3ZhbGlkYXRlRW50aXRpZXMnO1xuaW1wb3J0IHsgfSBmcm9tICcuLi90ZXN0RW50aXRpZXMnO1xuXG5cbmRlc2NyaWJlKCd2YWxpZGF0ZUVudGl0aWVzVGVzdHMnLCAoKSA9PiB7XG5cbiAgICBpdCgnc2hvdWxkIGZhaWwgb24gZW1wdHkgZGF0YWJhc2UnLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgY29uc3Qga25leCA9IEtuZXgoe1xuICAgICAgICAgICAgY2xpZW50OiAnc3FsaXRlMycsXG4gICAgICAgICAgICB1c2VOdWxsQXNEZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGNvbm5lY3Rpb246IHsgZmlsZW5hbWU6ICc6bWVtb3J5OicgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgYXdhaXQgdmFsaWRhdGVFbnRpdGllcyhrbmV4KTtcbiAgICAgICAgICAgIGFzc2VydC5pc0ZhbHNlKHRydWUpO1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWVtcHR5XG4gICAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuXG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBrbmV4LmRlc3Ryb3koKTtcblxuICAgIH0pO1xufSk7XG4iXX0=