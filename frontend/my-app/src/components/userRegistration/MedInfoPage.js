import React, { useState, useContext } from "react";
import { UserContext } from "../UserContext";
import translations from "../../assets/translations.json";
import { LanguageContext } from "../../App";

// Styled components
import styled from "styled-components";

const InputGroup = styled.div`
  margin-bottom: 15px;
  width: 80%;
  max-width: 800px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  resize: none;
  height: 100px;
  @media (min-width: 768px) {
    font-size: 16px;
  }
  box-sizing: border-box;
`;

function MedInfoPage({ data, onChange }) {
  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };
  const { language } = useContext(LanguageContext);
  const lang = translations[language];

  return (
    <form>
      <InputGroup>
        <Label htmlFor="conditions">
          {lang
            ? lang.MedInfoPage.CurrentMedConds
            : "Current medical conditions"}
        </Label>
        <Textarea
          id="conditions"
          name="current_medical_conditions"
          value={data.current_medical_conditions || ""}
          onChange={handleChange}
        ></Textarea>
      </InputGroup>
      <InputGroup>
        <Label htmlFor="medications">
          {lang ? lang.MedInfoPage.CurrentMeds : "Current medications"}
        </Label>
        <Textarea
          id="medications"
          name="current_medications"
          value={data.current_medications || ""}
          onChange={handleChange}
        ></Textarea>
      </InputGroup>
      <InputGroup>
        <Label htmlFor="otherInfo">
          {lang ? lang.MedInfoPage.OtherMedInfo : "Other medical information"}
        </Label>
        <Textarea
          id="otherInfo"
          name="other_medical_info"
          value={data.other_medical_info || ""}
          onChange={handleChange}
        ></Textarea>
      </InputGroup>
    </form>
  );
}

export default MedInfoPage;
