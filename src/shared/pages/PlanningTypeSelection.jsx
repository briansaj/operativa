import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Typography,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { Footer } from "../ui/Footer";
import { TYPE } from "../../activity/constants";
import { chooseType } from "../store/slices/planning/planning.slice";

export const PlanningTypeSelection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(TYPE.CPM);

  const handleListItemClick = (event, value, cpm = true, type = false) => {
    if (cpm) {
      setSelected(value);
      goToActivities();
    } else {
      goToMatrix(type);
    }
  };

  const goToMatrix = (type) => {
    dispatch(chooseType(selected));
    if (type === "transport") {
      navigate("/transport");
    } else {
      navigate("/assignment");
    }
  };

  const goToActivities = () => {
    dispatch(chooseType(selected));
    navigate("/activities");
  };

  const goToAhp = () => {
    dispatch(chooseType(selected));
    navigate("/ahp");
  };

  return (
    <>
      <Box textAlign="center">
        <Typography variant="overline">Planificación</Typography>
        <Divider />
      </Box>

      <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
        <List component="nav" aria-label="planning types">
          <ListItemButton
            selected={selected === TYPE.CPM}
            onClick={(event) => handleListItemClick(event, TYPE.CPM)}
          >
            <ListItemText
              sx={{ my: 0, display: "flex", justifyContent: "center" }}
              primary="CPM"
              primaryTypographyProps={{
                fontSize: 18,
                fontWeight: "small",
                letterSpacing: 1,
              }}
            />
          </ListItemButton>
          <ListItemButton
            selected={selected === TYPE.PERT}
            onClick={(event) => handleListItemClick(event, TYPE.PERT)}
          >
            <ListItemText
              sx={{ my: 0, display: "flex", justifyContent: "center" }}
              primary="PERT"
              primaryTypographyProps={{
                fontSize: 18,
                fontWeight: "small",
                letterSpacing: 1,
              }}
            />
          </ListItemButton>
        </List>
      </Box>

      <Box textAlign="center">
        <Typography variant="overline">Transporte y asignación</Typography>
        <Divider />
      </Box>

      <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
        <List component="nav" aria-label="planning types">
          <ListItemButton
            selected={selected === TYPE.CPM}
            onClick={(event) =>
              handleListItemClick(event, TYPE.CPM, false, "transport")
            }
          >
            <ListItemText
              sx={{ my: 0, display: "flex", justifyContent: "center" }}
              primary="TRANSPORTE"
              primaryTypographyProps={{
                fontSize: 18,
                fontWeight: "small",
                letterSpacing: 1,
              }}
            />
          </ListItemButton>
          <ListItemButton
            selected={selected === TYPE.PERT}
            onClick={(event) => handleListItemClick(event, TYPE.PERT, false)}
          >
            <ListItemText
              sx={{ my: 0, display: "flex", justifyContent: "center" }}
              primary="ASIGNACIÓN"
              primaryTypographyProps={{
                fontSize: 18,
                fontWeight: "small",
                letterSpacing: 1,
              }}
            />
          </ListItemButton>
        </List>
      </Box>

      <Box textAlign="center">
        <Typography variant="overline">AHP</Typography>
        <Divider />
      </Box>

       <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
        <List component="nav" aria-label="planning types">
          <ListItemButton
            selected={selected === TYPE.CPM}
            onClick={(event) => {
              goToAhp()
            }}
          >
            <ListItemText
              sx={{ my: 0, display: "flex", justifyContent: "center" }}
              primary="AHP"
              primaryTypographyProps={{
                fontSize: 18,
                fontWeight: "small",
                letterSpacing: 1,
              }}
            />
          </ListItemButton>
        </List>
      </Box>

      <Footer />
    </>
  );
};
