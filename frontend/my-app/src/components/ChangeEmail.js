import React, { useState, useEffect, useContext } from "react";
import config from "../config";
import styled from "styled-components";
import BasicPageLayout from "./BasicPageLayout";
import translations from "../assets/translations.json";
import { LanguageContext } from "../App";
import { useNavigate } from "react-router-dom";

const FormContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  font-size: 16px;
  box-sizing: border-box;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #0277bd;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #005bb5;
  }
`;

const BackButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: red;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;

  &:hover {
    background-color: #a30000;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
`;

export default function ChangeEmail() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const lang = translations[language]?.ChangeEmail || {
    Title: "Change Email",
    Email: "Email",
    VerificationCode: "Verification Code",
    SendVerificationButton: "Send Verification Code",
    VerifyChangeButton: "Verify and Change Email",
    BackButton: "Back",
    VerificationSentMessage:
      "Verification code sent to your new email address.",
    FailedToSendCode: "Failed to send verification code.",
    EmailChangeSuccess: "Email changed successfully.",
    FailedToVerifyCode: "Failed to verify the code.",
    ErrorOccurred: "Error occurred while processing the request.",
  };

  // Fetch current user email
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${config.SERVER_URL}/general-user/get-email?auth_token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setEmail(userData.email); // Set the current email in the input field
        } else {
          console.error("Failed to fetch user email");
        }
      } catch (err) {
        console.error("Error fetching user email:", err);
      }
    };

    fetchUserEmail();
  }, []);

  // Step 1: Send verification code to new email
  const handleSendVerificationCode = async () => {
    try {
      const response = await fetch(
        `${config.SERVER_URL}/user/change-email-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auth_token: localStorage.getItem("auth_token"),
            new_email: email, // Use the current state of email, which could be modified
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        alert(lang.VerificationSentMessage);
        setIsVerificationSent(true);
      } else {
        const result = await response.json();
        setError(result.message || lang.FailedToSendCode);
      }
    } catch (err) {
      setError(lang.ErrorOccurred);
    }
  };

  // Step 2: Verify code and update email
  const handleVerifyAndChangeEmail = async () => {
    try {
      const response = await fetch(
        `${config.SERVER_URL}/user/verify-change-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auth_token: localStorage.getItem("auth_token"),
            code: verificationCode,
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        alert(lang.EmailChangeSuccess);
        setIsVerificationSent(false);

        setError("");
        setVerificationCode("");
      } else {
        const result = await response.json();
        setError(result.message || lang.FailedToVerifyCode);
      }
    } catch (err) {
      setError(lang.ErrorOccurred);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <BasicPageLayout title={lang.Title}>
      <FormContainer>
        <h2>{lang.Title}</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <label>
          {lang.Email}:
          <InputField
            type="email"
            value={email || ""}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        {!isVerificationSent ? (
          <Button onClick={handleSendVerificationCode}>
            {lang.SendVerificationButton}
          </Button>
        ) : (
          <>
            <label>
              {lang.VerificationCode}:
              <InputField
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </label>
            <Button onClick={handleVerifyAndChangeEmail}>
              {lang.VerifyChangeButton}
            </Button>
          </>
        )}
        <BackButton onClick={handleBack}>{lang.BackButton}</BackButton>
      </FormContainer>
    </BasicPageLayout>
  );
}
