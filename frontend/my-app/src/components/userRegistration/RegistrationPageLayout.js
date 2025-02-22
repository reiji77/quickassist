import React from "react";
import styled from "styled-components";
import { useRef } from "react";
import translations from "../../assets/translations.json";
import { LanguageContext } from "../../App";
import { useContext } from "react";

export const BasicFlexBox = styled.div`
  min-height: 100vh;
  background-color: #c6e8d6;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  box-sizing: border-box;

  padding: 10px;
  @media (min-width: 768px) {
    padding: 20px;
  }
`;

export const Header = styled.h3`
  text-align: center;
  @media (min-width: 600px) {
    font-size: 20px;
  }
  @media (min-width: 1000px) {
    font-size: 35px;
  }
`;

export const ChildrenContainer = styled.div`
  height: 80%;

  line-height: 2.5;

  font-weight: bold;

  @media (min-width: 600px) {
    font-size: 22px;
  }
  @media (min-width: 1000px) {
    font-size: 25px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 20px;
`;

export const NextButton = styled.button`
  background-color: ${(props) => (props.cancel ? "#ff4d4d" : "#0277bd")};
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 30px;
  margin-top: 20px;

  width: 20%;

  @media (min-width: 768px) {
    font-size: 15px;
    padding: 20px;
  }
`;

export const BackButton = styled.button`
  background-color: ${(props) => (props.cancel ? "#ff4d4d" : "#0277bd")};
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: max-content;
  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

function RegistrationPageLayout({
  children,
  title,
  onNext,
  onBack,
  contentRef,
}) {
  const { language } = useContext(LanguageContext);
  const lang = translations[language];
  return (
    <BasicFlexBox ref={contentRef}>
      {onBack && (
        <BackButton onClick={onBack}>
          {lang ? lang.RegistrationPageLayout.Back : "Back"}
        </BackButton>
      )}
      <Header>{title}</Header>
      <ChildrenContainer>
        <>{children}</>

        {onNext && (
          <NextButton onClick={onNext}>
            {lang ? lang.RegistrationPageLayout.Next : "Next"}
          </NextButton>
        )}
      </ChildrenContainer>
    </BasicFlexBox>
  );
}

export default RegistrationPageLayout;
