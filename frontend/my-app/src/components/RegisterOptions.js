import styled from "styled-components";
import { Navigate, useNavigate } from "react-router-dom";
import { LanguageContext } from "../App";
import { useContext } from "react";
import translations from "../assets/translations.json";
const FlexWrapper = styled.div`
  min-height: 100vh;
  background-color: #c6e8d6;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;

  box-sizing: border-box;
  padding-top: 30px;
  padding-bottom: 30px;
  padding-left: 20px;
  padding-right: 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;
const OptionButton = styled.button`
  width: 280px;
  cursor: pointer;
  font-size: 20px;
  border-radius: 15px;
  font-weight: bold;
  border-width: 0px;
  background-color: #0d99ff;
  color: white;
  &:hover {
    background-color: blue;
  }
  @media (min-width: 600px) {
    width: 400px;
    font-size: 25px;
  }
  @media (min-width: 1000px) {
    width: 500px;
  }
`;
const BackButton = styled.button`
  background-color: #0277bd;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  align-self: flex-start;
  margin-bottom: 20px;
  font-size: 15px;
  position: fixed;
  top: 20px;
`;
const Title = styled.h2`
  justify-self: start;
`;
export default function RegisterOptions() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const lang = translations[language];
  return (
    <FlexWrapper>
      <BackButton
        onClick={() => {
          navigate(-1);
        }}
      >
        {lang ? lang.RegisterOptions.Back : "Back"}
      </BackButton>
      <Title>
        {lang ? lang.RegisterOptions.title : "Choose account type to register"}
      </Title>
      <OptionButton
        onClick={() => {
          navigate("/registration");
        }}
      >
        {lang ? lang.UserTypes["User"] : "User"}
      </OptionButton>
      <OptionButton
        onClick={() => {
          navigate("/health_org_registration");
        }}
      >
        {lang ? lang.UserTypes["Health Organisation"] : "Health Organisation"}
      </OptionButton>
      <OptionButton
        onClick={() => {
          navigate("/admin_registration");
        }}
      >
        {lang ? lang.UserTypes["Admin"] : "Admin"}
      </OptionButton>
    </FlexWrapper>
  );
}
