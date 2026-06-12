// Remplis ces valeurs après `terraform apply` (voir outputs.tf)
const config = {
  region:           "us-west-2",
  userPoolId:       "REMPLACER_PAR_COGNITO_USER_POOL_ID",
  userPoolClientId: "REMPLACER_PAR_COGNITO_CLIENT_ID",
  identityPoolId:   "REMPLACER_PAR_COGNITO_IDENTITY_POOL_ID",
  apiUrl:           "REMPLACER_PAR_API_GATEWAY_URL",
  documentsBucket:  "REMPLACER_PAR_NOM_BUCKET_DOCUMENTS"
};

export default config;
