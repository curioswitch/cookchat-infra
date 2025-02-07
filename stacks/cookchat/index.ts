import { GoogleBetaProvider } from "@cdktf/provider-google-beta/lib/provider/index.js";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider/index.js";
import { CurioStack } from "@curioswitch/cdktf-constructs";
import { GcsBackend, TerraformStack } from "cdktf";
import type { Construct } from "constructs";
import { GcpServices } from "./gcp-services.js";

export interface CookchatConfig {
  environment: string;
  project: string;
  domain: string;
}

export class CookchatStack extends TerraformStack {
  constructor(scope: Construct, config: CookchatConfig) {
    super(scope, config.environment);

    new GcsBackend(this, {
      bucket: `${config.project}-tfstate`,
    });

    new GoogleProvider(this, "google", {
      project: config.project,
      region: "asia-northeast1",
      userProjectOverride: true,
    });

    const googleBeta = new GoogleBetaProvider(this, "google-beta", {
      project: config.project,
      region: "asia-northeast1",
      userProjectOverride: true,
    });

    new GcpServices(this, {
      project: config.project,
    });

    new CurioStack(this, {
      project: config.project,
      location: "us-central1",
      domain: config.domain,
      githubRepo: "curioswitch/tasuke",
      googleBeta,
    });
  }
}
