import { GithubProvider } from "@cdktn/provider-github/lib/provider/index.js";
import { DataGoogleBillingAccount } from "@cdktn/provider-google/lib/data-google-billing-account/index.js";
import { DataGoogleOrganization } from "@cdktn/provider-google/lib/data-google-organization/index.js";
import { DnsManagedZone } from "@cdktn/provider-google/lib/dns-managed-zone/index.js";
import { DnsRecordSet } from "@cdktn/provider-google/lib/dns-record-set/index.js";
import { GoogleProvider } from "@cdktn/provider-google/lib/provider/index.js";
import { GoogleBetaProvider } from "@cdktn/provider-google-beta/lib/provider/index.js";
import { RandomProvider } from "@cdktn/provider-random/lib/provider/index.js";
import { Bootstrap } from "@curioswitch/cdktn-constructs";
import { GcsBackend, TerraformStack } from "cdktn";
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
      domain: "coopii.app",
      appRepositoryConfig: {
        description: "A cooking assistant",
        hasIssues: true,
        hasProjects: true,
        hasWiki: false,
        homepageUrl: "https://coopii.app",
      },
      googleBeta,
    });

    new GcsBackend(this, {
      bucket: bootstrap.sysadminProject.tfstateBucketName,
    });

    const oldAlphaZone = new DnsManagedZone(this, "alpha-cookchat", {
      name: "alpha-cookchat-curioswitch-org",
      project: bootstrap.devProject.project.name,
      dnsName: "alpha.cookchat.curioswitch.org.",
    });

    const oldProdZone = new DnsManagedZone(this, "prod-cookchat", {
      name: "cookchat-curioswitch-org",
      project: bootstrap.prodProject.project.name,
      dnsName: "cookchat.curioswitch.org.",
    });

    new DnsRecordSet(this, "prod-alpha-ns-delegate", {
      project: bootstrap.prodProject.project.name,
      managedZone: oldProdZone.name,
      name: "alpha.cookchat.curioswitch.org.",
      type: "NS",
      rrdatas: oldAlphaZone.nameServers,
      ttl: 21600,
    });
  }
}
