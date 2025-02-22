import BasicPageLayout from "./BasicPageLayout";
import { UserContext } from "./UserContext";
import { HealthNavContext } from "./HealthNavigator";
import { useContext } from "react";
import styled from "styled-components";
import config from "../config";
import { useNavigate } from "react-router-dom";

const FlexDiv = styled.div`
  padding: 2px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;

  justify-content: start;
`;

const RequestWrapper = styled.div`
  display: flex;
  background-color: white;
  border: 2px solid black;
`;
const RequestInfo = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  width: 70%;
`;
const RequestAcceptButton = styled.div`
  flex-grow: 1;
  font-size: 14px;
  background-color: green;
  text-align: center;
  min-height: 100px;
  display: flex;
  font-weight: bold;
  justify-content: center;
  align-items: center;
  color: white;
  cursor: pointer;
  border-left: 2px solid black;
  @media (min-width: 700px) {
    font-size: 25px;
  }
  @media (min-width: 1000px) {
    font-size: 30px;
  }
`;

function Request({ data }) {
  const navigate = useNavigate();
  const handleClickAccept = async () => {
    const response = await fetch(
      `${config.SERVER_URL}/health_navigator/accept-request`,
      {
        method: "POST",
        body: JSON.stringify({
          request_id: data["request_id"],
          auth_token: localStorage.getItem("auth_token"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const json = await response.json();
    if (!response.ok) {
      if ("error_id" in json) {
        let error_id = json["error_id"];
        if (error_id === 2) {
          alert(
            "couldn't accept the request. Probably because it was canceled by the user or accepted by another health navigator"
          );
          return;
        }
      }
    } else {
      if (data["mode"] === "chat") {
        navigate("/health_navigator/emergency_chat", {
          state: {
            roomId: data["request_id"],
            userDetails: data["user_details"],
          },
        });
      } else if (data["mode"] === "video call") {
        navigate("/health_navigator/emergency_video_call", {
          state: {
            roomId: data["request_id"],
            userDetails: data["user_details"],
          },
        });
      }
    }
  };
  return (
    <RequestWrapper>
      <RequestInfo>
        <h2 style={{ margin: 0, overflowX: "scroll", whiteSpace: "nowrap" }}>
          {data["user_details"]["first_name"] +
            " " +
            data["user_details"]["last_name"]}
        </h2>
        <span>{"language: " + data["user_details"]["language"]}</span>
        <span>{"mode: " + data["mode"]}</span>
      </RequestInfo>
      <RequestAcceptButton onClick={handleClickAccept}>
        Accept
      </RequestAcceptButton>
    </RequestWrapper>
  );
}
export default function HealthNavigatorHome() {
  const { healthNavContext } = useContext(HealthNavContext);

  return (
    <BasicPageLayout>
      <FlexDiv>
        {healthNavContext.liveRequests.map((data) => {
          return <Request key={data["request_id"]} data={data} />;
        })}
      </FlexDiv>
    </BasicPageLayout>
  );
}
