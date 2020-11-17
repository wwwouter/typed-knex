"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctTableName = exports.UserSetting = exports.User = exports.UserCategory = exports.Region = void 0;
const decorators_1 = require("../src/decorators");
const ICustomDatabaseType_1 = require("../src/ICustomDatabaseType");
let Region = class Region {
};
__decorate([
    decorators_1.Column({ primary: true }),
    __metadata("design:type", String)
], Region.prototype, "id", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", Number)
], Region.prototype, "code", void 0);
Region = __decorate([
    decorators_1.Table('regions')
], Region);
exports.Region = Region;
let UserCategory = class UserCategory {
};
__decorate([
    decorators_1.Column({ primary: true }),
    __metadata("design:type", String)
], UserCategory.prototype, "id", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], UserCategory.prototype, "name", void 0);
__decorate([
    decorators_1.Column({ name: 'regionId' }),
    __metadata("design:type", Region)
], UserCategory.prototype, "region", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], UserCategory.prototype, "regionId", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", Number)
], UserCategory.prototype, "year", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], UserCategory.prototype, "phoneNumber", void 0);
__decorate([
    decorators_1.Column({ name: 'backupRegionId' }),
    __metadata("design:type", Region)
], UserCategory.prototype, "backupRegion", void 0);
UserCategory = __decorate([
    decorators_1.Table('userCategories')
], UserCategory);
exports.UserCategory = UserCategory;
// tslint:disable-next-line: no-empty-interfaces
class IExtraData extends ICustomDatabaseType_1.ICustomDatabaseType {
}
let User = class User {
};
__decorate([
    decorators_1.Column({ primary: true }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", Number)
], User.prototype, "numericValue", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], User.prototype, "someValue", void 0);
__decorate([
    decorators_1.Column({ name: 'categoryId' }),
    __metadata("design:type", UserCategory)
], User.prototype, "category", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], User.prototype, "categoryId", void 0);
__decorate([
    decorators_1.Column({ name: 'category2Id' }),
    __metadata("design:type", UserCategory)
], User.prototype, "category2", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], User.prototype, "nickName", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", Date)
], User.prototype, "birthDate", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", Object)
], User.prototype, "deathDate", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", Array)
], User.prototype, "tags", void 0);
__decorate([
    decorators_1.Column({ name: 'weirdDatabaseName' }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    decorators_1.Column({ name: 'weirdDatabaseName2' }),
    __metadata("design:type", String)
], User.prototype, "notUndefinedStatus", void 0);
__decorate([
    decorators_1.Column({ name: 'optionalCategoryId' }),
    __metadata("design:type", UserCategory)
], User.prototype, "optionalCategory", void 0);
__decorate([
    decorators_1.Column({ name: 'nullableCategoryId' }),
    __metadata("design:type", Object)
], User.prototype, "nullableCategory", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], User.prototype, "someOptionalValue", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", Object)
], User.prototype, "someNullableValue", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", IExtraData)
], User.prototype, "extraData", void 0);
User = __decorate([
    decorators_1.Table('users')
], User);
exports.User = User;
let UserSetting = class UserSetting {
};
__decorate([
    decorators_1.Column({ primary: true }),
    __metadata("design:type", String)
], UserSetting.prototype, "id", void 0);
__decorate([
    decorators_1.Column({ name: 'userId' }),
    __metadata("design:type", User)
], UserSetting.prototype, "user", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], UserSetting.prototype, "userId", void 0);
__decorate([
    decorators_1.Column({ name: 'user2Id' }),
    __metadata("design:type", User)
], UserSetting.prototype, "user2", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], UserSetting.prototype, "user2Id", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], UserSetting.prototype, "key", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], UserSetting.prototype, "value", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", String)
], UserSetting.prototype, "initialValue", void 0);
UserSetting = __decorate([
    decorators_1.Table('userSettings')
], UserSetting);
exports.UserSetting = UserSetting;
let correctTableName = 
// tslint:disable-next-line: class-name
class correctTableName {
};
__decorate([
    decorators_1.Column({ primary: true }),
    __metadata("design:type", String)
], correctTableName.prototype, "id", void 0);
__decorate([
    decorators_1.Column(),
    __metadata("design:type", Number)
], correctTableName.prototype, "code", void 0);
correctTableName = __decorate([
    decorators_1.Table()
    // tslint:disable-next-line: class-name
], correctTableName);
exports.correctTableName = correctTableName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEVudGl0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC90ZXN0RW50aXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsa0RBQWtEO0FBQ2xELG9FQUFpRTtBQUdqRSxJQUFhLE1BQU0sR0FBbkIsTUFBYSxNQUFNO0NBS2xCLENBQUE7QUFIRztJQURDLG1CQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7O2tDQUNQO0FBRW5CO0lBREMsbUJBQU0sRUFBRTs7b0NBQ1c7QUFKWCxNQUFNO0lBRGxCLGtCQUFLLENBQUMsU0FBUyxDQUFDO0dBQ0osTUFBTSxDQUtsQjtBQUxZLHdCQUFNO0FBUW5CLElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQVk7Q0FleEIsQ0FBQTtBQWJHO0lBREMsbUJBQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQzs7d0NBQ1A7QUFFbkI7SUFEQyxtQkFBTSxFQUFFOzswQ0FDWTtBQUVyQjtJQURDLG1CQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLENBQUM7OEJBQ2IsTUFBTTs0Q0FBQztBQUV2QjtJQURDLG1CQUFNLEVBQUU7OzhDQUNnQjtBQUV6QjtJQURDLG1CQUFNLEVBQUU7OzBDQUNZO0FBRXJCO0lBREMsbUJBQU0sRUFBRTs7aURBQ21CO0FBRTVCO0lBREMsbUJBQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDOzhCQUNiLE1BQU07a0RBQUM7QUFkcEIsWUFBWTtJQUR4QixrQkFBSyxDQUFDLGdCQUFnQixDQUFDO0dBQ1gsWUFBWSxDQWV4QjtBQWZZLG9DQUFZO0FBaUJ6QixnREFBZ0Q7QUFDaEQsTUFBTSxVQUFXLFNBQVEseUNBQW1CO0NBRTNDO0FBR0QsSUFBYSxJQUFJLEdBQWpCLE1BQWEsSUFBSTtDQXFDaEIsQ0FBQTtBQW5DRztJQURDLG1CQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7O2dDQUNQO0FBRW5CO0lBREMsbUJBQU0sRUFBRTs7a0NBQ1k7QUFFckI7SUFEQyxtQkFBTSxFQUFFOzswQ0FDbUI7QUFFNUI7SUFEQyxtQkFBTSxFQUFFOzt1Q0FDaUI7QUFFMUI7SUFEQyxtQkFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDOzhCQUNiLFlBQVk7c0NBQUM7QUFFL0I7SUFEQyxtQkFBTSxFQUFFOzt3Q0FDa0I7QUFFM0I7SUFEQyxtQkFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDOzhCQUNiLFlBQVk7dUNBQUM7QUFFaEM7SUFEQyxtQkFBTSxFQUFFOztzQ0FDZ0I7QUFFekI7SUFEQyxtQkFBTSxFQUFFOzhCQUNTLElBQUk7dUNBQUM7QUFFdkI7SUFEQyxtQkFBTSxFQUFFOzt1Q0FDcUI7QUFFOUI7SUFEQyxtQkFBTSxFQUFFOztrQ0FDYztBQUV2QjtJQURDLG1CQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQzs7b0NBQ2Y7QUFFdkI7SUFEQyxtQkFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLENBQUM7O2dEQUNMO0FBRWxDO0lBREMsbUJBQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBRSxDQUFDOzhCQUNiLFlBQVk7OENBQUM7QUFFdkM7SUFEQyxtQkFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLENBQUM7OzhDQUNNO0FBRTdDO0lBREMsbUJBQU0sRUFBRTs7K0NBQ3lCO0FBRWxDO0lBREMsbUJBQU0sRUFBRTs7K0NBQytCO0FBRXhDO0lBREMsbUJBQU0sRUFBRTs4QkFDVSxVQUFVO3VDQUFDO0FBcENyQixJQUFJO0lBRGhCLGtCQUFLLENBQUMsT0FBTyxDQUFDO0dBQ0YsSUFBSSxDQXFDaEI7QUFyQ1ksb0JBQUk7QUF3Q2pCLElBQWEsV0FBVyxHQUF4QixNQUFhLFdBQVc7Q0FpQnZCLENBQUE7QUFmRztJQURDLG1CQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7O3VDQUNQO0FBRW5CO0lBREMsbUJBQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQzs4QkFDYixJQUFJO3lDQUFDO0FBRW5CO0lBREMsbUJBQU0sRUFBRTs7MkNBQ2M7QUFFdkI7SUFEQyxtQkFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDOzhCQUNiLElBQUk7MENBQUM7QUFFcEI7SUFEQyxtQkFBTSxFQUFFOzs0Q0FDZTtBQUV4QjtJQURDLG1CQUFNLEVBQUU7O3dDQUNXO0FBRXBCO0lBREMsbUJBQU0sRUFBRTs7MENBQ2E7QUFFdEI7SUFEQyxtQkFBTSxFQUFFOztpREFDb0I7QUFoQnBCLFdBQVc7SUFEdkIsa0JBQUssQ0FBQyxjQUFjLENBQUM7R0FDVCxXQUFXLENBaUJ2QjtBQWpCWSxrQ0FBVztBQXNCeEIsSUFBYSxnQkFBZ0I7QUFEN0IsdUNBQXVDO0FBQ3ZDLE1BQWEsZ0JBQWdCO0NBSzVCLENBQUE7QUFIRztJQURDLG1CQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7OzRDQUNQO0FBRW5CO0lBREMsbUJBQU0sRUFBRTs7OENBQ1c7QUFKWCxnQkFBZ0I7SUFGNUIsa0JBQUssRUFBRTtJQUNSLHVDQUF1QztHQUMxQixnQkFBZ0IsQ0FLNUI7QUFMWSw0Q0FBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb2x1bW4sIFRhYmxlIH0gZnJvbSAnLi4vc3JjL2RlY29yYXRvcnMnO1xuaW1wb3J0IHsgSUN1c3RvbURhdGFiYXNlVHlwZSB9IGZyb20gJy4uL3NyYy9JQ3VzdG9tRGF0YWJhc2VUeXBlJztcblxuQFRhYmxlKCdyZWdpb25zJylcbmV4cG9ydCBjbGFzcyBSZWdpb24ge1xuICAgIEBDb2x1bW4oeyBwcmltYXJ5OiB0cnVlIH0pXG4gICAgcHVibGljIGlkITogc3RyaW5nO1xuICAgIEBDb2x1bW4oKVxuICAgIHB1YmxpYyBjb2RlOiBudW1iZXI7XG59XG5cbkBUYWJsZSgndXNlckNhdGVnb3JpZXMnKVxuZXhwb3J0IGNsYXNzIFVzZXJDYXRlZ29yeSB7XG4gICAgQENvbHVtbih7IHByaW1hcnk6IHRydWUgfSlcbiAgICBwdWJsaWMgaWQhOiBzdHJpbmc7XG4gICAgQENvbHVtbigpXG4gICAgcHVibGljIG5hbWUhOiBzdHJpbmc7XG4gICAgQENvbHVtbih7IG5hbWU6ICdyZWdpb25JZCcgfSlcbiAgICBwdWJsaWMgcmVnaW9uITogUmVnaW9uO1xuICAgIEBDb2x1bW4oKVxuICAgIHB1YmxpYyByZWdpb25JZCE6IHN0cmluZztcbiAgICBAQ29sdW1uKClcbiAgICBwdWJsaWMgeWVhciE6IG51bWJlcjtcbiAgICBAQ29sdW1uKClcbiAgICBwdWJsaWMgcGhvbmVOdW1iZXI/OiBzdHJpbmc7XG4gICAgQENvbHVtbih7IG5hbWU6ICdiYWNrdXBSZWdpb25JZCcgfSlcbiAgICBwdWJsaWMgYmFja3VwUmVnaW9uPzogUmVnaW9uO1xufVxuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWVtcHR5LWludGVyZmFjZXNcbmNsYXNzIElFeHRyYURhdGEgZXh0ZW5kcyBJQ3VzdG9tRGF0YWJhc2VUeXBlIHtcblxufVxuXG5AVGFibGUoJ3VzZXJzJylcbmV4cG9ydCBjbGFzcyBVc2VyIHtcbiAgICBAQ29sdW1uKHsgcHJpbWFyeTogdHJ1ZSB9KVxuICAgIHB1YmxpYyBpZCE6IHN0cmluZztcbiAgICBAQ29sdW1uKClcbiAgICBwdWJsaWMgbmFtZSE6IHN0cmluZztcbiAgICBAQ29sdW1uKClcbiAgICBwdWJsaWMgbnVtZXJpY1ZhbHVlOiBudW1iZXI7XG4gICAgQENvbHVtbigpXG4gICAgcHVibGljIHNvbWVWYWx1ZSE6IHN0cmluZztcbiAgICBAQ29sdW1uKHsgbmFtZTogJ2NhdGVnb3J5SWQnIH0pXG4gICAgcHVibGljIGNhdGVnb3J5ITogVXNlckNhdGVnb3J5O1xuICAgIEBDb2x1bW4oKVxuICAgIHB1YmxpYyBjYXRlZ29yeUlkITogc3RyaW5nO1xuICAgIEBDb2x1bW4oeyBuYW1lOiAnY2F0ZWdvcnkySWQnIH0pXG4gICAgcHVibGljIGNhdGVnb3J5MiE6IFVzZXJDYXRlZ29yeTtcbiAgICBAQ29sdW1uKClcbiAgICBwdWJsaWMgbmlja05hbWU/OiBzdHJpbmc7XG4gICAgQENvbHVtbigpXG4gICAgcHVibGljIGJpcnRoRGF0ZTogRGF0ZTtcbiAgICBAQ29sdW1uKClcbiAgICBwdWJsaWMgZGVhdGhEYXRlOiBEYXRlIHwgbnVsbDtcbiAgICBAQ29sdW1uKClcbiAgICBwdWJsaWMgdGFncz86IHN0cmluZ1tdO1xuICAgIEBDb2x1bW4oeyBuYW1lOiAnd2VpcmREYXRhYmFzZU5hbWUnIH0pXG4gICAgcHVibGljIHN0YXR1cz86IHN0cmluZztcbiAgICBAQ29sdW1uKHsgbmFtZTogJ3dlaXJkRGF0YWJhc2VOYW1lMicgfSlcbiAgICBwdWJsaWMgbm90VW5kZWZpbmVkU3RhdHVzOiBzdHJpbmc7XG4gICAgQENvbHVtbih7IG5hbWU6ICdvcHRpb25hbENhdGVnb3J5SWQnIH0pXG4gICAgcHVibGljIG9wdGlvbmFsQ2F0ZWdvcnk/OiBVc2VyQ2F0ZWdvcnk7XG4gICAgQENvbHVtbih7IG5hbWU6ICdudWxsYWJsZUNhdGVnb3J5SWQnIH0pXG4gICAgcHVibGljIG51bGxhYmxlQ2F0ZWdvcnk6IFVzZXJDYXRlZ29yeSB8IG51bGw7XG4gICAgQENvbHVtbigpXG4gICAgcHVibGljIHNvbWVPcHRpb25hbFZhbHVlPzogc3RyaW5nO1xuICAgIEBDb2x1bW4oKVxuICAgIHB1YmxpYyBzb21lTnVsbGFibGVWYWx1ZTogc3RyaW5nIHwgbnVsbDtcbiAgICBAQ29sdW1uKClcbiAgICBwdWJsaWMgZXh0cmFEYXRhITogSUV4dHJhRGF0YTtcbn1cblxuQFRhYmxlKCd1c2VyU2V0dGluZ3MnKVxuZXhwb3J0IGNsYXNzIFVzZXJTZXR0aW5nIHtcbiAgICBAQ29sdW1uKHsgcHJpbWFyeTogdHJ1ZSB9KVxuICAgIHB1YmxpYyBpZCE6IHN0cmluZztcbiAgICBAQ29sdW1uKHsgbmFtZTogJ3VzZXJJZCcgfSlcbiAgICBwdWJsaWMgdXNlciE6IFVzZXI7XG4gICAgQENvbHVtbigpXG4gICAgcHVibGljIHVzZXJJZCE6IHN0cmluZztcbiAgICBAQ29sdW1uKHsgbmFtZTogJ3VzZXIySWQnIH0pXG4gICAgcHVibGljIHVzZXIyITogVXNlcjtcbiAgICBAQ29sdW1uKClcbiAgICBwdWJsaWMgdXNlcjJJZCE6IHN0cmluZztcbiAgICBAQ29sdW1uKClcbiAgICBwdWJsaWMga2V5ITogc3RyaW5nO1xuICAgIEBDb2x1bW4oKVxuICAgIHB1YmxpYyB2YWx1ZSE6IHN0cmluZztcbiAgICBAQ29sdW1uKClcbiAgICBwdWJsaWMgaW5pdGlhbFZhbHVlITogc3RyaW5nO1xufVxuXG5cbkBUYWJsZSgpXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IGNsYXNzLW5hbWVcbmV4cG9ydCBjbGFzcyBjb3JyZWN0VGFibGVOYW1lIHtcbiAgICBAQ29sdW1uKHsgcHJpbWFyeTogdHJ1ZSB9KVxuICAgIHB1YmxpYyBpZCE6IHN0cmluZztcbiAgICBAQ29sdW1uKClcbiAgICBwdWJsaWMgY29kZTogbnVtYmVyO1xufVxuIl19