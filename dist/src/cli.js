#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const upgradeRunner_1 = require("./upgrade/upgradeRunner");
const argv = yargs
    .usage('Usage: $0 [-p tsconfig.json][-u upgrade] action(s)')
    .options({ u: { type: 'boolean' }, p: { type: 'string' } })
    .describe({ u: 'Run upgrader', h: 'Display this help message' })
    .boolean(['u', 'h'])
    .help()
    .alias('h', 'help').argv;
if (argv.u) {
    // tslint:disable-next-line: no-floating-promises
    upgradeRunner_1.runUpgrade(argv._, argv.p);
}
else {
    yargs.showHelp();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQkFBK0I7QUFDL0IsMkRBQXFEO0FBRXJELE1BQU0sSUFBSSxHQUFHLEtBQUs7S0FDYixLQUFLLENBQUMsb0RBQW9ELENBQUM7S0FDM0QsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDO0tBQzFELFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUFFLDJCQUEyQixFQUFFLENBQUM7S0FDL0QsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ25CLElBQUksRUFBRTtLQUNOLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDO0FBRTdCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRTtJQUNSLGlEQUFpRDtJQUNqRCwwQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBRTlCO0tBQU07SUFDSCxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7Q0FDcEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5pbXBvcnQgeyBydW5VcGdyYWRlIH0gZnJvbSAnLi91cGdyYWRlL3VwZ3JhZGVSdW5uZXInO1xuXG5jb25zdCBhcmd2ID0geWFyZ3NcbiAgICAudXNhZ2UoJ1VzYWdlOiAkMCBbLXAgdHNjb25maWcuanNvbl1bLXUgdXBncmFkZV0gYWN0aW9uKHMpJylcbiAgICAub3B0aW9ucyh7IHU6IHsgdHlwZTogJ2Jvb2xlYW4nIH0sIHA6IHsgdHlwZTogJ3N0cmluZycgfSB9KVxuICAgIC5kZXNjcmliZSh7IHU6ICdSdW4gdXBncmFkZXInLCBoOiAnRGlzcGxheSB0aGlzIGhlbHAgbWVzc2FnZScgfSlcbiAgICAuYm9vbGVhbihbJ3UnLCAnaCddKVxuICAgIC5oZWxwKClcbiAgICAuYWxpYXMoJ2gnLCAnaGVscCcpLmFyZ3Y7XG5cbmlmIChhcmd2LnUpIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWZsb2F0aW5nLXByb21pc2VzXG4gICAgcnVuVXBncmFkZShhcmd2Ll8sIGFyZ3YucCk7XG5cbn0gZWxzZSB7XG4gICAgeWFyZ3Muc2hvd0hlbHAoKTtcbn1cbiJdfQ==