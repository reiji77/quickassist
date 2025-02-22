import styled from "styled-components";

const FlexWrapper = styled.div`
  height: 100vh;
  width: 100vw;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  display: flex;
  z-index: 10000;
  background-color: #c6e8d6;
  position: fixed;
  left: 0;
  top 0;
  padding: 30px;
  box-sizing: border-box;
`;

export default function WaitingPage({ children }) {
  return <FlexWrapper>{children}</FlexWrapper>;
}
