import { ProjectService } from "@cdktf/provider-google/lib/project-service/index.js";
import { Construct } from "constructs";

export interface GcpServicesConfig {
  project: string;
}

export class GcpServices extends Construct {
  public readonly apiKeys: ProjectService;

  constructor(scope: Construct, config: GcpServicesConfig) {
    super(scope, "gcp-services");

    new ProjectService(this, "aiplatform", {
      project: config.project,
      service: "aiplatform.googleapis.com",
    });

    this.apiKeys = new ProjectService(this, "apikeys", {
      project: config.project,
      service: "apikeys.googleapis.com",
    });

    new ProjectService(this, "generativelanguage", {
      project: config.project,
      service: "generativelanguage.googleapis.com",
    });
  }
}
