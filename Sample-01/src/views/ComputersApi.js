import React, { useState } from "react";
import { Button, Alert } from "reactstrap";
// import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";
import ReactCountdownClock from "react-countdown-clock";
import jwt_decode from "jwt-decode";

export const ComputersApiComponent = () => {
  const { apiOrigin2 = "http://localhost:3002", audience } = getConfig();

  const [isAuthorized, setIsAuthorized] = useState(false);

  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
    accessToken: "",
    tokenExpiration: 0,
    accessTokenUnixTime: 0,
    accessTokenScope: "",
    noAccessMessage: false,
  });

  // console.log("rendered state", state);

  const { getAccessTokenSilently, loginWithPopup, getAccessTokenWithPopup } =
    useAuth0();

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup({
        // audience: "https://checking-account-api.com/",
        // scope: "read:funds",
      });
      await getAccessTokenWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callComputersApi();
    await callApiWithReadScope();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup({
        audience: "https://checking-account-api.com/",
        scope: "create:transfer",
      });
      // console.log("post popup login succeeded", state);
      setState({
        ...state,
        error: null,
        showResult: true,
        noAccessMessage: true,
      });
      setIsAuthorized(true);
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    // await callComputersApi();
    // await callApiWithReadScope();
    await callApiWithCreateScope();
  };

  const callComputersApi = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "https://checking-account-api.com/",
      });

      const decoded = jwt_decode(token);
      const decodedExpiration = decoded.exp;
      const decodedScope = decoded.scope;
      console.log(decoded);

      const timeUntilExpiration =
        decodedExpiration - Math.floor(Date.now() / 1000);

      const response = await fetch(`${apiOrigin2}/api/checkingaccount`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
        accessToken: token,
        tokenExpiration: timeUntilExpiration,
        accessTokenUnixTime: decodedExpiration,
        accessTokenScope: decodedScope,
      });
      setIsAuthorized(true);
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  const callApiWithReadScope = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "https://checking-account-api.com/",
        scope: "read:funds",
      });

      const decoded = jwt_decode(token);
      const decodedScope = decoded.scope;
      const decodedExpiration = decoded.exp;
      console.log(decoded);

      const timeUntilExpiration =
        decodedExpiration - Math.floor(Date.now() / 1000);

      const response = await fetch(`${apiOrigin2}/api/checkingaccount`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
        accessToken: token,
        tokenExpiration: timeUntilExpiration,
        accessTokenUnixTime: decodedExpiration,
        accessTokenScope: decodedScope,
      });
      setIsAuthorized(true);
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  const callApiWithCreateScope = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "https://checking-account-api.com/",
        scope: "create:transfer",
      });

      const decoded = jwt_decode(token);
      const decodedScope = decoded.scope;
      const decodedExpiration = decoded.exp;
      console.log(decoded);

      const timeUntilExpiration =
        decodedExpiration - Math.floor(Date.now() / 1000);

      const response = await fetch(`${apiOrigin2}/api/checkingaccount`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
        accessToken: token,
        tokenExpiration: timeUntilExpiration,
        accessTokenUnixTime: decodedExpiration,
        accessTokenScope: decodedScope,
      });
      setIsAuthorized(true);
    } catch (error) {
      setState({
        ...state,
        error: error.error,
        noAccessMessage: true,
      });
      setIsAuthorized(true);
    }
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  return (
    <>
      <div className="mb-5">
        {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              className="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}

        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              className="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
              log in again to gain access.
            </a>
          </Alert>
        )}

        <h1>Personal Checking Account</h1>
        {/* <p className="lead">
          Ping an external Computer API by clicking the button below.
        </p>

        <p>
          This will call a local API on port 3002 that would have been started
          if you run <code>npm run dev</code>. An access token is sent as part
          of the request's `Authorization` header and the API will validate it
          using the API's audience value.
        </p> */}

        <div className="justify-content-between">
          <Button
            color="success"
            className="mt-5"
            onClick={callComputersApi}
            disabled={!audience}
          >
            Checking Account API + Standard OIDC Scope
          </Button>
          <br />

          <div className="extraButtons">
            <Button
              color="primary"
              className="mt-5"
              onClick={callApiWithReadScope}
              disabled={!audience}
            >
              See Balance
            </Button>
            <br />
            <Button
              color="danger"
              className="mt-5"
              onClick={callApiWithCreateScope}
              disabled={!audience}
            >
              Transfer Funds
            </Button>
          </div>
        </div>
      </div>

      <div className="result-block-container">
        {state.showResult && (
          <div className="result-block" data-testid="api-result">
            <h6 className="muted">Result</h6>
            {/* <Highlight> */}
            <span>
              {JSON.stringify(state.apiMessage, null, 2)} <br />
              <br />
            </span>
            <p className="accessTokenPrinted">
              Access Token: {state.accessToken}
            </p>
            <p className="tokenScopePrinted">
              Access Token Scope: {state.accessTokenScope}
            </p>
            <ReactCountdownClock
              seconds={state.tokenExpiration}
              color="#675"
              alpha={0.9}
              size={100}
            />
            {/* </Highlight> */}
          </div>
        )}
        {/* {state.noAccessMessage && (
          <div className="result-block-containerInvalid">
            <div className="invalidToken">
              Your don't have access beyond this point.
            </div>
          </div>
        )} */}
      </div>
    </>
  );
};
export default withAuthenticationRequired(ComputersApiComponent, {
  onRedirecting: () => <Loading />,
});
