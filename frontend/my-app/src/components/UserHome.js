import styled from "styled-components";
import BasicPageLayout from "./BasicPageLayout";

import { useState, useContext } from "react";
import EmergencyRequestOption from "./EmergencyRequestOption";
import translations from "../assets/translations.json";
import { LanguageContext } from "../App";

const FlexDiv = styled.div`
  height: 100%;
  width: 100%;

  box-sizing: border-box;
  display: flex;

  align-items: center;
  justify-content: center;
`;

const EmergencyButton = styled.button`
  width: 50%;
  aspect-ratio: 100/50;
  font-size: 20px;
  cursor: pointer;
  background-color: #FFCD29;
  font-weight: bold;
  border-radius: 10px;
  border-width: 0px;
   @media (min-width: 800px) {
   width: 40%;
  }
   border-width: 0px;
   @media (min-width: 1200px) {
   font-size: 30px;
  }
  
  }
`;

export default function UserHome() {
  const { language } = useContext(LanguageContext);
  const lang = translations[language];

  const [showEmergencyRequestOption, setShowEmergencyRequestOption] =
    useState(false);
  return (
    <BasicPageLayout>
      <FlexDiv>
        <EmergencyButton onClick={() => setShowEmergencyRequestOption(true)}>
          {lang
            ? lang.UserHome.EmergencyButton
            : "Request Emergency Assistance"}
        </EmergencyButton>
      </FlexDiv>
      <EmergencyRequestOption
        {...{ showEmergencyRequestOption, setShowEmergencyRequestOption }}
      />
    </BasicPageLayout>
  );
}
