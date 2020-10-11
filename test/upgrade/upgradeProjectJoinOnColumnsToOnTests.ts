import { assert } from 'chai';
import { Project } from 'ts-morph';
import { upgradeProjectJoinOnColumnsToOn } from '../../src/upgrade/upgradeRunner';

describe('upgradeProjectJoinOnColumnsToOn', function() {
    this.timeout(1000000);
    it('should upgrade where', async () => {


        const project = new Project({
            tsConfigFilePath: './upgradeTestProjects/v2-v3-stringParameters/tsconfig.json',
        });


        const code = `
            import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.onColumns(i => i.name, 'op', i => i.other.id);
        `;


        const sourceFile = project.createSourceFile('./upgradeTestProjects/v2-v3-stringParameters/src/test.ts', code);

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        upgradeProjectJoinOnColumnsToOn(project);

        assert.equal(sourceFile.getText(), `import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.on(i => i.other.id, 'op', i => i.name);
        `)


    });
});