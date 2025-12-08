
import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box, Table, TableBody, TableCell, TableHead, TableRow, TextField,
  Typography, Button, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid
} from "@mui/material";
import {
  selectCriteriaMatrix, selectCriteriaNames, selectAlternativeNames,
  updateCriteriaMatrixCell, updateCriteriaName,
  setCriteriaCount, setAlternativesCount
} from "../../shared/store/slices/ahp/ahp.slice";
import { calculateAhpWeights, calculateConsistency, isMatrixComplete } from "../helpers/ahp.utils";
import { Footer } from "../../shared/ui";

const ROW_HEIGHT = 55; 
const HEADER_HEIGHT = 50;

export const AhpCriteriaAnalysis = ({ onNext, onReset }) => {
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const matrix = useSelector(selectCriteriaMatrix);
  const names = useSelector(selectCriteriaNames);
  const altNames = useSelector(selectAlternativeNames);

  const [results, setResults] = useState(null);
  const [consistency, setConsistency] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempName, setTempName] = useState("");

  // --- PERSISTENCIA: Recalcular al cargar SOLO SI ESTÁ COMPLETA ---
  useEffect(() => {
    if (isMatrixComplete(matrix)) {
        handleCalculate();
    } else {
        setResults(null);
        setConsistency(null);
    }
  }, [matrix, names.length]);

  const currentColSums = useMemo(() => {
    if (!matrix || matrix.length === 0) return [];
    return matrix[0].map((_, colIndex) => 
      matrix.reduce((sum, row) => sum + (parseFloat(row[colIndex]) || 0), 0)
    );
  }, [matrix]);

  const handleDimensionChange = (type, val) => {
    const num = parseInt(val);
    if (isNaN(num) || num < 2) return;

    if (type === 'criteria') {
        setResults(null);
        setConsistency(null);
        dispatch(setCriteriaCount(num));
    } else {
        dispatch(setAlternativesCount(num));
    }
  };

  const handleHeaderClick = (index) => {
    setEditingIndex(index);
    setTempName(names[index]);
    setEditOpen(true);
  };

  const saveName = () => {
    dispatch(updateCriteriaName({ index: editingIndex, name: tempName }));
    setEditOpen(false);
  };

  const handleMatrixChange = (row, col, value) => {
    if (value === "" || /^[1-9]$/.test(value)) {
        dispatch(updateCriteriaMatrixCell({ row, col, value }));
        // Si borran un dato, borramos resultados inmediatamente
        if (consistency) setConsistency(null); 
    }
  };

  const handleCalculate = () => {
    if (!isMatrixComplete(matrix)) {
        setResults(null);
        setConsistency(null);
        return;
    }

    const res = calculateAhpWeights(matrix);
    const cons = calculateConsistency(matrix, res.weights);
    setResults(res);
    setConsistency(cons);
  };

  const getDisplayValue = (val) => {
    if (val === "") return "";
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    if (Number.isInteger(num)) return num.toString();
    return parseFloat(num.toFixed(3)); 
  };

  const handleGoBack = () => {
    navigate("/", { replace: true });
  };

  const FOOTER_BUTTONS = [
    {
      text: "volver",
      icon: "back",
      type: "icon",
      color: "inherit",
      handle: handleGoBack,
      position: "left",
    },
    {
      text: "reiniciar",
      icon: "reset",
      type: "icon",
      color: "inherit",
      handle: onReset,
      position: "left",
    }
  ];

  if (consistency?.isConsistent) {
      FOOTER_BUTTONS.push({
          text: "Evaluar alternativas",
          icon: "next",
          type: "icon",
          color: "inherit",
          handle: onNext,
          position: "right",
      })
  }

  return (
    <>
    <Box sx={{ width: '100%', paddingBottom: '50px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={3} sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
        <Box>
            <Box display="flex" gap={3}>
                <TextField 
                    label="Cant. de criterios" 
                    type="number" 
                    size="small" 
                    value={names.length}
                    onChange={(e) => handleDimensionChange('criteria', e.target.value)}
                    InputProps={{ inputProps: { min: 2, max: 10 } }}
                    sx={{ width: 130 }}
                />
                <TextField 
                    label="Cant. de alternativas" 
                    type="number" 
                    size="small" 
                    value={altNames.length}
                    onChange={(e) => handleDimensionChange('alternatives', e.target.value)}
                    InputProps={{ inputProps: { min: 2, max: 15 } }}
                    sx={{ width: 150 }}
                />
            </Box>
        </Box>

        {consistency && (
            <Paper 
                elevation={0}
                variant="outlined"
                sx={{ 
                    p: 1.5, 
                    borderLeft: 6, 
                    borderColor: consistency.isConsistent ? 'success.main' : 'error.main',
                    minWidth: 320,
                    bgcolor: 'background.paper'
                }}
            >
                <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} display="flex" justifyContent="space-between">
                        <Typography variant="subtitle2" color="text.secondary">Razón de consistencia</Typography>
                        <Typography variant="h6" color={consistency.isConsistent ? "success.main" : "error.main"} lineHeight={1}>
                            RC = {consistency.CR.toFixed(3)}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                         <Typography variant="caption" color="text.secondary">IC: {consistency.CI.toFixed(3)} | IA: {consistency.RI.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                        {!consistency.isConsistent ? (
                             <Typography variant="caption" color="error" fontWeight="bold">Inconsistente</Typography>
                        ) : (
                            <Typography variant="caption" color="success.main" fontWeight="bold">Consistente</Typography>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        )}
      </Box>

      <Box display="flex" width="100%" gap={2} alignItems="flex-start">
        <Paper elevation={2} sx={{ p: 1, flex: 6, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" align="center" display="block" sx={{ mb: 1, fontWeight: 'bold' }}>
                Matriz de comparación
            </Typography>
            <Box sx={{ overflowX: 'auto', flexGrow: 1 }}>
                <Table size="small" padding="none" sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead>
                        <TableRow sx={{ height: HEADER_HEIGHT }}>
                            <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', borderBottom: '2px solid #ddd', width: '25%' }}>
                                Criterios
                            </TableCell>
                            {names.map((name, i) => (
                                <TableCell 
                                    key={i} align="center" 
                                    onClick={() => handleHeaderClick(i)}
                                    sx={{ 
                                        cursor: 'pointer',
                                        bgcolor: '#f5f5f5',
                                        borderBottom: '2px solid #ddd',
                                        '&:hover': { bgcolor: '#e0e0e0' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, fontSize: '0.8rem', lineHeight: 1.1, wordBreak: 'break-word' }}>
                                        {name}
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {matrix.map((row, i) => (
                            <TableRow key={i} sx={{ height: ROW_HEIGHT }}>
                                <TableCell 
                                    onClick={() => handleHeaderClick(i)}
                                    sx={{ 
                                        fontWeight: 'bold',
                                        bgcolor: '#fafafa',
                                        cursor: 'pointer',
                                        borderRight: '1px solid #ddd',
                                        fontSize: '0.8rem',
                                        px: 1,
                                        wordBreak: 'break-word',
                                        lineHeight: 1.1,
                                        '&:hover': { bgcolor: '#e0e0e0' }
                                    }}
                                    align="center"
                                >
                                    {names[i]}
                                </TableCell>
                                {row.map((cell, j) => (
                                    <TableCell key={j} align="center" sx={{ borderRight: '1px solid #eee' }}>
                                        <TextField
                                            value={getDisplayValue(cell)}
                                            disabled={i === j}
                                            onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                                            type="text"
                                            variant="standard"
                                            InputProps={{ disableUnderline: true }}
                                            inputProps={{ style: { textAlign: "center", fontSize: '0.9rem' }, inputMode: 'numeric' }}
                                            fullWidth
                                            sx={{ bgcolor: i === j ? '#e0e0e0' : 'transparent', py: 1, borderRadius: 1 }}
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        <TableRow sx={{ height: ROW_HEIGHT, bgcolor: '#fff8e1', borderTop: '2px solid #ddd' }}>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#f57c00' }}>SUMA</TableCell>
                            {currentColSums.map((sum, i) => (
                                <TableCell key={i} align="center" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                                    {sum.toFixed(2)}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 1, flex: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" align="center" display="block" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>Matriz normalizada</Typography>
            <Box sx={{ overflowX: 'auto', flexGrow: 1 }}>
                <Table size="small" padding="none" sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead>
                        <TableRow sx={{ height: HEADER_HEIGHT }}>
                            {names.map((_, i) => (
                                <TableCell key={i} align="center" sx={{ fontSize: '0.8rem', color: 'text.secondary', borderBottom: '2px solid #ddd' }}></TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {names.map((_, i) => (
                            <TableRow key={i} sx={{ height: ROW_HEIGHT }}>
                                {names.map((_, j) => (
                                    <TableCell key={j} align="center" sx={{ fontSize: '0.9rem', borderRight: '1px solid #eee', color: results ? 'inherit' : 'text.disabled' }}>
                                        {results ? results.normalizedMatrix[i][j].toFixed(3) : "-"}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 1, flex: 0.8, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" align="center" display="block" sx={{ mb: 1, fontWeight: 'bold', color: 'success.main' }}>
                Vector de prioridad
            </Typography>
            <Box sx={{ overflowX: 'auto', flexGrow: 1 }}>
                <Table size="small" padding="none" sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead>
                        <TableRow sx={{ height: HEADER_HEIGHT }}>
                            <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: '2px solid #ddd', fontSize: '0.8rem' }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {names.map((_, i) => (
                            <TableRow key={i} sx={{ height: ROW_HEIGHT }}>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: results ? 'success.dark' : 'text.disabled' }}>
                                    {results ? results.weights[i].toFixed(4) : "-"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
            
            {/* {consistency?.isConsistent && (
                <Box mt={2} px={1} pb={1}>
                     <Button 
                        variant="contained" 
                        color="success" 
                        fullWidth 
                        onClick={onNext}
                        size="small"
                        sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                    >
                        Evaluar Alt.
                    </Button>
                </Box>
            )} */}
        </Paper>

      </Box>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Renombrar criterio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            variant="standard"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onFocus={(e) => e.target.select()}
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
