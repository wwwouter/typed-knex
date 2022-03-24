#!/usr/bin/env node
import * as yargs from "yargs";
import { runUpgrade } from "./upgrade/upgradeRunner";

async function main() {
    const argv = await yargs
        .usage("Usage: $0 [-p tsconfig.json][-u upgrade] action(s)")
        .options({ u: { type: "boolean" }, p: { type: "string" } })
        .describe({ u: "Run upgrader", h: "Display this help message" })
        .boolean(["u", "h"])
        .help()
        .string("_")
        .alias("h", "help").argv;

    if (argv.u) {
        await runUpgrade(argv._ as string[], argv.p);
    } else {
        yargs.showHelp();
    }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
