import { App } from "cdktf";
import { CookchatStack } from "./stacks/cookchat/index.js";
import { SysadminStack } from "./stacks/sysadmin/index.js";

const app = new App();

new SysadminStack(app);

new CookchatStack(app, {
  environment: "dev",
  project: "cookchat-dev",
  domain: "alpha.coopii.app",
  googleAuthClientId:
    "408496405753-11b16eui0i44jfklf26ip2obabc6qut6.apps.googleusercontent.com",
  googleAuthClientSecretCiphertext:
    "CiQAA+z5ztKV+zaC64q1CG4x8KsVGf+QTkTLk/VWNZAUYLNfgs4STACrJy8sDPazNbTF0JwTXQ8XOIxrIM/UE5s+PVCrCLV1e+HOdGrB7MUltg9HzI+T1bp+bBpUHG6V9Jp5h3G0jzCCjMi1ziAwwj2bfmk=",
  authorizedEmailsCiphertext:
    "CiQAA+z5zpARd3h6XsF7FHWsnBqhprnwnJT/Gdm8y3MY0sDhjnYSTACrJy8shiP5+bOZ31ZjETvm38pMASRAmWVJw8cL+A7NJCwVRbWg/H9Y/TocxHXhTojKnGI5W8gKCfDHgxs/FWPSz6lXKwEfyuFPtmM=",
  openaiAPIKeyCiphertext:
    "CiQAA+z5zqbf0DAICtn6DwC4brTCQXk5Nms+6DuRoqqvzEimou4S0QEAqycvLBGdVg3IxsdvN8Zy+1u92jq9BjfGMqeyBCz0018Er3imJ1wpThQweTaiBftzpTdQw3ZlvnmpWYSntV7W+dTfZmwyraNfwvMp5kR9GatG9pNaqucqWWOnnl/IYXDj7sjYEnzHUIG1wRzRqEL7PTDhg3LUo5GZUEwYDk5lshZstytV0lYETnOxAOZgkt5GOoYZjex3aA5SoVjw2ZyiSID8as9gcXW8AevhDreIsMiHjCtwGlrHoY8bi4aA0eo1/JakLgvgAG9IbAEOfAnl4A==",
});

new CookchatStack(app, {
  environment: "prod",
  project: "cookchat-prod",
  domain: "cookchat.curioswitch.org",
  googleAuthClientId: "",
  googleAuthClientSecretCiphertext: "",
  openaiAPIKeyCiphertext: "",
});

app.synth();
