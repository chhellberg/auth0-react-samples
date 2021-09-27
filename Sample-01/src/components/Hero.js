import React from "react";

// import logo from "../assets/logo.svg";
import iconAuth from "../assets/iconAuth.svg";

const Hero = () => (
  <div className="text-center hero my-5">
    <img
      className="mb-3 app-logo"
      src={iconAuth}
      alt="authentication"
      width="120"
    />
    <h1 className="mb-4">The Fake Bank</h1>

    {/* <p className="lead">
      This is a sample application that demonstrates an authentication flow for
      an SPA, using <a href="https://reactjs.org">React.js</a>
    </p> */}
  </div>
);

export default Hero;
