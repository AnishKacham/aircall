import React, {useEffect,useState} from "react"
import Boundary from "../components/Boundary.jsx";
import { Chip, Button, Card, IconButton, Stack } from "@mui/material";
import NorthWestIcon from '@mui/icons-material/NorthWest';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArchiveTwoToneIcon from '@mui/icons-material/ArchiveTwoTone';
import _ from 'lodash';

const CallActivity = (props)=>{
  const [fetchState,setFetchState] = useState("loading");
  const [callsList,setCalls] = useState({});
  const [rawCallsList,setRawCallsList] = useState([]);

  useEffect(()=>{
    fetch("https://cerulean-marlin-wig.cyclic.app/activities")
    .then(res => res.json())
    .then(calls => {
      setRawCallsList(calls);
      const modifiedData = _.chain(calls).filter({'is_archived':false}).orderBy('created_at','desc').groupBy((record)=>{
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
  },[])

  const handleArchiveAll = () => {
    console.log("Archiving all calls . . .");
    Promise.all(rawCallsList.map(
      call => fetch(`https://cerulean-marlin-wig.cyclic.app/activites/${call.id}`,{
        method: "PATCH",
        headers:{
          'Content-type': 'application/json; charset=UTF-8',
        },
        body:JSON.stringify({
          "is_archived" : true
        })
      })
    )).then((res)=>{
      console.log("ARCHIVED ALL CALLS")
    })
  }

  const handleArchive = (id) => {
    console.log(`archiving ${id} . . .`)
    fetch(`https://charming-bat-singlet.cyclic.app/cerulean-marlin-wig.cyclic.app/activites/${id}`,{
      method: "PATCH",
      headers:{
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        "is_archived" : true
      })
    }).then(res=>{console.log(res)})
    .catch(err=> {console.log(err)})
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
    <Button color="warning" variant="contained" startIcon={<ArchiveTwoToneIcon/>} onClick={handleArchiveAll}>Archive All Calls</Button>
    {
      Object.entries(callsList).map(([key,value],i)=>{
        return <div>
          <div key={i} style={{
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
                    
                    <div style={{alignSelf:"flex-end", marginLeft: "auto", display:"flex", alignItems:"center", gap:"5px"}}>
                      <Chip variant="outlined" label={callTime.toLocaleTimeString()} color={timeChipStyle} size="small" icon={<AccessTimeIcon/>} />
                      <IconButton color={timeChipStyle} onClick={()=>{handleArchive(rec.id)}}>
                        <ArchiveTwoToneIcon/>
                      </IconButton>
                    </div>
                  </Card>
              })
            }
          </div>
        </div> 
      })
    }
  </Stack>
}

export default CallActivity