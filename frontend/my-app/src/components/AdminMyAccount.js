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

export default function AdminMyAccount() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);

  const lang = translations[language]?.AdminMyAccount || {
    Title: "Admin Account",
    EditInfoButton: "Edit Information",
    ChangeEmailButton: "Change Email",
    ChangePasswordButton: "Change Password",
  };

  const handleEditInfo = () => {
    navigate("/admin/my_account/edit_info");
  };

  const handleChangeEmail = () => {
    navigate("/admin/my_account/change_email");
  };

  const handleChangePassword = () => {
    navigate("/admin/my_account/change_password");
  };

  return (
    <BasicPageLayout title={lang.Title}>
      <CenteredContainer>
        <Button onClick={handleEditInfo}>{lang.EditInfoButton}</Button>

        <Button onClick={handleChangeEmail}>{lang.ChangeEmailButton}</Button>

        <Button onClick={handleChangePassword}>
          {lang.ChangePasswordButton}
        </Button>
      </CenteredContainer>
    </BasicPageLayout>
  );
}
