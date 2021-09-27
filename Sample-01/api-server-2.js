const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const jwtAuthz = require("express-jwt-authz");
const authConfig = require("./src/auth_config_2.json");

const app = express();

// const port = process.env.API_PORT || 3001;
const port2 = process.env.API_PORT_2 || 3002;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

app.get("/api/checkingaccount", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });
});

app.get(
  "/api/checkingaccount",
  checkJwt,
  jwtAuthz(["read:funds"]),
  function (req, res) {
    res.send({
      msg: "This is the GET /read user data endpoint",
    });
  }
);

app.post(
  "/api/checkingaccount",
  checkJwt,
  jwtAuthz(["create:transfer"]),
  function (req, res) {
    res.send({
      msg: "This is the POST /create new user endpoint",
    });
  }
);

app.listen(port2, () =>
  console.log(`Checking Account API Server listening on port ${port2}`)
);
