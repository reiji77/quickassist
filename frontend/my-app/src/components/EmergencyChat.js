import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
import config from "../config";
import { io } from "socket.io-client";
import styled from "styled-components";
import translations from "../assets/translations.json";
import { LanguageContext } from "../App";

const FlexDiv = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #c6e8d6;
  flex-direction: column;
  box-sizing: border-box;
  display: flex;
  justify-content: start;
  position: relative;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #f1f1f1;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: start;
  font-size: 24px;
  border-right: 2px solid #ddd;
  position: fixed;
  left: -250px;
  top: 0;
  bottom: 0;
  transition: left 0.3s ease-in-out;
  z-index: 2;

  &:hover {
    left: 0;
  }
`;

const SidebarTab = styled.div`
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60px;
  background-color: #0277bd;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  font-size: 12px;
  cursor: pointer;
  border-radius: 0 5px 5px 0;
`;

const UserInfo = styled.div`
  overflow-y: scroll;
  height: 100%;
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

const Messages = styled.div`
  height: 90%;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
  font-size: 15px;
  @media (min-width: 1000px) {
    font-size: 20px;
  }
`;

const TextInput = styled.textarea`
  flex-grow: 1;
  font-size: 20px;
  width: 80%;
  box-sizing: border-box;
`;

const BottomContainer = styled.div`
  flex-grow: 1;
  display: flex;
`;

const EndButton = styled.div`
  background-color: red;
  color: white;
  font-size: 30px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
`;

const ReceivedMessages = styled.div`
  align-self: start;
  word-wrap: break-word;
  padding: 4px;
  background-color: #d8d8d8;
  border-radius: 5px;
  max-width: 80%;
  width: max-content;
`;

const SentMessages = styled.div`
  align-self: end;
  word-wrap: break-word;
  padding: 4px;
  background-color: #218aff;
  color: white;
  border-radius: 5px;
  max-width: 80%;
  width: max-content;
`;
export function UserDetailsInfo({ userDetails }) {
  const { language } = useContext(LanguageContext);
  const lang = translations[language];
  return (
    <Sidebar>
      <SidebarTab>{lang ? lang.EmergencyChat.SidebarTab : "Info"}</SidebarTab>
      <UserInfo>
        <>
          <div>
            <strong>{lang ? lang.EmergencyChat.UserName : "Name"}:</strong>{" "}
            {userDetails.first_name} {userDetails.last_name}
          </div>
          <div>
            <strong>
              {lang ? lang.EmergencyChat.UserLanguage : "Language"}:
            </strong>{" "}
            {userDetails.language}
          </div>
          <div>
            <strong>
              {lang
                ? lang.EmergencyChat.UserMedicalConditions
                : "Medical Conditions"}
              :
            </strong>{" "}
            {userDetails.current_medical_conditions || "..."}
          </div>
          <div>
            <strong>
              {lang ? lang.EmergencyChat.UserMedications : "Medications"}:
            </strong>{" "}
            {userDetails.current_medications || "..."}
          </div>
          <div>
            <strong>
              {lang
                ? lang.EmergencyChat.UserOtherInfo
                : "Other Medical Information"}
              :
            </strong>{" "}
            {userDetails.other_medical_info || "..."}
          </div>
          <div>
            <strong>Address: </strong> {userDetails.address}
            {", "}
            {userDetails.suburb}
            {", "} {userDetails.postcode}
          </div>
          <div>
            <strong>Sex: </strong> {userDetails.sex}
          </div>
          <div>
            <strong>DOB: </strong> {userDetails.DOB}
          </div>
        </>
      </UserInfo>
    </Sidebar>
  );
}
export default function EmergencyChat() {
  const { state } = useLocation();
  const roomId = state && state.roomId;
  const userDetails = state && state.userDetails;
  window.history.replaceState({}, "");
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const ref = useRef(null);
  const socketRef = useRef(null);
  const { language } = useContext(LanguageContext);
  const lang = translations[language];

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  });

  useEffect(() => {
    if (state) {
      if (!socketRef.current) {
        socketRef.current = io(`${config.SERVER_URL}/chat`, {
          query: {
            auth_token: localStorage.getItem("auth_token"),
            room_id: roomId,
          },
          withCredentials: true,
          autoConnect: false,
        });
      }

      socketRef.current.on("connect_error", (err) => {});

      socketRef.current.connect();

      socketRef.current.on("receive_message", (data) => {
        setMessages((messages) => {
          return [
            ...messages,
            {
              content: data["message"],
              received: true,
              senderName: data["sender_name"],
            },
          ];
        });
      });
      socketRef.current.on("other_user_disconnected", () => {
        console.log("other user disconnected");
        navigate("/");
      });
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, []);
  if (state === null) {
    return <Navigate to={"/"}></Navigate>;
  }
  return (
    <FlexDiv>
      <UserDetailsInfo userDetails={userDetails} />
      <Messages ref={ref}>
        {messages.map((message, i) => {
          if (message.received) {
            return (
              <div key={i}>
                <span style={{ fontSize: "15px" }}>{message.senderName}</span>
                <ReceivedMessages>{message.content}</ReceivedMessages>
              </div>
            );
          } else {
            return <SentMessages key={i}>{message.content}</SentMessages>;
          }
        })}
      </Messages>
      <BottomContainer>
        <TextInput
          placeholder={"..."}
          value={message}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              socketRef.current.emit("send_message", { message: message });
              messages.push({
                content: message,
                received: false,
              });
              setMessages([...messages]);

              setMessage("");
            }
          }}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        ></TextInput>
        <EndButton onClick={() => navigate("/")}>
          {lang ? lang.EmergencyChat.ButtonEnd : "End"}
        </EndButton>
      </BottomContainer>
    </FlexDiv>
  );
}
