import { ApikeysKey } from "@cdktf/provider-google/lib/apikeys-key/index.js";
import { DataGoogleKmsSecret } from "@cdktf/provider-google/lib/data-google-kms-secret/index.js";
import { ProjectIamCustomRole } from "@cdktf/provider-google/lib/project-iam-custom-role/index.js";
import { ProjectIamMember } from "@cdktf/provider-google/lib/project-iam-member/index.js";
import { SecretManagerSecretVersion } from "@cdktf/provider-google/lib/secret-manager-secret-version/index.js";
import { SecretManagerSecret } from "@cdktf/provider-google/lib/secret-manager-secret/index.js";
import { StorageBucketIamMember } from "@cdktf/provider-google/lib/storage-bucket-iam-member/index.js";
import type { StorageBucket } from "@cdktf/provider-google/lib/storage-bucket/index.js";
import {
  type CurioStack,
  CurioStackService,
} from "@curioswitch/cdktf-constructs";
import { Construct } from "constructs";
import type { GcpServices } from "./gcp-services.js";

export interface AppsConfig {
  searchEngine: string;

  authorizedEmailsCiphertext?: string;
  openaiAPIKeyCiphertext: string;

  publicFilesBucket: StorageBucket;

  gcpServices: GcpServices;

  curiostack: CurioStack;
}

export class Apps extends Construct {
  constructor(scope: Construct, config: AppsConfig) {
    super(scope, "apps");

    const { project } = config.curiostack.config;

    const frontendServerEnv: Record<string, string> = {
      SEARCH_ENGINE: config.searchEngine,
    };
    if (config.authorizedEmailsCiphertext) {
      const decryptedEmails = new DataGoogleKmsSecret(
        this,
        "authorized-emails",
        {
          cryptoKey: `${config.curiostack.project}/global/terraform/secrets`,
          ciphertext: config.authorizedEmailsCiphertext,
        },
      );
      frontendServerEnv.AUTHORIZATION_EMAILS = decryptedEmails.plaintext;
    }
    const geminiApiKey = new ApikeysKey(this, "gemini-api-key", {
      project,
      name: "gemini-api",
      displayName: "Gemini API Key",
      restrictions: {
        apiTargets: [
          {
            service: "generativelanguage.googleapis.com",
          },
        ],
      },
      dependsOn: [config.gcpServices.apiKeys],
    });

    const geminiApiKeySecret = new SecretManagerSecret(
      this,
      "gemini-api-key-secret",
      {
        secretId: "gemini-api-key",
        replication: {
          auto: {},
        },
      },
    );
    const geminiApiKeySecretVersion = new SecretManagerSecretVersion(
      this,
      "gemini-api-key-secret-v1",
      {
        secret: geminiApiKeySecret.id,
        secretDataWo: geminiApiKey.keyString,
      },
    );

    const openaiAPIKey = new DataGoogleKmsSecret(this, "openai-api-key", {
      cryptoKey: `${config.curiostack.project}/global/terraform/secrets`,
      ciphertext: config.openaiAPIKeyCiphertext,
    });
    const openaiAPIKeySecret = new SecretManagerSecret(
      this,
      "openai-api-key-secret",
      {
        secretId: "openai-api-key",
        replication: {
          auto: {},
        },
      },
    );
    const openaiAPIKeySecretVersion = new SecretManagerSecretVersion(
      this,
      "openai-api-key-secret-v1",
      {
        secret: openaiAPIKeySecret.id,
        secretDataWo: openaiAPIKey.plaintext,
      },
    );

    const frontendServer = new CurioStackService(this, {
      name: "frontend-server",
      public: true,
      timeout: "3600s",
      env: frontendServerEnv,
      envSecrets: {
        GEMINI_API_KEY: geminiApiKeySecretVersion,
        OPENAI_API_KEY: openaiAPIKeySecretVersion,
      },
      curiostack: config.curiostack,
    });

    new ProjectIamMember(this, "frontend-server-firestore", {
      project,
      role: "roles/datastore.user",
      member: frontendServer.serviceAccount.member,
    });

    new ProjectIamMember(this, "frontend-server-discovery-engine", {
      project,
      role: "roles/discoveryengine.user",
      member: frontendServer.serviceAccount.member,
    });

    new StorageBucketIamMember(this, "frontend-server-public-files", {
      bucket: config.publicFilesBucket.name,
      role: "roles/storage.objectUser",
      member: frontendServer.serviceAccount.member,
    });

    const aiPredictor = new ProjectIamCustomRole(this, "ai-predictor", {
      project,
      roleId: "aiPredictor",
      title: "AI Predictor",
      description: "Permission to perform predictions with managed AI models.",
      permissions: [
        "aiplatform.endpoints.predict",
        "aiplatform.cachedContents.create",
      ],
    });

    new ProjectIamMember(this, "frontend-server-vertexai", {
      project,
      role: aiPredictor.name,
      member: frontendServer.serviceAccount.member,
    });
  }
}
