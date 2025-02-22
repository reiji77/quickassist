import styled from "styled-components";
import { languageBubbleImage } from "../assets/language-bubble-image";
import supportedLanguages from "../assets/supported_languages.json";
import { LanguageContext } from "../App";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const FlexWrapper = styled.div`
  height: 100vh;
  background-color: #c6e8d6;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  align-items: center;
  box-sizing: border-box;
  padding-top: 30px;
  padding-bottom: 30px;

  @media (min-height: 1000px) {
    padding-top: 60px;
  }
`;

const SpeechBubbleImage = styled.img`
  width: 150px;
  margin-bottom: 20px;
  @media (min-width: 1000px) {
    width: 200px;
  }
  @media (min-width: 1600px) {
    width: 230px;
  }
`;

const LanguagesContainer = styled.div`
  flex-grow: 1;
  display: flex;
  overflow-y: scroll;
  align-items: center;
  justify-content: start;
  flex-direction: column;
  gap: 20px;
`;

const LanguageButton = styled.button`
  width: 280px;
  cursor: pointer;
  font-size: 20px;
  border-radius: 15px;
  font-weight: bold;
  border-width: 0px;
  &:hover {
    background-color: lightgrey;
  }
  @media (min-width: 600px) {
    width: 400px;
    font-size: 25px;
  }
  @media (min-width: 1000px) {
    width: 500px;
  }
`;

export default function LanguageSelectionPage() {
  const { setLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();

  function handleClickLanguage(e) {
    const selectedLanguage = e.target.name;
    localStorage.setItem("language_chosen", selectedLanguage);
    setLanguage(selectedLanguage);
    navigate("/login");
  }

  return (
    <FlexWrapper>
      <SpeechBubbleImage src={languageBubbleImage} />
      <LanguagesContainer>
        {supportedLanguages.map((language) => {
          return (
            <LanguageButton
              key={language[0]}
              onClick={handleClickLanguage}
              name={language[0]}
            >
              {language[0] + " |  " + language[1]}
            </LanguageButton>
          );
        })}
      </LanguagesContainer>
    </FlexWrapper>
  );
}
