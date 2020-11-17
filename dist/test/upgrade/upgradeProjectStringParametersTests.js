"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ts_morph_1 = require("ts-morph");
const upgradeRunner_1 = require("../../src/upgrade/upgradeRunner");
describe('upgradeProjectStringParameters', function () {
    this.timeout(1000000);
    it('should upgrade where', async () => {
        const project = new ts_morph_1.Project({
            tsConfigFilePath: './upgradeTestProjects/v2-v3-stringParameters/tsconfig.json',
        });
        const code = `
            import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.where(i => i.name, 'this name1');
            a.where(i => i.other.id, 'id1');
        `;
        const sourceFile = project.createSourceFile('./upgradeTestProjects/v2-v3-stringParameters/src/test.ts', code);
        chai_1.assert.equal(project.getPreEmitDiagnostics().length, 0);
        upgradeRunner_1.upgradeProjectStringParameters(project);
        chai_1.assert.equal(sourceFile.getText(), `import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.where('name', 'this name1');
            a.where('other.id', 'id1');
        `);
    });
    it('should upgrade select single column', async () => {
        const project = new ts_morph_1.Project({
            tsConfigFilePath: './upgradeTestProjects/v2-v3-stringParameters/tsconfig.json',
        });
        const code = `
            import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.select(i => i.name);
        `;
        const sourceFile = project.createSourceFile('./upgradeTestProjects/v2-v3-stringParameters/src/test.ts', code);
        chai_1.assert.equal(project.getPreEmitDiagnostics().length, 0);
        upgradeRunner_1.upgradeProjectStringParameters(project);
        chai_1.assert.equal(sourceFile.getText(), `import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.select('name');
        `);
    });
    it('should upgrade select column array', async () => {
        const project = new ts_morph_1.Project({
            tsConfigFilePath: './upgradeTestProjects/v2-v3-stringParameters/tsconfig.json',
        });
        const code = `
            import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.select(i => [i.name, i.other.id]);
        `;
        const sourceFile = project.createSourceFile('./upgradeTestProjects/v2-v3-stringParameters/src/test.ts', code);
        chai_1.assert.equal(project.getPreEmitDiagnostics().length, 0);
        upgradeRunner_1.upgradeProjectStringParameters(project);
        chai_1.assert.equal(sourceFile.getText(), `import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.select('name','other.id');
        `);
    });
    it('should upgrade both column parameters', async () => {
        const project = new ts_morph_1.Project({
            tsConfigFilePath: './upgradeTestProjects/v2-v3-stringParameters/tsconfig.json',
        });
        const code = `
            import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.joinOn(i => i.name, 'op', i => i.other.id);
        `;
        const sourceFile = project.createSourceFile('./upgradeTestProjects/v2-v3-stringParameters/src/test.ts', code);
        chai_1.assert.equal(project.getPreEmitDiagnostics().length, 0);
        upgradeRunner_1.upgradeProjectStringParameters(project);
        chai_1.assert.equal(sourceFile.getText(), `import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.joinOn('name', 'op', 'other.id');
        `);
    });
    it('should upgrade whereColumn', async () => {
        const project = new ts_morph_1.Project({
            tsConfigFilePath: './upgradeTestProjects/v2-v3-stringParameters/tsconfig.json',
        });
        const code = `
            import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            const parent = {id:1};
            a.whereColumn(i => i.name, '=', parent.id);
        `;
        const sourceFile = project.createSourceFile('./upgradeTestProjects/v2-v3-stringParameters/src/test.ts', code);
        chai_1.assert.equal(project.getPreEmitDiagnostics().length, 0);
        upgradeRunner_1.upgradeProjectStringParameters(project);
        chai_1.assert.equal(sourceFile.getText(), `import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            const parent = {id:1};
            a.whereColumn('name', '=', 'id');
        `);
    });
    it('should upgrade whereExists', async () => {
        const project = new ts_morph_1.Project({
            tsConfigFilePath: './upgradeTestProjects/v2-v3-stringParameters/tsconfig.json',
        });
        const code = `
            import { ITypedQueryBuilder } from './typedKnexTypes';

            class TableClass {}
            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.whereExists(TableClass, (subQuery, _parent) => subQuery.select(i => i.id));
        `;
        const sourceFile = project.createSourceFile('./upgradeTestProjects/v2-v3-stringParameters/src/test.ts', code);
        chai_1.assert.equal(project.getPreEmitDiagnostics().length, 0);
        upgradeRunner_1.upgradeProjectStringParameters(project);
        chai_1.assert.equal(sourceFile.getText(), `import { ITypedQueryBuilder } from './typedKnexTypes';

            class TableClass {}
            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.whereExists(TableClass, (subQuery) => subQuery.select('id'));
        `);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZVByb2plY3RTdHJpbmdQYXJhbWV0ZXJzVGVzdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L3VwZ3JhZGUvdXBncmFkZVByb2plY3RTdHJpbmdQYXJhbWV0ZXJzVGVzdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBOEI7QUFDOUIsdUNBQW1DO0FBQ25DLG1FQUFpRjtBQUVqRixRQUFRLENBQUMsZ0NBQWdDLEVBQUU7SUFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0QixFQUFFLENBQUMsc0JBQXNCLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFHbEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBTyxDQUFDO1lBQ3hCLGdCQUFnQixFQUFFLDREQUE0RDtTQUNqRixDQUFDLENBQUM7UUFHSCxNQUFNLElBQUksR0FBRzs7Ozs7O1NBTVosQ0FBQztRQUdGLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQywwREFBMEQsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU5RyxhQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV4RCw4Q0FBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV4QyxhQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRTs7Ozs7U0FLbEMsQ0FBQyxDQUFBO0lBR04sQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMscUNBQXFDLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFHakQsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBTyxDQUFDO1lBQ3hCLGdCQUFnQixFQUFFLDREQUE0RDtTQUNqRixDQUFDLENBQUM7UUFHSCxNQUFNLElBQUksR0FBRzs7Ozs7U0FLWixDQUFDO1FBR0YsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGdCQUFn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LENBQUMsQ0FBQztRQUV4RCw4Q0FBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV4QyxhQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRTs7Ozs7U0FLbEMsQ0FBQyxDQUFBO0lBQ04sQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFzc2VydCB9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHsgUHJvamVjdCB9IGZyb20gJ3RzLW1vcnBoJztcbmltcG9ydCB7IHVwZ3JhZGVQcm9qZWN0U3RyaW5nUGFyYW1ldGVycyB9IGZyb20gJy4uLy4uL3NyYy91cGdyYWRlL3VwZ3JhZGVSdW5uZXInO1xuXG5kZXNjcmliZSgndXBncmFkZVByb2plY3RTdHJpbmdQYXJhbWV0ZXJzJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50aW1lb3V0KDEwMDAwMDApO1xuICAgIGl0KCdzaG91bGQgdXBncmFkZSB3aGVyZScsIGFzeW5jICgpID0+IHtcblxuXG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBuZXcgUHJvamVjdCh7XG4gICAgICAgICAgICB0c0NvbmZpZ0ZpbGVQYXRoOiAnLi91cGdyYWRlVGVzdFByb2plY3RzL3YyLXYzLXN0cmluZ1BhcmFtZXRlcnMvdHNjb25maWcuanNvbicsXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgY29uc3QgY29kZSA9IGBcbiAgICAgICAgICAgIGltcG9ydCB7IElUeXBlZFF1ZXJ5QnVpbGRlciB9IGZyb20gJy4vdHlwZWRLbmV4VHlwZXMnO1xuXG4gICAgICAgICAgICBjb25zdCBhID0ge30gYXMgSVR5cGVkUXVlcnlCdWlsZGVyPHt9LCB7fSwge30+O1xuICAgICAgICAgICAgYS53aGVyZShpID0+IGkubmFtZSwgJ3RoaXMgbmFtZTEnKTtcbiAgICAgICAgICAgIGEud2hlcmUoaSA9PiBpLm90aGVyLmlkLCAnaWQxJyk7XG4gICAgICAgIGA7XG5cblxuICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gcHJvamVjdC5jcmVhdGVTb3VyY2VGaWxlKCcuL3VwZ3JhZGVUZXN0UHJvamVjdHMvdjItdjMtc3RyaW5nUGFyYW1ldGVycy9zcmMvdGVzdC50cycsIGNvZGUpO1xuXG4gICAgICAgIGFzc2VydC5lcXVhbChwcm9qZWN0LmdldFByZUVtaXREaWFnbm9zdGljcygpLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgdXBncmFkZVByb2plY3RTdHJpbmdQYXJhbWV0ZXJzKHByb2plY3QpO1xuXG4gICAgICAgIGFzc2VydC5lcXVhbChzb3VyY2VGaWxlLmdldFRleHQoKSwgYGltcG9ydCB7IElUeXBlZFF1ZXJ5QnVpbGRlciB9IGZyb20gJy4vdHlwZWRLbmV4VHlwZXMnO1xuXG4gICAgICAgICAgICBjb25zdCBhID0ge30gYXMgSVR5cGVkUXVlcnlCdWlsZGVyPHt9LCB7fSwge30+O1xuICAgICAgICAgICAgYS53aGVyZSgnbmFtZScsICd0aGlzIG5hbWUxJyk7XG4gICAgICAgICAgICBhLndoZXJlKCdvdGhlci5pZCcsICdpZDEnKTtcbiAgICAgICAgYClcblxuXG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHVwZ3JhZGUgc2VsZWN0IHNpbmdsZSBjb2x1bW4nLCBhc3luYyAoKSA9PiB7XG5cblxuICAgICAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFByb2plY3Qoe1xuICAgICAgICAgICAgdHNDb25maWdGaWxlUGF0aDogJy4vdXBncmFkZVRlc3RQcm9qZWN0cy92Mi12My1zdHJpbmdQYXJhbWV0ZXJzL3RzY29uZmlnLmpzb24nLFxuICAgICAgICB9KTtcblxuXG4gICAgICAgIGNvbnN0IGNvZGUgPSBgXG4gICAgICAgICAgICBpbXBvcnQgeyBJVHlwZWRRdWVyeUJ1aWxkZXIgfSBmcm9tICcuL3R5cGVkS25leFR5cGVzJztcblxuICAgICAgICAgICAgY29uc3QgYSA9IHt9IGFzIElUeXBlZFF1ZXJ5QnVpbGRlcjx7fSwge30sIHt9PjtcbiAgICAgICAgICAgIGEuc2VsZWN0KGkgPT4gaS5uYW1lKTtcbiAgICAgICAgYDtcblxuXG4gICAgICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBwcm9qZWN0LmNyZWF0ZVNvdXJjZUZpbGUoJy4vdXBncmFkZVRlc3RQcm9qZWN0cy92Mi12My1zdHJpbmdQYXJhbWV0ZXJzL3NyYy90ZXN0LnRzJywgY29kZSk7XG5cbiAgICAgICAgYXNzZXJ0LmVxdWFsKHByb2plY3QuZ2V0UHJlRW1pdERpYWdub3N0aWNzKCkubGVuZ3RoLCAwKTtcblxuICAgICAgICB1cGdyYWRlUHJvamVjdFN0cmluZ1BhcmFtZXRlcnMocHJvamVjdCk7XG5cbiAgICAgICAgYXNzZXJ0LmVxdWFsKHNvdXJjZUZpbGUuZ2V0VGV4dCgpLCBgaW1wb3J0IHsgSVR5cGVkUXVlcnlCdWlsZGVyIH0gZnJvbSAnLi90eXBlZEtuZXhUeXBlcyc7XG5cbiAgICAgICAgICAgIGNvbnN0IGEgPSB7fSBhcyBJVHlwZWRRdWVyeUJ1aWxkZXI8e30sIHt9LCB7fT47XG4gICAgICAgICAgICBhLnNlbGVjdCgnbmFtZScpO1xuICAgICAgICBgKVxuXG5cbiAgICB9KTtcblxuXG4gICAgaXQoJ3Nob3VsZCB1cGdyYWRlIHNlbGVjdCBjb2x1bW4gYXJyYXknLCBhc3luYyAoKSA9PiB7XG5cblxuICAgICAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFByb2plY3Qoe1xuICAgICAgICAgICAgdHNDb25maWdGaWxlUGF0aDogJy4vdXBncmFkZVRlc3RQcm9qZWN0cy92Mi12My1zdHJpbmdQYXJhbWV0ZXJzL3RzY29uZmlnLmpzb24nLFxuICAgICAgICB9KTtcblxuXG4gICAgICAgIGNvbnN0IGNvZGUgPSBgXG4gICAgICAgICAgICBpbXBvcnQgeyBJVHlwZWRRdWVyeUJ1aWxkZXIgfSBmcm9tICcuL3R5cGVkS25leFR5cGVzJztcblxuICAgICAgICAgICAgY29uc3QgYSA9IHt9IGFzIElUeXBlZFF1ZXJ5QnVpbGRlcjx7fSwge30sIHt9PjtcbiAgICAgICAgICAgIGEuc2VsZWN0KGkgPT4gW2kubmFtZSwgaS5vdGhlci5pZF0pO1xuICAgICAgICBgO1xuXG5cbiAgICAgICAgY29uc3Qgc291cmNlRmlsZSA9IHByb2plY3QuY3JlYXRlU291cmNlRmlsZSgnLi91cGdyYWRlVGVzdFByb2plY3RzL3YyLXYzLXN0cmluZ1BhcmFtZXRlcnMvc3JjL3Rlc3QudHMnLCBjb2RlKTtcblxuICAgICAgICBhc3NlcnQuZXF1YWwocHJvamVjdC5nZXRQcmVFbWl0RGlhZ25vc3RpY3MoKS5sZW5ndGgsIDApO1xuXG4gICAgICAgIHVwZ3JhZGVQcm9qZWN0U3RyaW5nUGFyYW1ldGVycyhwcm9qZWN0KTtcblxuICAgICAgICBhc3NlcnQuZXF1YWwoc291cmNlRmlsZS5nZXRUZXh0KCksIGBpbXBvcnQgeyBJVHlwZWRRdWVyeUJ1aWxkZXIgfSBmcm9tICcuL3R5cGVkS25leFR5cGVzJztcblxuICAgICAgICAgICAgY29uc3QgYSA9IHt9IGFzIElUeXBlZFF1ZXJ5QnVpbGRlcjx7fSwge30sIHt9PjtcbiAgICAgICAgICAgIGEuc2VsZWN0KCduYW1lJywnb3RoZXIuaWQnKTtcbiAgICAgICAgYClcblxuXG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHVwZ3JhZGUgYm90aCBjb2x1bW4gcGFyYW1ldGVycycsIGFzeW5jICgpID0+IHtcblxuXG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBuZXcgUHJvamVjdCh7XG4gICAgICAgICAgICB0c0NvbmZpZ0ZpbGVQYXRoOiAnLi91cGdyYWRlVGVzdFByb2plY3RzL3YyLXYzLXN0cmluZ1BhcmFtZXRlcnMvdHNjb25maWcuanNvbicsXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgY29uc3QgY29kZSA9IGBcbiAgICAgICAgICAgIGltcG9ydCB7IElUeXBlZFF1ZXJ5QnVpbGRlciB9IGZyb20gJy4vdHlwZWRLbmV4VHlwZXMnO1xuXG4gICAgICAgICAgICBjb25zdCBhID0ge30gYXMgSVR5cGVkUXVlcnlCdWlsZGVyPHt9LCB7fSwge30+O1xuICAgICAgICAgICAgYS5qb2luT24oaSA9PiBpLm5hbWUsICdvcCcsIGkgPT4gaS5vdGhlci5pZCk7XG4gICAgICAgIGA7XG5cblxuICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gcHJvamVjdC5jcmVhdGVTb3VyY2VGaWxlKCcuL3VwZ3JhZGVUZXN0UHJvamVjdHMvdjItdjMtc3RyaW5nUGFyYW1ldGVycy9zcmMvdGVzdC50cycsIGNvZGUpO1xuXG4gICAgICAgIGFzc2VydC5lcXVhbChwcm9qZWN0LmdldFByZUVtaXREaWFnbm9zdGljcygpLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgdXBncmFkZVByb2plY3RTdHJpbmdQYXJhbWV0ZXJzKHByb2plY3QpO1xuXG4gICAgICAgIGFzc2VydC5lcXVhbChzb3VyY2VGaWxlLmdldFRleHQoKSwgYGltcG9ydCB7IElUeXBlZFF1ZXJ5QnVpbGRlciB9IGZyb20gJy4vdHlwZWRLbmV4VHlwZXMnO1xuXG4gICAgICAgICAgICBjb25zdCBhID0ge30gYXMgSVR5cGVkUXVlcnlCdWlsZGVyPHt9LCB7fSwge30+O1xuICAgICAgICAgICAgYS5qb2luT24oJ25hbWUnLCAnb3AnLCAnb3RoZXIuaWQnKTtcbiAgICAgICAgYClcblxuXG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgdXBncmFkZSB3aGVyZUNvbHVtbicsIGFzeW5jICgpID0+IHtcblxuXG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBuZXcgUHJvamVjdCh7XG4gICAgICAgICAgICB0c0NvbmZpZ0ZpbGVQYXRoOiAnLi91cGdyYWRlVGVzdFByb2plY3RzL3YyLXYzLXN0cmluZ1BhcmFtZXRlcnMvdHNjb25maWcuanNvbicsXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgY29uc3QgY29kZSA9IGBcbiAgICAgICAgICAgIGltcG9ydCB7IElUeXBlZFF1ZXJ5QnVpbGRlciB9IGZyb20gJy4vdHlwZWRLbmV4VHlwZXMnO1xuXG4gICAgICAgICAgICBjb25zdCBhID0ge30gYXMgSVR5cGVkUXVlcnlCdWlsZGVyPHt9LCB7fSwge30+O1xuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0ge2lkOjF9O1xuICAgICAgICAgICAgYS53aGVyZUNvbHVtbihpID0+IGkubmFtZSwgJz0nLCBwYXJlbnQuaWQpO1xuICAgICAgICBgO1xuXG5cbiAgICAgICAgY29uc3Qgc291cmNlRmlsZSA9IHByb2plY3QuY3JlYXRlU291cmNlRmlsZSgnLi91cGdyYWRlVGVzdFByb2plY3RzL3YyLXYzLXN0cmluZ1BhcmFtZXRlcnMvc3JjL3Rlc3QudHMnLCBjb2RlKTtcblxuICAgICAgICBhc3NlcnQuZXF1YWwocHJvamVjdC5nZXRQcmVFbWl0RGlhZ25vc3RpY3MoKS5sZW5ndGgsIDApO1xuXG4gICAgICAgIHVwZ3JhZGVQcm9qZWN0U3RyaW5nUGFyYW1ldGVycyhwcm9qZWN0KTtcblxuICAgICAgICBhc3NlcnQuZXF1YWwoc291cmNlRmlsZS5nZXRUZXh0KCksIGBpbXBvcnQgeyBJVHlwZWRRdWVyeUJ1aWxkZXIgfSBmcm9tICcuL3R5cGVkS25leFR5cGVzJztcblxuICAgICAgICAgICAgY29uc3QgYSA9IHt9IGFzIElUeXBlZFF1ZXJ5QnVpbGRlcjx7fSwge30sIHt9PjtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHtpZDoxfTtcbiAgICAgICAgICAgIGEud2hlcmVDb2x1bW4oJ25hbWUnLCAnPScsICdpZCcpO1xuICAgICAgICBgKVxuXG5cbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgdXBncmFkZSB3aGVyZUV4aXN0cycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHtcbiAgICAgICAgICAgIHRzQ29uZmlnRmlsZVBhdGg6ICcuL3VwZ3JhZGVUZXN0UHJvamVjdHMvdjItdjMtc3RyaW5nUGFyYW1ldGVycy90c2NvbmZpZy5qc29uJyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY29kZSA9IGBcbiAgICAgICAgICAgIGltcG9ydCB7IElUeXBlZFF1ZXJ5QnVpbGRlciB9IGZyb20gJy4vdHlwZWRLbmV4VHlwZXMnO1xuXG4gICAgICAgICAgICBjbGFzcyBUYWJsZUNsYXNzIHt9XG4gICAgICAgICAgICBjb25zdCBhID0ge30gYXMgSVR5cGVkUXVlcnlCdWlsZGVyPHt9LCB7fSwge30+O1xuICAgICAgICAgICAgYS53aGVyZUV4aXN0cyhUYWJsZUNsYXNzLCAoc3ViUXVlcnksIF9wYXJlbnQpID0+IHN1YlF1ZXJ5LnNlbGVjdChpID0+IGkuaWQpKTtcbiAgICAgICAgYDtcblxuICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gcHJvamVjdC5jcmVhdGVTb3VyY2VGaWxlKCcuL3VwZ3JhZGVUZXN0UHJvamVjdHMvdjItdjMtc3RyaW5nUGFyYW1ldGVycy9zcmMvdGVzdC50cycsIGNvZGUpO1xuXG4gICAgICAgIGFzc2VydC5lcXVhbChwcm9qZWN0LmdldFByZUVtaXREaWFnbm9zdGljcygpLmxlbmd0aCwgMCk7XG5cbiAgICAgICAgdXBncmFkZVByb2plY3RTdHJpbmdQYXJhbWV0ZXJzKHByb2plY3QpO1xuXG4gICAgICAgIGFzc2VydC5lcXVhbChzb3VyY2VGaWxlLmdldFRleHQoKSwgYGltcG9ydCB7IElUeXBlZFF1ZXJ5QnVpbGRlciB9IGZyb20gJy4vdHlwZWRLbmV4VHlwZXMnO1xuXG4gICAgICAgICAgICBjbGFzcyBUYWJsZUNsYXNzIHt9XG4gICAgICAgICAgICBjb25zdCBhID0ge30gYXMgSVR5cGVkUXVlcnlCdWlsZGVyPHt9LCB7fSwge30+O1xuICAgICAgICAgICAgYS53aGVyZUV4aXN0cyhUYWJsZUNsYXNzLCAoc3ViUXVlcnkpID0+IHN1YlF1ZXJ5LnNlbGVjdCgnaWQnKSk7XG4gICAgICAgIGApXG4gICAgfSk7XG59KTtcbiJdfQ==