import { ArrowFunction, CallExpression, Project, PropertyAccessExpression, SyntaxKind } from "ts-morph";

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

export function upgradeProjectStringParameters(project: Project) {
    const sourceFiles = project.getSourceFiles();

    for (const sourceFile of sourceFiles) {
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
    }
}

export async function runUpgrade() {


    const project = new Project({
        tsConfigFilePath: `../ZXY-Cloud/tsconfig.backend.json`,
    });

    upgradeProjectStringParameters(project);


    await project.save();
}
