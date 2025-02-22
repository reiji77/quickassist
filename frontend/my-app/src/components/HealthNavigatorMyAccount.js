import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import BasicPageLayout from "./BasicPageLayout";
import styled from "styled-components";
import { LanguageContext } from "../App";
import translations from "../assets/translations.json";

const CenteredContainer = styled.div`
  height: 100%;
  width: 100%;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 10px;
  height: min-content;
  align-items: center;
`;

const Button = styled.button`
  background-color: #0277bd;
  color: white;
  font-size: 30px;
  padding: 10px;
  border-radius: 10px;
  margin-top: 20px;
  cursor: pointer;
  width: 98%;
  text-align: center;
  &:hover {
    background-color: blue;
  }
`;

export default function HealthNavigatorMyAccount() {
  const { language } = useContext(LanguageContext);
  const lang = translations[language]?.HealthNavigatorMyAccount || {};

  const navigate = useNavigate();

  const defaultText = {
    Title: "My Account",
    AccountInfoTitle: "Account Information",
    AccountInfoDescription:
      "Here you can update your personal details and manage your account settings.",
    ChangePasswordButton: "Change Password",
    EditInfoButton: "Edit Information",
    ChangeEmailButton: "Change Email",
  };

  return (
    <BasicPageLayout title={lang.Title || defaultText.Title}>
      <CenteredContainer>
        <Button
          onClick={() =>
            navigate("/health_navigator/my_account/change_password")
          }
        >
          {lang.ChangePasswordButton || defaultText.ChangePasswordButton}
        </Button>

        <Button
          onClick={() => navigate("/health_navigator/my_account/edit_info")}
        >
          {lang.EditInfoButton || defaultText.EditInfoButton}
        </Button>

        <Button
          onClick={() => navigate("/health_navigator/my_account/change_email")}
        >
          {lang.ChangeEmailButton || defaultText.ChangeEmailButton}
        </Button>
      </CenteredContainer>
    </BasicPageLayout>
  );
}
