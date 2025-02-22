import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import BasicPageLayout from "./BasicPageLayout";
import styled from "styled-components";
import translations from "../assets/translations.json";
import { LanguageContext } from "../App";

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

export default function HealthOrgMyAccount() {
  const { language } = useContext(LanguageContext);
  const lang = translations[language]?.HealthOrgMyAccount || {
    Title: "Health Organization Account",
    EditInfoButton: "Edit Information",
    ChangePasswordButton: "Change Password",
    ChangeEmailButton: "Change Email",
  };

  const navigate = useNavigate();

  const handleEditInfo = () => {
    navigate("/health_org/my_account/edit_info");
  };

  const handleChangePassword = () => {
    navigate("/health_org/my_account/change_password");
  };

  const handleChangeEmail = () => {
    navigate("/health_org/my_account/change_email");
  };

  return (
    <BasicPageLayout title={lang.Title}>
      <CenteredContainer>
        <Button onClick={handleEditInfo}>{lang.EditInfoButton}</Button>

        <Button onClick={handleChangePassword}>
          {lang.ChangePasswordButton}
        </Button>

        <Button onClick={handleChangeEmail}>{lang.ChangeEmailButton}</Button>
      </CenteredContainer>
    </BasicPageLayout>
  );
}
