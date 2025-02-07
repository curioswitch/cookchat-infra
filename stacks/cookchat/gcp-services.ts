import { ProjectService } from "@cdktf/provider-google/lib/project-service/index.js";
import { Construct } from "constructs";

export interface GcpServicesConfig {
	project: string;
}

export class GcpServices extends Construct {
	constructor(scope: Construct, config: GcpServicesConfig) {
		super(scope, "gcp-services");

		new ProjectService(this, "aiplatform", {
			project: config.project,
			service: "aiplatform.googleapis.com",
		});
	}
}
