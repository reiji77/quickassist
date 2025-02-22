import { useState, useContext } from "react";
import config from "../config";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BasicPageLayout from "./BasicPageLayout";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import translations from "../assets/translations.json";
import { LanguageContext } from "../App";

const FormContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputField = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  font-size: 16px;
  box-sizing: border-box;
`;

const TogglePasswordVisibility = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #0277bd;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
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
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
`;

export default function ChangePassword() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const lang = translations[language]?.ChangePassword || {
    Title: "Change Password",
    CurrentPassword: "Current Password",
    NewPassword: "New Password",
    ConfirmNewPassword: "Confirm New Password",
    SubmitButton: "Submit",
    BackButton: "Back",
    PasswordMismatch: "New passwords do not match.",
    PasswordChangedSuccess: "Password changed successfully.",
    PasswordChangeFailed: "Failed to change password.",
    ErrorOccurred: "Error occurred while changing password.",
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(lang.PasswordMismatch);
      return;
    }

    try {
      const response = await fetch(
        `${config.SERVER_URL}/general-user/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auth_token: localStorage.getItem("auth_token"),
            current_password: currentPassword,
            new_password: newPassword,
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setError("");
        alert(lang.PasswordChangedSuccess);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const result = await response.json();
        setError(result.message || lang.PasswordChangeFailed);
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

        <form onSubmit={handleSubmit}>
          <label>
            {lang.CurrentPassword}:
            <InputWrapper>
              <InputField
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <TogglePasswordVisibility
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {!showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </TogglePasswordVisibility>
            </InputWrapper>
          </label>
          <label>
            {lang.NewPassword}:
            <InputWrapper>
              <InputField
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <TogglePasswordVisibility
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {!showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </TogglePasswordVisibility>
            </InputWrapper>
          </label>
          <label>
            {lang.ConfirmNewPassword}:
            <InputWrapper>
              <InputField
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <TogglePasswordVisibility
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {!showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </TogglePasswordVisibility>
            </InputWrapper>
          </label>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <SubmitButton type="submit">{lang.SubmitButton}</SubmitButton>
        </form>
        <BackButton onClick={handleBack}>{lang.BackButton}</BackButton>
      </FormContainer>
    </BasicPageLayout>
  );
}
