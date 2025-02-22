import { useContext } from "react";
import styled from "styled-components";
import BasicPageLayout from "./BasicPageLayout";
import { useNavigate, useLocation } from "react-router-dom";
import config from "../config";
import translations from "../assets/translations.json";
import { LanguageContext } from "../App";
import supportedLanguages from "../assets/supported_languages.json";

const FlexDiv = styled.div`
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 10px;
  align-items: center;
`;

const Label = styled.div`
  background-color: #0277bd;
  color: white;
  font-size: 20px;
  padding: 8px 10px;
  border-radius: 10px;
  margin-top: 20px;
  text-align: center;
  width: 98%;
`;

const ChangeLanguageButton = styled.select`
  width: 98%;
  padding: 10px;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  margin-top: 10px;
  background-color: #0277bd;
  color: white;
  text-align: center;
  cursor: pointer;

  &:hover {
    background-color: #005bb5;
  }
`;

const SignOutButton = styled.div`
  background-color: red;
  color: white;
  font-size: 30px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  width: 98%;
  text-align: center;
  &:hover {
    background-color: darkred;
  }
`;

export default function UserSettings() {
  const { language, setLanguage } = useContext(LanguageContext);

  const location = useLocation();
  const navigate = useNavigate();
  const splitPaths = location.pathname.split("/");
  const userType = splitPaths[1];

  const handleLanguageChange = (e) => {
    localStorage.setItem("language_chosen", e.target.value);
    setLanguage(e.target.value); // Update language context with the selected key
  };

  async function handleClickSignOutButton() {
    const response = await fetch(`${config.SERVER_URL}/user/log-out`, {
      method: "POST",
      body: JSON.stringify({
        auth_token: localStorage.getItem("auth_token"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (response.ok) {
      localStorage.removeItem("auth_token");
      navigate("/");
    } else {
      console.error("Error signing out");
    }
  }

  return (
    <BasicPageLayout>
      <FlexDiv>
        <SignOutButton onClick={handleClickSignOutButton}>
          {translations[language]?.UserSettings?.SignOutButton || "Sign Out"}
        </SignOutButton>
        {userType !== "user" && (
          <>
            <Label>
              {translations[language]?.UserSettings?.DisplayedLanguage ||
                "Displayed Language"}
            </Label>
            <ChangeLanguageButton
              value={language}
              onChange={handleLanguageChange}
            >
              {supportedLanguages.map(([langName, langDisplay]) => (
                <option key={langName} value={langName}>
                  {`${langName} | ${langDisplay}`}
                </option>
              ))}
            </ChangeLanguageButton>
          </>
        )}
      </FlexDiv>
    </BasicPageLayout>
  );
}
