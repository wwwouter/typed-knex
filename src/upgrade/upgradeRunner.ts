import { ArrowFunction, CallExpression, Project, PropertyAccessExpression, SyntaxKind } from "ts-morph";
import * as path from 'path';

function changeFirstArgumentFromFunctionToString(callExpression: CallExpression) {
    const args = callExpression.getArguments();

    if (args.length > 0) {
        if (args[0].getKind() === SyntaxKind.ArrowFunction) {
            const firstArgument = args[0] as ArrowFunction;

            if (firstArgument.getBody().getKind() === SyntaxKind.PropertyAccessExpression) {
                const body = firstArgument.getBody() as PropertyAccessExpression;
                const name = body.getName();

                callExpression.removeArgument(0);
                callExpression.insertArgument(0, `'${name}'`);
            }
        }
    }
}

function printProgress(progress: number) {
    // process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write((progress * 100).toFixed(0) + '%');
}


export function upgradeProjectStringParameters(project: Project) {
    const sourceFiles = project.getSourceFiles();

    let fileCounter = 0;

    for (const sourceFile of sourceFiles) {

        printProgress(fileCounter / sourceFiles.length);
        // console.log('sourceFile: ', sourceFile.getFilePath());
        sourceFile.forEachDescendant(node => {
            if (node.getKind() === SyntaxKind.PropertyAccessExpression) {
                const typeString = node.getType().getText();
                if (typeString.includes('IWhereWithOperator<') || typeString.includes('IColumnParameterNoRowTransformation')) {
                    const callExpression = node.getParentIfKind(SyntaxKind.CallExpression);
                    if (callExpression) {
                        changeFirstArgumentFromFunctionToString(callExpression);
                    }
                }
            }
        });

        fileCounter++;
    }
}

export async function runUpgrade(actions: string[], configFilename?: string) {
    let tsConfigFilePath;
    if (!configFilename) {
        tsConfigFilePath = 'tsconfig.json';

    } else {
        tsConfigFilePath = configFilename;
    }

    const tsConfigFileFullPath = path.resolve(tsConfigFilePath);

    console.log(`Loading "${tsConfigFileFullPath}"`);

    const project = new Project({
        tsConfigFilePath: tsConfigFileFullPath,
    });

    if (actions.includes('string-parameters')) {
        console.log('Running "string-parameters"');
        upgradeProjectStringParameters(project);
    }

    await project.save();
}
