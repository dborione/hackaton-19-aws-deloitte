// Remplis ces valeurs après `terraform apply` (voir outputs.tf)
const config = {
  region:           "us-west-2",
  userPoolId:       "us-west-2_tz1TQ8t1r",
  userPoolClientId: "48m98h9lguafi5bcar943h8ovk",
  identityPoolId:   "us-west-2:abfb7c93-4c6a-4a86-8448-69305c3f5389",
  apiUrl:           "https://d37aavz6fgy963.cloudfront.net",
  documentsBucket:  "franchise-app-documents-dev"
};

export default config;
