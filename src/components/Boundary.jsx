import { CircularProgress, Skeleton } from "@mui/material";
import React from "react";

const renderElement = (fetchState) => {
  if(fetchState==='failed') return <span>Oh no, something went wrong :/</span>

  return <div style={{
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  }}>
    {[...Array(7)].map((x, i) =>
    <Skeleton key={i} variant="rounded" width={"100%"} height={60}/>
  )}
  </div>
}

export default function Boundary({fetchState}){
  return (<div className="boundary">
    {renderElement(fetchState)}
  </div>)  
}