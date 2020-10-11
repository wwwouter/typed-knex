import * as path from 'path';
import { ArrayLiteralExpression, ArrowFunction, CallExpression, Project, PropertyAccessExpression, SyntaxKind } from "ts-morph";

function changeFirstArgumentFromFunctionToString(callExpression: CallExpression) {
    const args = callExpression.getArguments();

    if (args.length > 0) {

        // let argumentToReplace: ArrowFunction | undefined;
        let argumentToReplaceIndex: number | undefined;
        if (args[0].getKind() === SyntaxKind.ArrowFunction) {
            // argumentToReplace = args[0] as ArrowFunction;
            argumentToReplaceIndex = 0;
        } else if (args[1]?.getKind() === SyntaxKind.ArrowFunction) {
            // argumentToReplace = args[1] as ArrowFunction;
            argumentToReplaceIndex = 1;
        }

        if (argumentToReplaceIndex !== undefined) {
            const argumentToReplace = args[argumentToReplaceIndex] as ArrowFunction;
            // const firstArgument = args[0] as ArrowFunction;

            if (argumentToReplace.getBody().getKind() === SyntaxKind.PropertyAccessExpression) {
                const body = argumentToReplace.getBody() as PropertyAccessExpression;
                const indexOfFirstPeriod = body.getText().indexOf('.');

                const name = body.getText().substring(indexOfFirstPeriod + 1);

                callExpression.removeArgument(0);
                callExpression.insertArgument(0, `'${name}'`);
            } else if (argumentToReplace.getBody().getKind() === SyntaxKind.ArrayLiteralExpression) {
                const body = argumentToReplace.getBody() as ArrayLiteralExpression;
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
