import { Outlet, useNavigate } from "react-router-dom";
import { createContext, useState, useEffect, useContext } from "react";
import config from "../config";
import { io } from "socket.io-client";

export const HealthNavContext = createContext();

export default function HealthNavigator() {
  const [healthNavContext, setHealthNavContext] = useState({
    liveRequests: [],
  });
  const navigate = useNavigate();
  useEffect(() => {
    const healthNavSocket = io(`${config.SERVER_URL}/health_navigator`, {
      // /health_navigator namespace
      query: { auth_token: localStorage.getItem("auth_token") },
      withCredentials: true,
      autoConnect: false,
    });
    healthNavSocket.connect();
    healthNavSocket.on("connect", () => {
      healthNavSocket.emit("get_requests", (ackData) => {
        healthNavContext.liveRequests = ackData["requests"];
        setHealthNavContext({ ...healthNavContext });
      });
    });
    healthNavSocket.on("new_request", (data) => {
      healthNavContext.liveRequests.push(data);
      setHealthNavContext({ ...healthNavContext });
    });
    healthNavSocket.on("remove_request", (data) => {
      const updatedRequests = healthNavContext.liveRequests.filter(
        (request) => request["request_id"] !== data["request_id"]
      );
      healthNavContext.liveRequests = updatedRequests;

      setHealthNavContext({ ...healthNavContext });
    });

    return () => {
      healthNavSocket.off();
      healthNavSocket.disconnect();
    };
  }, []);
  return (
    <HealthNavContext.Provider
      value={{ healthNavContext, setHealthNavContext }}
    >
      <Outlet />
    </HealthNavContext.Provider>
  );
}
