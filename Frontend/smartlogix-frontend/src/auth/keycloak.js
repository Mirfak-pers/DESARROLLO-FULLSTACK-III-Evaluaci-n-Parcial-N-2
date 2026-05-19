import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "smartlogix",
  clientId: "smartlogix-frontend",
});

export default keycloak;