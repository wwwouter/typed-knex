import * as path from 'path';
import { ArrayLiteralExpression, ArrowFunction, CallExpression, Project, PropertyAccessExpression, SyntaxKind } from "ts-morph";

function changeFirstArgumentFromFunctionToString(callExpression: CallExpression) {
    const args = callExpression.getArguments();

    if (args.length > 0) {
        if (args[0].getKind() === SyntaxKind.ArrowFunction) {
            const firstArgument = args[0] as ArrowFunction;

            if (firstArgument.getBody().getKind() === SyntaxKind.PropertyAccessExpression) {
                const body = firstArgument.getBody() as PropertyAccessExpression;
                const indexOfFirstPeriod = body.getText().indexOf('.');

                const name = body.getText().substring(indexOfFirstPeriod + 1);

                callExpression.removeArgument(0);
                callExpression.insertArgument(0, `'${name}'`);
            } else if (firstArgument.getBody().getKind() === SyntaxKind.ArrayLiteralExpression) {
                const body = firstArgument.getBody() as ArrayLiteralExpression;
                const parameters: string[] = [];

                const propertyAccessExpressions = body.getChildren()[1].getChildrenOfKind(SyntaxKind.PropertyAccessExpression);
                for (const propertyAccessExpression of propertyAccessExpressions) {
                    const indexOfFirstPeriod = propertyAccessExpression.getText().indexOf('.');

                    const name = propertyAccessExpression.getText().substring(indexOfFirstPeriod + 1);

                    parameters.push(`'${name}'`);
                }

                callExpression.removeArgument(0);
                callExpression.insertArgument(0, parameters.join());
            }
        }
    }
}

function printProgress(progress: number) {
    process.stdout.cursorTo(0);
    process.stdout.write((progress * 100).toFixed(0) + '%');
}


export function upgradeProjectStringParameters(project: Project) {
    const sourceFiles = project.getSourceFiles();

    let fileCounter = 0;

    for (const sourceFile of sourceFiles) {

        printProgress(fileCounter / sourceFiles.length);
        sourceFile.forEachDescendant(node => {
            if (node.getKind() === SyntaxKind.PropertyAccessExpression) {
                const typeString = node.getType().getText();
                if (
                    typeString.includes('ISelectWithFunctionColumns3<') ||
                    typeString.includes('IWhereWithOperator<') ||
                    typeString.includes('IColumnParameterNoRowTransformation')) {
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
