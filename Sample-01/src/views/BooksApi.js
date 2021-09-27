import React, { useState } from "react";
import { Button, Alert } from "reactstrap";
// import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";
import ReactCountdownClock from "react-countdown-clock";
import jwt_decode from "jwt-decode";

export const BooksApiComponent = () => {
  const { apiOrigin = "http://localhost:3001", audience } = getConfig();

  const [isAuthorized, setIsAuthorized] = useState(false);

  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
    accessToken: "",
    tokenExpiration: 0,
    accessTokenUnixTime: 0,
    tokenAudience: [],
    wrongATMessage: false,
  });

  const {
    // user,
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
  } = useAuth0();
  // console.log(user);
  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup({
        audience: "https://checking-account-api.com/",
      });
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

    await callApi();
    await callApiWrongAccessToken();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup({
        audience: "https://checking-account-api.com/",
      });
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

    await callApi();
    await callApiWrongAccessToken();
  };

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();
      const decoded = jwt_decode(token);
      const decodedExpiration = decoded.exp;
      const decodedAudience = decoded.aud;
      console.log("Decoded Access Token", decoded);

      const timeUntilExpiration =
        decodedExpiration - Math.floor(Date.now() / 1000);

      const response = await fetch(`${apiOrigin}/api/creditcard`, {
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
        tokenAudience: decodedAudience[0],
      });
      setIsAuthorized(true);
    } catch (error) {
      setIsAuthorized(false);
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  const callApiWrongAccessToken = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "https://checking-account-api.com/",
      });
      const decoded = jwt_decode(token);
      const decodedAudience = decoded.aud;
      console.log("Invalid AT: ", decoded);
      console.log("AT Audience: ", decodedAudience[0]);

      const response = await fetch(`${apiOrigin}/api/creditcard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      setState({
        ...state,
        apiMessage: responseData,
      });
      setIsAuthorized(false);
    } catch (error) {
      setIsAuthorized(false);
      setState({
        ...state,
        wrongATMessage: true,
        error: error.error,
        showResult: true,
      });
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
              log in again
            </a>
          </Alert>
        )}

        <h1>Apply For A New Credit Card Today!</h1>
        {/* <p className="lead">
          Ping an external Book API by clicking the button below.
        </p>

        <p>
          This will call a local API on port 3001 that would have been started
          if you run <code>npm run dev</code>. An access token is sent as part
          of the request's `Authorization` header and the API will validate it
          using the API's audience value.
        </p> */}

        <div className="justify-content-between">
          <Button
            color="success"
            className="mt-5"
            onClick={callApi}
            disabled={!audience}
          >
            Hit Credit Card API - Access Token with Credit Card API Audience
          </Button>
          <br />
          <Button
            color="danger"
            className="mt-5"
            onClick={callApiWrongAccessToken}
            disabled={!audience}
          >
            Hit Credit Card API - Access Token with Checking Account API
            Audience
          </Button>
        </div>
      </div>
      {isAuthorized && (
        <div className="result-block-container">
          {state.showResult && (
            <div className="result-block" data-testid="api-result">
              <h6 className="muted">Result</h6>
              {/* <Highlight> */}
              <span>
                {JSON.stringify(state.apiMessage, null, 2)} <br />
                <br />
              </span>
              <div className="accessTokenContainer">
                <p className="accessTokenPrinted">
                  Access Token: {state.accessToken}
                </p>
              </div>
              <p className="tokenExpirationPrinted">
                Access Token Expiration (Epoch/Unix):{" "}
                {state.accessTokenUnixTime}
              </p>
              <p className="decodedAudience">
                Access Token Audience: {state.tokenAudience}
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
        </div>
      )}
      {state.wrongATMessage && (
        <div className="result-block-containerInvalid">
          <div className="invalidToken">
            Your access token is not valid for this API endpoint.
          </div>
        </div>
      )}
    </>
  );
};

export default withAuthenticationRequired(BooksApiComponent, {
  onRedirecting: () => <Loading />,
});
