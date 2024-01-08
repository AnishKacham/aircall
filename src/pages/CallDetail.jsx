import { Button } from "@mui/material";
import { Box, Card, Dialog, IconButton, Slide } from "@mui/material";
import React, { useEffect, useState } from "react";
import Close from "@mui/icons-material/Close";

import Boundary from "../components/Boundary.jsx";
import ArrowCircleDownTwoToneIcon from '@mui/icons-material/ArrowCircleDownTwoTone';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import { AccessTimeTwoTone, Archive, CalendarMonth, CallMissed, Unarchive, VoicemailTwoTone } from "@mui/icons-material";
import DoneIcon from '@mui/icons-material/Done';

export default function CallDetail(props){
  const [calldetails,setCallDetails] = useState({});
  const [fetchState,setFetchState] = useState("loading");
  const {open,setOpen,callId} = props

  useEffect(()=>{
    fetch(`https://cerulean-marlin-wig.cyclic.app/activities/${callId}`)
    .then(res=>res.json())
    .then((call)=>{
      setCallDetails(call)
      setFetchState("success");
    })
    .catch(err=>{
      console.log(error);
      setFetchState("failed");
    })
  },[])

  const handleDetailsClose = () => {
    setOpen(false);
    setCallDetails({});
  }


  const handleArchiveUnarchive = () => {
    if(calldetails.is_archived === true){
      fetch(`https://cerulean-marlin-wig.cyclic.app/activities/${callId}`,{
        headers: {
          "Content-Type": "application/json"
        },
        method: 'PATCH',
        body: JSON.stringify({
          "is_archived": false
      })
    })
      .then((res)=>{
        if(res.status===200){
          let clone = Object.assign({},calldetails);
          clone.is_archived = false;
          setCallDetails(clone);
        }
        else throw Error("Status not 200")
      })
      .catch(err=>{

        console.log("FAILED TO UNARCHIVE");
        console.log(err)
      })
    }
    else{
      fetch(`https://cerulean-marlin-wig.cyclic.app/activities/${callId}`,{
        headers: {
          "Content-Type": "application/json"
        },
        method: 'PATCH',
        body: JSON.stringify({
          "is_archived": true
        })
      })
      .then((res)=>{
        if(res.status===200){
          let clone = Object.assign({},calldetails);
          clone.is_archived = true;
          setCallDetails(clone);
        }
        else throw Error("Status not 200")
      })
      .catch(err=>{
        console.log("FAILED TO ARCHIVE");
        console.log(err);
      })
    }
  }
  

  return(
    <Dialog
    open={open}
    >
      <Box style={{
        width: "376px",
        height: "666px",
      }}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        }}>
          <IconButton onClick={handleDetailsClose} size="small">
            <Close/>
          </IconButton>
        </div>
        {fetchState != 'success' && <Boundary fetchState={fetchState}/>}

        {fetchState==='success' && <div style={{
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>

        <Card variant="outlined" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          borderStyle: "2px solid black",
          fontSize: "large",
          padding: "15px",
          gap: "10px",
          color: "black"
        }}>
          <div>{calldetails.from}</div>
          <ArrowCircleDownTwoToneIcon color="primary"/>
          <div>{calldetails.via}</div>
          <ArrowCircleDownTwoToneIcon color="primary"/>
          <div>{calldetails.to}</div>
          <div style={{
            alignSelf: "flex-start",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            {
              calldetails.call_type === 'missed' && calldetails.direction === 'inbound' && <div style={{
                alignSelf: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <CallMissed/>
                <span>Missed</span>
              </div>
              
            }
            
            {
              calldetails.call_type === 'voicemail' && <div style={{
                alignSelf: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <VoicemailTwoTone/>
                <span>Voicemail</span>
              </div>
            }

            {
              calldetails.call_type === 'answered' && <div style={{
                alignSelf: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <DoneIcon/>
                <span>Answered</span>
              </div>
            }            
          </div>

          
          <div style={{
                alignSelf: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <CalendarMonth color="primary"/>
                <span>{(()=>{
                  const date = new Date(calldetails.created_at);
                  return date.toLocaleDateString('default', { month: 'long' }) + " " + date.getDate() + ", " + date.getFullYear();
                })()}</span>
          </div>

          <div style={{
                alignSelf: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <AccessTimeTwoTone color="primary"/>
                <span>{(()=>{
                  const date = new Date(calldetails.created_at);
                  return date.toLocaleTimeString();
                })()}</span>
          </div>

          <div style={{
            alignSelf: "flex-start",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}><TimelapseIcon color="primary"/> {Math.floor(calldetails.duration / 3600)}h {Math.floor(calldetails.duration % 60)}m</div>
          


          {
            calldetails.is_archived === true ?
            <Button color="success" variant="contained" endIcon={<Unarchive/>} onClick={handleArchiveUnarchive}>
              Unarchvie
            </Button>
            :<Button color="error" variant="contained" endIcon={<Archive/>} onClick={handleArchiveUnarchive}>
              Archive
            </Button>
          }

        </Card>
        </div>}
      </Box>

    </Dialog>
  )
}