import * as path from 'path';
import { ArrayLiteralExpression, ArrowFunction, CallExpression, Project, PropertyAccessExpression, SyntaxKind } from "ts-morph";

function changeArgumentsFromFunctionToString(callExpression: CallExpression) {
    const args = callExpression.getArguments();

    if (args[0]?.getKind() === SyntaxKind.ArrowFunction) {
        changeArgumentFromFunctionToString(args[0] as ArrowFunction, callExpression, 0);
    }

    if (args[1]?.getKind() === SyntaxKind.ArrowFunction) {
        changeArgumentFromFunctionToString(args[1] as ArrowFunction, callExpression, 1);
    }

    if (args[2]?.getKind() === SyntaxKind.ArrowFunction) {
        changeArgumentFromFunctionToString(args[2] as ArrowFunction, callExpression, 2);
    }
}

function changeArgumentFromFunctionToString(argumentToReplace: ArrowFunction, callExpression: CallExpression, argumentIndex: number) {
    if (argumentToReplace.getBody().getKind() === SyntaxKind.PropertyAccessExpression) {
        const body = argumentToReplace.getBody() as PropertyAccessExpression;
        const indexOfFirstPeriod = body.getText().indexOf('.');

        const name = body.getText().substring(indexOfFirstPeriod + 1);

        callExpression.removeArgument(argumentIndex);
        callExpression.insertArgument(argumentIndex, `'${name}'`);
    } else if (argumentToReplace.getBody().getKind() === SyntaxKind.ArrayLiteralExpression) {
        const body = argumentToReplace.getBody() as ArrayLiteralExpression;
        const parameters: string[] = [];

        const propertyAccessExpressions = body.getChildren()[1].getChildrenOfKind(SyntaxKind.PropertyAccessExpression);
        for (const propertyAccessExpression of propertyAccessExpressions) {
            const indexOfFirstPeriod = propertyAccessExpression.getText().indexOf('.');

            const name = propertyAccessExpression.getText().substring(indexOfFirstPeriod + 1);

            parameters.push(`'${name}'`);
        }

        callExpression.removeArgument(argumentIndex);
        callExpression.insertArgument(argumentIndex, parameters.join());
    }
}

function changeArgumentFromObjectToString(argumentToReplace: PropertyAccessExpression, callExpression: CallExpression, argumentIndex: number) {
    const indexOfFirstPeriod = argumentToReplace.getText().indexOf('.');
    const name = argumentToReplace.getText().substring(indexOfFirstPeriod + 1);
    callExpression.removeArgument(argumentIndex);
    callExpression.insertArgument(argumentIndex, `'${name}'`);
}


function changeIWhereCompareTwoColumns(callExpression: CallExpression) {
    const args = callExpression.getArguments();
    if (args[0].getKind() === SyntaxKind.ArrowFunction && args[2].getKind() === SyntaxKind.PropertyAccessExpression) {
        changeArgumentFromFunctionToString(args[0] as ArrowFunction, callExpression, 0);
        changeArgumentFromObjectToString(args[2] as PropertyAccessExpression, callExpression, 2);
    }
}

function changeIWhereExists(callExpression: CallExpression) {
    const args = callExpression.getArguments();
    const subqueryFunction = args[1] as ArrowFunction;
    const parameters = subqueryFunction.getParameters();
    if (parameters.length === 2) {
        parameters[1].remove();
    }
}

function printProgress(progress: number) {
    const percentage = (progress * 100).toFixed(0) + '%';
    if (process.stdout && process.stdout.cursorTo) {
        process.stdout.cursorTo(0);
        process.stdout.write(percentage);
    } else {
        console.log(percentage)
    }
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
                    typeString.includes('IJoinOn<') ||
                    typeString.includes('IFindByPrimaryKey') ||
                    typeString.includes('IInsertSelect') ||
                    typeString.includes('IColumnParameterNoRowTransformation') ||
                    typeString.includes('IJoinOnVal<') ||
                    typeString.includes('IJoinOnNull<') ||
                    typeString.includes('IOrderBy<') ||
                    typeString.includes('IDbFunctionWithAlias<') ||
                    typeString.includes('IKeyFunctionAsParametersReturnQueryBuider<') ||
                    typeString.includes('ISelectableColumnKeyFunctionAsParametersReturnQueryBuider<') ||
                    typeString.includes('IWhere<') ||
                    typeString.includes('IWhereIn<') ||
                    typeString.includes('IWhereBetween<') ||
                    typeString.includes('IHaving<') ||
                    typeString.includes('ISelectWithFunctionColumns3<') ||
                    typeString.includes('IWhereWithOperator<')) {
                    const callExpression = node.getParentIfKind(SyntaxKind.CallExpression);
                    if (callExpression) {
                        changeArgumentsFromFunctionToString(callExpression);
                    }
                } else if (typeString.startsWith('IWhereCompareTwoColumns<')) {
                    const callExpression = node.getParentIfKind(SyntaxKind.CallExpression);
                    if (callExpression) {
                        changeIWhereCompareTwoColumns(callExpression);
                    }
                } else if (typeString.startsWith('IWhereExists<')) {
                    const callExpression = node.getParentIfKind(SyntaxKind.CallExpression);
                    if (callExpression) {
                        changeIWhereExists(callExpression);
                    }
                }
            }
        });

        fileCounter++;
    }
    printProgress(1);
}
export function upgradeProjectJoinOnColumnsToOn(project: Project) {
    const sourceFiles = project.getSourceFiles();

    let fileCounter = 0;

    for (const sourceFile of sourceFiles) {

        printProgress(fileCounter / sourceFiles.length);
        sourceFile.forEachDescendant(node => {
            if (node.getKind() === SyntaxKind.PropertyAccessExpression) {
                const typeString = node.getType().getText();
                if (typeString.includes('IJoinOnColumns<')) {
                    const callExpression = node.getParentIfKind(SyntaxKind.CallExpression);
                    if (callExpression) {
                        callExpression.getFirstChild()!.getChildren()[2].replaceWithText('on');
                        const args = callExpression.getArguments();

                        if (args.length === 3) {
                            const arg0Text = args[0].getText();
                            const arg2Text = args[2].getText();
                            callExpression.removeArgument(0);
                            callExpression.insertArgument(0, arg2Text);
                            callExpression.removeArgument(2);
                            callExpression.insertArgument(2, arg0Text);
                        }
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

    let remainingActions = [...actions];

    if (actions.includes('string-parameters')) {
        console.log('Running "string-parameters"');
        upgradeProjectStringParameters(project);
        remainingActions = remainingActions.filter(action => action !== 'string-parameters');

    }
    if (actions.includes('join-on-columns-to-on')) {
        console.log('Running "join-on-columns-to-on"');
        upgradeProjectJoinOnColumnsToOn(project);
        remainingActions = remainingActions.filter(action => action !== 'join-on-columns-to-on');
    }

    if (remainingActions.length > 0) {
        console.log(`Unknown actions: ${remainingActions.join()}`)
    }

    await project.save();
}
