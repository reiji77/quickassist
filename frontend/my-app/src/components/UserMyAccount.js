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

export default function UserMyAccount() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const lang = translations[language]?.UserMyAccount || {
    Title: "My Account",
    ChangePasswordButton: "Change Password",
    EditInfoButton: "Edit Information",
    ChangeEmailButton: "Change Email",
  };

  const handleEditInfo = () => {
    navigate("/user/my_account/edit_info");
  };

  const handleChangePassword = () => {
    navigate("/user/my_account/change_password");
  };

  const handleChangeEmail = () => {
    navigate("/user/my_account/change_email");
  };

  return (
    <BasicPageLayout title={lang.Title}>
      <CenteredContainer>
        <Button onClick={handleChangePassword}>
          {lang.ChangePasswordButton}
        </Button>

        <Button onClick={handleEditInfo}>{lang.EditInfoButton}</Button>

        <Button onClick={handleChangeEmail}>{lang.ChangeEmailButton}</Button>
      </CenteredContainer>
    </BasicPageLayout>
  );
}
