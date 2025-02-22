import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import translations from "../assets/translations.json";
import { LanguageContext } from "../App";

export default function EmergencyRequestOption({
  showEmergencyRequestOption,
  setShowEmergencyRequestOption,
}) {
  const { language } = useContext(LanguageContext);
  const lang = translations[language];
  const navigate = useNavigate();
  return (
    <Dialog
      open={showEmergencyRequestOption}
      onClose={() => {
        setShowEmergencyRequestOption(false);
      }}
    >
      <span
        onClick={() => {
          setShowEmergencyRequestOption(false);
        }}
        style={{
          position: "absolute",
          left: "5px",
          top: "3px",
          color: "grey",
          cursor: "pointer",
        }}
      >
        x
      </span>
      <DialogTitle>
        {lang ? lang.EmergencyRequestOption.DialogTitle : "Emergency Request"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {lang
            ? lang.EmergencyRequestOption.DialogContentText
            : `How would you like to be connected to one of our health navigators who knows ${localStorage.getItem("language_chosen")}?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <button
          onClick={() =>
            navigate("/user/emergency_request", {
              state: { mode: "chat" },
            })
          }
        >
          {lang ? lang.EmergencyRequestOption.ButtonTextChat : "Text Chat"}
        </button>
        <button
          onClick={() =>
            navigate("/user/emergency_request", {
              state: { mode: "video call" },
            })
          }
        >
          {lang ? lang.EmergencyRequestOption.ButtonVideoCall : "Video Call"}
        </button>
      </DialogActions>
    </Dialog>
  );
}
