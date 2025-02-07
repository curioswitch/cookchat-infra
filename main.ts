import { App } from "cdktf";
import { CookchatStack } from "./stacks/cookchat/index.js";
import { SysadminStack } from "./stacks/sysadmin/index.js";

const app = new App();

new SysadminStack(app);

new CookchatStack(app, {
	environment: "dev",
	project: "cookchat-dev",
	domain: "alpha.cookchat.curioswitch.org",
});

new CookchatStack(app, {
	environment: "prod",
	project: "cookchat-prod",
	domain: "cookchat.curioswitch.org",
});

app.synth();
