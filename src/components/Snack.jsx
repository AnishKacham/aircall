import React from "react";
import { Snackbar, Alert } from "@mui/material";

export default function Snack({onClose,open,severity,message}){
  return <Snackbar
  open={open}
  autoHideDuration={3000}
  onClose={onClose}
  anchorOrigin={{horizontal: "center", vertical: "top"}}
  >
  <Alert onClose={handleSnackBarClose} severity={severity}>
    {message}
  </Alert>
</Snackbar>
}