import { GithubProvider } from "@cdktf/provider-github/lib/provider/index.js";
import { GoogleBetaProvider } from "@cdktf/provider-google-beta/lib/provider/index.js";
import { DataGoogleBillingAccount } from "@cdktf/provider-google/lib/data-google-billing-account/index.js";
import { DataGoogleOrganization } from "@cdktf/provider-google/lib/data-google-organization/index.js";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider/index.js";
import { RandomProvider } from "@cdktf/provider-random/lib/provider/index.js";
import { Bootstrap } from "@curioswitch/cdktf-constructs";
import { GcsBackend, TerraformStack } from "cdktf";
import type { Construct } from "constructs";

export class SysadminStack extends TerraformStack {
  constructor(scope: Construct) {
    super(scope, "sysadmin");

    new GithubProvider(this, "github", {
      owner: "curioswitch",
    });

    new GoogleProvider(this, "google", {
      project: "cookchat-sysadmin",
      region: "asia-northeast1",
    });

    new RandomProvider(this, "random");

    const googleBeta = new GoogleBetaProvider(this, "google-beta", {
      project: "cookchat-sysadmin",
      region: "asia-northeast1",
    });

    const org = new DataGoogleOrganization(this, "curioswitch-org", {
      domain: "curioswitch.org",
    });

    const billing = new DataGoogleBillingAccount(this, "curioswitch-billing", {
      displayName: "curioswitch-billing",
    });

    const bootstrap = new Bootstrap(this, {
      name: "cookchat",
      organizationId: org.orgId,
      billingAccountId: billing.id,
      githubOrg: "curioswitch",
      domain: "cookchat.curioswitch.org",
      appRepositoryConfig: {
        description: "A cooking assistant",
        hasIssues: true,
        hasProjects: true,
        hasWiki: false,
        homepageUrl: "https://cookchat.curioswitch.org",
      },
      googleBeta,
    });

    new GcsBackend(this, {
      bucket: bootstrap.sysadminProject.tfstateBucketName,
    });
  }
}
