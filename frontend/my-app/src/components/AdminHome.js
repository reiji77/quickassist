import BasicPageLayout from "./BasicPageLayout";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const FlexDiv = styled.div`
  height: 100%;
  width: 100%;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 10px;
  height: min-content;
  align-items: center;
`;

const RegisterHealthNav = styled.div`
  background-color: #ebebeb;
  color: rgb(98, 111, 134);
  font-size: 20px;
  padding: 10px;
  border: solid #000;
  box-sizing: border-box;
  border-width: 1px;
  font-weight: 600;
  cursor: pointer;
  width: 98%;
  text-align: center;
  &:hover {
    background-color: #e0e0e0;
  }
  @media (min-width: 800px) {
    font-size: 25px;
  }
`;
export default function AdminHome() {
  const navigate = useNavigate();
  return (
    <BasicPageLayout>
      <FlexDiv>
        <RegisterHealthNav
          onClick={() => {
            navigate("/admin/register-health-navigator");
          }}
        >
          REGISTER HEALTH NAVIGATOR
        </RegisterHealthNav>
      </FlexDiv>
    </BasicPageLayout>
  );
}
