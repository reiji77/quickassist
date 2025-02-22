import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "peerjs";
import config from "../config";
import styled from "styled-components";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { UserDetailsInfo } from "./EmergencyChat";
const FlexDiv = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #c6e8d6;
  flex-direction: column;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  gap: 5px;
`;
const VideoContainer = styled.div`
  height: 50%;
  position: relative;
`;
const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: black;
`;
const EndButtonContainer = styled.span`
  position: absolute;
  bottom: 0px;

  left: 0px;
  width: 100%;
  display: flex;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
`;
export default function EmergencyVideoCall() {
  const otherUserVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const { state } = useLocation();
  const roomId = state && state.roomId;
  const userDetails = state && state.userDetails;
  window.history.replaceState({}, "");
  const mediaStreams = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const videoCall = async () => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      mediaStreams.current.push(mediaStream);
      currentUserVideoRef.current.srcObject = mediaStream;
      currentUserVideoRef.current.play().catch((error) => {
        console.error(error);
      });
      if (!peerRef.current) {
        peerRef.current = new Peer();
      }
      if (!socketRef.current) {
        socketRef.current = io(`${config.SERVER_URL}/video_call`, {
          query: {
            auth_token: localStorage.getItem("auth_token"),
            room_id: roomId,
          },
          withCredentials: true,
        });
      }
      socketRef.current.connect();
      socketRef.current.on("connect", () => {});
      peerRef.current.on("open", (id) => {
        socketRef.current.emit("send_peer_id", { peer_id: id });
      });
      peerRef.current.on("call", (call) => {
        call.answer(mediaStream);
        call.on("stream", function (remoteStream) {
          if (!otherUserVideoRef.current.srcObject) {
            otherUserVideoRef.current.srcObject = remoteStream;
            mediaStreams.current.push(remoteStream);

            otherUserVideoRef.current.play().catch((error) => {
              console.error(error);
            });
          }
        });
      });

      socketRef.current.on("receive_remote_peer_id", (data) => {
        if (!otherUserVideoRef.current.srcObject) {
          const call = peerRef.current.call(data["peer_id"], mediaStream);

          call.on("stream", (remoteStream) => {
            otherUserVideoRef.current.srcObject = remoteStream;
            mediaStreams.current.push(remoteStream);

            otherUserVideoRef.current.play().catch((error) => {
              console.error(error);
            });
          });
        }
      });
      socketRef.current.on("connect_error", (err) => {});

      socketRef.current.on("other_user_disconnected", () => {
        navigate("/");
      });
    };
    if (state) {
      videoCall();
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        if (peerRef.current) {
          peerRef.current.disconnect();
          peerRef.current = null;
        }

        mediaStreams.current.forEach((m) => {
          m.getTracks().forEach(function (track) {
            track.stop();
          });
        });
        mediaStreams.current = [];
      };
    }
  }, []);
  if (state === null) {
    return <Navigate to={"/"}></Navigate>;
  }
  return (
    <FlexDiv>
      <UserDetailsInfo userDetails={userDetails}></UserDetailsInfo>
      <VideoContainer>
        <Video ref={otherUserVideoRef} />
      </VideoContainer>
      <VideoContainer>
        <Video ref={currentUserVideoRef} />

        <EndButtonContainer>
          <CallEndIcon
            onClick={() => {
              navigate("/");
            }}
            sx={{ color: "red", fontSize: "60px", cursor: "pointer" }}
          />
        </EndButtonContainer>
      </VideoContainer>
    </FlexDiv>
  );
}
