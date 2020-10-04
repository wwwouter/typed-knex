import { assert } from 'chai';
import { Project } from 'ts-morph';
import { upgradeProjectStringParameters } from '../../src/upgrade/upgradeRunner';

describe('upgradeProjectStringParameters', function() {
    this.timeout(1000000);
    it('should upgrade where', async () => {


        const project = new Project({
            tsConfigFilePath: './upgradeTestProjects/v2-v3-stringParameters/tsconfig.json',
        });


        const code = `
            import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.where(i => i.name, 'this name1');
        `;


        const sourceFile = project.createSourceFile('./upgradeTestProjects/v2-v3-stringParameters/src/test.ts', code);

        assert.equal(project.getPreEmitDiagnostics().length, 0);

        upgradeProjectStringParameters(project);

        assert.equal(sourceFile.getText(), `import { ITypedQueryBuilder } from './typedKnexTypes';

            const a = {} as ITypedQueryBuilder<{}, {}, {}>;
            a.where('name', 'this name1');
        `)


    });
});
