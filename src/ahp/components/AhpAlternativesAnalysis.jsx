import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
    Box, Tabs, Tab, Button, Typography, Paper, 
    Dialog, DialogTitle, DialogContent, TextField, DialogActions 
} from "@mui/material";
import { 
  selectCriteriaNames, selectAlternativeNames, selectAlternativeMatrices,
  updateAlternativeMatrixCell, updateAlternativeName
} from "../../shared/store/slices/ahp/ahp.slice";
import { createInitialMatrix, isMatrixComplete } from "../helpers/ahp.utils";
import { AhpGenericMatrix } from "./AhpGenericMatrix";
import { Footer } from "../../shared/ui";

export const AhpAlternativesAnalysis = ({ onBack, onNext, onReset }) => {
  const dispatch = useDispatch();
  const criteriaNames = useSelector(selectCriteriaNames);
  const altNames = useSelector(selectAlternativeNames);
  const matrices = useSelector(selectAlternativeMatrices);

  const [tabIndex, setTabIndex] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempName, setTempName] = useState("");

  const allMatricesCompleted = useMemo(() => {
    // Recorremos todos los criterios (indices)
    return criteriaNames.every((_, index) => {
      const mat = matrices[index];
      // isMatrixComplete devuelve false si la matriz es undefined o tiene celdas vacías
      return isMatrixComplete(mat);
    });
  }, [matrices, criteriaNames]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const currentMatrix = matrices[tabIndex] || createInitialMatrix(altNames.length);

  const handleUpdate = (row, col, val) => {
    dispatch(updateAlternativeMatrixCell({
      criterionIndex: tabIndex,
      row, col, value: val
    }));
  };

  const handleRenameClick = (index) => {
    setEditingIndex(index);
    setTempName(altNames[index]);
    setEditOpen(true);
  };

  const saveName = () => {
    dispatch(updateAlternativeName({ index: editingIndex, name: tempName }));
    setEditOpen(false);
  };

  const FOOTER_BUTTONS = [
    {
      text: "volver",
      icon: "back",
      type: "icon",
      color: "inherit",
      handle: onBack,
      position: "left",
    },
    {
      text: "reiniciar",
      icon: "reset",
      type: "icon",
      color: "inherit",
      handle: onReset,
      position: "left",
    },
  ];

  if (allMatricesCompleted) {
      FOOTER_BUTTONS.push({
        text: "Ver resultados",
        icon: "check",
        type: "icon",
        color: "inherit",
        handle: onNext,
        position: "right",
      })
  }

  return (
    <>
    <Box sx={{ width: '100%', paddingBottom: '42px' }}>
      <Paper square sx={{ mb: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
            value={tabIndex} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
        >
          {criteriaNames.map((name, index) => (
            <Tab key={index} label={name} />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ p: 1 }}>
        <AhpGenericMatrix
            key={tabIndex}
            title={`Comparación de criterio: ${criteriaNames[tabIndex]}`}
            matrix={currentMatrix}
            rowNames={altNames}
            onUpdate={handleUpdate}
            onRename={handleRenameClick}
        />
      </Box>
      
      {/* DIALOG MEJORADO */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Renombrar alternativa</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de Alternativa"
            fullWidth
            variant="standard"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            // Seleccionar todo el texto
            onFocus={(e) => e.target.select()}
            // Guardar con Enter
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveName();
                }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button onClick={saveName}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
    <Footer buttons={FOOTER_BUTTONS} />
    </>
  );
};
