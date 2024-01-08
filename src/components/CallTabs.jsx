import React, {useState} from "react";
import { Tab, Tabs,  } from "@mui/material";

export default function CallTabs(props){
  const {tabIndex,changeTabIndex} = props;
  const handleTabSwitch = (e,newTabIndex) => {
    console.log(newTabIndex);
    changeTabIndex(newTabIndex);
  }

  return <Tabs TabIndicatorProps={{style: {background:'green',}}} textColor="inherit" value={tabIndex} onChange={handleTabSwitch} variant="fullWidth">
    <Tab label="Calls Activity"/>
    <Tab label="Archvied"/>
  </Tabs>
}