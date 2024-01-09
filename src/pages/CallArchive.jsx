import React, {useEffect,useState} from "react"
import Boundary from "../components/Boundary.jsx";
import { Chip, Button, Card, IconButton, Stack, Snackbar, Alert } from "@mui/material";
import NorthWestIcon from '@mui/icons-material/NorthWest';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UnarchiveTwoToneIcon from '@mui/icons-material/UnarchiveTwoTone';
import _ from 'lodash';
import { InfoTwoTone } from "@mui/icons-material";
import CallDetail from "./CallDetail.jsx";

const CallActivity = (props)=>{
  const [fetchState,setFetchState] = useState("loading");
  const [callsList,setCalls] = useState({});
  const [rawCallsList,setRawCallsList] = useState([]);
  const [detailsOpen,setDetailsOpen] = useState(false);
  const [selectedId,setSelectedId] = useState(0);
  const [snackBarState,setSnackBarState] = useState({
    open: false,
    message: "",
    severity: "success"
  })

  const handleSnackBarClose = () => {
    setSnackBarState(_.assign({},snackBarState,{open:false}));
  }

  useEffect(()=>{
    fetch("https://cerulean-marlin-wig.cyclic.app/activities")
    .then(res => res.json())
    .then(calls => {
      setRawCallsList(calls);
      const modifiedData = _.chain(calls).filter({'is_archived':true}).orderBy('created_at','desc').groupBy((record)=>{
        const date = new Date(record.created_at)
        return date.toLocaleDateString('default', { month: 'long' }) + " " + date.getDate() + ", " + date.getFullYear();
      }).value()
      console.log(modifiedData)
      setCalls(modifiedData)
      setFetchState("success")
    })
    .catch(err=>{
      console.error(err);
      setFetchState("failed")
    })
  },[detailsOpen])

  const handleCallDetailClick = (selectedId)=>{
    setSelectedId(selectedId);
    setDetailsOpen(true);
  }

  const handleUnarchvieAll = () => {
    console.log("Un Archiving all calls . . .");
    fetch(`https://cerulean-marlin-wig.cyclic.app/reset`,{
        method: "PATCH",
        headers:{
          'Content-type': 'application/json; charset=UTF-8',
        }
      })
      .then((res)=>{
        if(res.status===200){
          setCalls({});
          setRawCallsList([]);
          setSnackBarState({open:true,message:"Unarchived all calls",severity:"success"});
        }
        else throw Error("Status not 200")        
      })
      .catch(err=>{
        setSnackBarState({open:true,message:"Failed to unarchvie ll calls",severity:"error"});
        console.log("FAILED TO UNARCHIVE ALL CALLS");
        console.log(err);
      })
  }

  const handleUnarchive = (id) => {
    console.log(`un archiving ${id} . . .`)
    fetch(`https://cerulean-marlin-wig.cyclic.app/activities/${id}`,{
        headers: {
          "Content-Type": "application/json"
        },
        method: 'PATCH',
        body: JSON.stringify({
          "is_archived": false
      })
    }).then(res=>{
      if(res.status===200){
        setCalls(
          _.chain(rawCallsList).filter((call)=>call.id!=id)
          .filter({'is_archived':true})
          .orderBy('created_at','desc')
          .groupBy((record)=>{
          const date = new Date(record.created_at)
          return date.toLocaleDateString('default', { month: 'long' }) + " " + date.getDate() + ", " + date.getFullYear();
          })
          .value()
        );
        setRawCallsList(_.filter(rawCallsList,(call)=>call.id!=id));
        setSnackBarState({open:true,message:`Unarchived call with id ${id}`,severity:"success"});
      }
      else throw Error("Status not 200");
    })
    .catch(err=> {
      setSnackBarState({open:true,message:`Failed to unarchive call with id ${id}`,severity:"error"});
      console.log(`FAILED TO UNARCHIVE CALL ID ${id}`);
      console.log(err)
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
    <Button color="success" variant="contained" startIcon={<UnarchiveTwoToneIcon/>} onClick={handleUnarchvieAll}>Unarchive All Calls</Button>
    {
      Object.entries(callsList).map(([key,value],i)=>{
        return <div key={i} >
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
                      <IconButton color={timeChipStyle} onClick={()=>{handleUnarchive(rec.id)}}>
                        <UnarchiveTwoToneIcon/>
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
      open={snackBarState.open}
      autoHideDuration={3000}
      onClose={handleSnackBarClose}
      anchorOrigin={{horizontal: "center", vertical: "bottom"}}
      >
      <Alert onClose={handleSnackBarClose} severity={snackBarState.severity}>
        {snackBarState.message}
      </Alert>
    </Snackbar>
  </Stack>
}

export default CallActivity