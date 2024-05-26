"use client";

import { useState } from "react";

const EmailSignup = () => {
  const DYNAMIC_ENVIRONMENT_ID = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [OTP, setOTP] = useState("");
  const [UUID, setUUID] = useState("");
  const [JWT, setJWT] = useState("");

  const sendEmailVerification = async () => {
    setVerifying(true);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    };

    fetch(
      `https://app.dynamicauth.com/api/v0/sdk/${DYNAMIC_ENVIRONMENT_ID}/emailVerifications/create`,
      options,
    )
      .then((response) => response.json())
      .then((response) => {
        setUUID(response.verificationUUID);
      })
      .catch((err) => console.error(err));
  };

  const verify = async () => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        verificationToken: OTP,
        verificationUUID: UUID,
      }),
    };

    fetch(
      `https://app.dynamicauth.com/api/v0/sdk/${DYNAMIC_ENVIRONMENT_ID}/emailVerifications/signIn`,
      options,
    )
      .then((response) => response.json())
      .then((response) => {
        setVerifying(false);
        setJWT(response.jwt);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="text-black">
      <h1>Signup with Email</h1>
      <input
        type="text"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        value={email}
      />
      <button onClick={() => sendEmailVerification()}>Submit</button>
      {verifying && (
        <div>
          <input
            type="text"
            onChange={(e) => setOTP(e.target.value)}
            placeholder="Enter your OTP"
            value={OTP}
          />
          <button onClick={() => verify()}>Verify</button>
        </div>
      )}
      {JWT && <p>Your JWT is: {JWT}</p>}
    </div>
  );
};

export default EmailSignup;
