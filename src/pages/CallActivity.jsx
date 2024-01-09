import React, {useEffect,useState} from "react"
import Boundary from "../components/Boundary.jsx";
import { Chip, Button, Card, IconButton, Stack, Snackbar, Alert } from "@mui/material";
import NorthWestIcon from '@mui/icons-material/NorthWest';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArchiveTwoToneIcon from '@mui/icons-material/ArchiveTwoTone';
import _ from 'lodash';
import CallDetail from "./CallDetail.jsx";
import { InfoTwoTone } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import Snack from "../components/Snack.jsx";



const CallActivity = (props)=>{
  const [fetchState,setFetchState] = useState("loading");
  const [callsList,setCalls] = useState({});
  const [rawCallsList,setRawCallsList] = useState([]);
  const [detailsOpen,setDetailsOpen] = useState(false);
  const [selectedId,setSelectedId] = useState(0);
  const [archiveAllLoading,setArchvieAllLoading] = useState(false);
  const [snackBarOpen,setSnackBarContent] = useState({
    open: false,
    severity: "error",
    message: ""
  });

  useEffect(()=>{
    fetch("https://cerulean-marlin-wig.cyclic.app/activities")
    .then(res => res.json())
    .then(calls => {
      setRawCallsList(calls);
      setCalls(prepareForRender(calls,false))
      setFetchState("success")
    })
    .catch(err=>{
      console.error(err);
      setFetchState("failed")
    })
  },[detailsOpen])

  const handleSnackBarClose = () => {
    setSnackBarContent(_.assign({},snackBarOpen,{open:false}));
  }

  const prepareForRender = (rawcalls,arhived) =>
    _.chain(rawcalls)
          .filter({'is_archived':arhived})
          .orderBy('created_at','desc')
          .groupBy((record)=>{
          const date = new Date(record.created_at)
          return date.toLocaleDateString('default', { month: 'long' }) + " " + date.getDate() + ", " + date.getFullYear();
          })
          .value()

  const handleCallDetailClick = (selectedId)=>{
    setSelectedId(selectedId);
    setDetailsOpen(true);
  }

  const handleArchiveAll = () => {
    setArchvieAllLoading(true);
    Promise.allSettled(_.map(rawCallsList,(call)=>{
      return fetch(`https://cerulean-marlin-wig.cyclic.app/activities/${call.id}`,{
        headers: {
          'Content-Type' : 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify({
          "is_archived": true
        })
      })
    }))
    .then(results=>{
      console.log(results)
      const notArchivedCalls = _.filter(rawCallsList,(call,index)=>{
        return (results[index].status==='fulfilled' && results[index].value.ok===false) || (results[index].status==='rejected')
      });
      console.log(notArchivedCalls);
      setRawCallsList(notArchivedCalls);
      setArchvieAllLoading(false);
      setCalls(prepareForRender(notArchivedCalls,false));
      if(notArchivedCalls.length > 0) setSnackBarContent({
        open: true,
        severity: "error",
        message: `Could not archvie ${notArchivedCalls.length} calls`
      })
  })
  }

  const handleArchive = (id) => {
    console.log(`archiving ${id} . . .`)
    fetch(`https://cerulean-marlin-wig.cyclic.app/activities/${id}`,{
        headers: {
          "Content-Type": "application/json"
        },
        method: 'PATCH',
        body: JSON.stringify({
          "is_archived": true
      })
    }).then((res)=>{
      if(res.status==200) {
        const unArchivedCalls = _.filter(rawCallsList,call=>call.id!=id);
        setCalls(prepareForRender(unArchivedCalls,false));
        setRawCallsList(unArchivedCalls);
        setSnackBarContent({
          open: true,
          severity: "success",
          message: `Archvied Call with id ${id}`
        })
      }
      else throw Error("Status not 200");
    })
    .catch(err=>{
      setSnackBarContent({
        open: true,
        severity: "error",
        message: `Could not archvie Call with ${id}`
      })
      console.log("ARCHIVE FAILED")
      console.log(err);
    })
  }

  if(fetchState!="success") return <Boundary fetchState={fetchState}/>
  return <Stack style={{
    display: "flex",
    padding: "20px",
    overflow: "auto",
    position: "relative",
    height: "100%",
    gap: "20px",
  }}>
    <LoadingButton loading={archiveAllLoading} loadingIndicator="Loading . . ." color="error" variant="contained" startIcon={<ArchiveTwoToneIcon/>} onClick={handleArchiveAll}>Archive All Calls</LoadingButton>
    {
      Object.entries(callsList).map(([key,value],i)=>{
        return <div key={i}>
          <div style={{
            width:"100%",
            textAlign: "center",
            fontWeight: "bolder"
            }}>
              {key}
          </div>
          <div style={{
            width: "100%",
            marginTop: "5px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            {
              value.map((rec,i)=>{
                let callColor = "gray"
                let timeChipStyle = "success"
                if(rec.direction==='inbound' && rec.call_type==='missed') {
                  callColor = "red";
                  timeChipStyle = "error";
                }

                let callTime = new Date(rec.created_at);

                return <Card key={i} variant="outlined" style={{
                  width: "100%",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  color: callColor,
                  gap: "10px"
                }}>
                    <div style={{display:"flex", alignItems: "center"}}>{
                      rec.direction==='outbound'?
                      <NorthWestIcon fontSize="small"/>
                      :<SouthEastIcon fontSize="small"/>
                    }</div>
                    <div style={{
                      fontSize: "larger"
                    }}>
                      {rec.direction==='outbound'? rec.to : rec.from}
                    </div>
                    
                    <div style={{alignSelf:"flex-end", marginLeft: "auto", display:"flex", alignItems:"center"}}>
                      <Chip variant="outlined" label={callTime.toLocaleTimeString()} color={timeChipStyle} size="small" icon={<AccessTimeIcon/>} />
                      <IconButton color={timeChipStyle} onClick={()=>{handleArchive(rec.id)}}>
                        <ArchiveTwoToneIcon/>
                      </IconButton>
                      <IconButton color={timeChipStyle} onClick={()=>{handleCallDetailClick(rec.id)}}>
                        <InfoTwoTone/>
                      </IconButton>
                    </div>
                  </Card>
              })
            }
          </div>
        </div> 
      })
    }
    {detailsOpen && <CallDetail open={detailsOpen} setOpen={setDetailsOpen} callId={selectedId}/>}
    <Snackbar
      open={snackBarOpen.open}
      autoHideDuration={3000}
      onClose={handleSnackBarClose}
      anchorOrigin={{horizontal: "center", vertical: "bottom"}}
      >
      <Alert onClose={handleSnackBarClose} severity={snackBarOpen.severity}>
        {snackBarOpen.message}
      </Alert>
    </Snackbar>
  </Stack>
}

export default CallActivity