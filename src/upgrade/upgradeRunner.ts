import { ArrowFunction, CallExpression, Project, PropertyAccessExpression, SyntaxKind } from "ts-morph";
import * as path from 'path';



function changeFirstArgumentFromFunctionToString(callExpression: CallExpression) {



    // if (callExpression.getFirstChildIfKind(SyntaxKind.PropertyAccessExpression)?.getName() === 'where') {

    const args = callExpression.getArguments();

    if (args.length === 2) {
        if (args[0].getKind() === SyntaxKind.ArrowFunction) {
            const firstArgument = args[0] as ArrowFunction;

            if (firstArgument.getBody().getKind() === SyntaxKind.PropertyAccessExpression) {
                const body = firstArgument.getBody() as PropertyAccessExpression;
                const name = body.getName();

                // firstArgument.setBodyText(`"${body.getName()}"`);

                callExpression.removeArgument(0);
                callExpression.insertArgument(0, `'${name}'`);

            }

        }
    }


    // }




}


export async function runUpgrade() {
    // const project = new Project({
    //     tsConfigFilePath: "./testProject/tsconfig.json"
    // });

    // project.addSourceFilesAtPaths("src/**/*.ts");

    const testProjectPath = path.join(__dirname, '../../../test/upgrade/project');

    const project = new Project();
    project.addSourceFilesAtPaths(testProjectPath + "/**/*.ts");
    const sourceFile = project.getSourceFileOrThrow("code.ts");

    // const interfaces = sourceFile.getInterfaces();
    const personInterface = sourceFile.getInterface("ITypedQueryBuilder")!;

    const ns = personInterface.findReferencesAsNodes();
    console.log('n: ', ns.length);

    // for (const n of ns) {
    //     if (n.getKind() === SyntaxKind.Identifier) {
    //         console.log(n.getParent()!.getFullText())
    //     }
    // }


    sourceFile.forEachDescendant(node => {

        if (node.getType().getText().startsWith('IWhereWithOperator<')) {
            if (node.getKind() === SyntaxKind.PropertyAccessExpression) {

                const callExpression = node.getParentIfKind(SyntaxKind.CallExpression);
                console.log('callExpression', callExpression?.getText())
                if (callExpression) {
                    changeFirstArgumentFromFunctionToString(callExpression);

                }
            }

            // console.log(node.getKindName(), node.getText());
        }

        // console.log(node.getType().getText())
    });

    // personInterface.rename("ITest2");



    // personInterface.transform


    // const expressionStatementList = sourceFile.getDescendantsOfKind(SyntaxKind.ExpressionStatement);

    // for (const expressionStatement of expressionStatementList) {
    //     const callExpression = expressionStatement.getExpressionIfKind(SyntaxKind.CallExpression);
    //     if (callExpression) {

    //         if (callExpression.getFirstChildIfKind(SyntaxKind.PropertyAccessExpression)?.getName() === 'where') {

    //             const args = callExpression.getArguments();

    //             if (args.length === 2) {
    //                 if (args[0].getKind() === SyntaxKind.ArrowFunction) {
    //                     const firstArgument = args[0] as ArrowFunction;

    //                     if (firstArgument.getBody().getKind() === SyntaxKind.PropertyAccessExpression) {
    //                         const body = firstArgument.getBody() as PropertyAccessExpression;
    //                         const name = body.getName();

    //                         // firstArgument.setBodyText(`"${body.getName()}"`);

    //                         callExpression.removeArgument(0);
    //                         callExpression.insertArgument(0, `'${name}'`);

    //                     }

    //                 }
    //             }


    //         }


    //     }
    // }



    await project.save();

}