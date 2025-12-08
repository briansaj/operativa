import React, { useState, useMemo, useEffect } from "react";
import {
  Box, Table, TableBody, TableCell, TableHead, TableRow, TextField,
  Typography, Paper, Grid
} from "@mui/material";
import { calculateAhpWeights, calculateConsistency, isMatrixComplete } from "../helpers/ahp.utils";

/**
 * Componente genérico que recibe una matriz y devuelve los inputs y resultados.
 * Props:
 * - matrix: La matriz de datos (array de arrays).
 * - rowNames: Nombres de las filas/columnas (ej: Alternativas).
 * - onUpdate: Función para enviar el cambio al padre (row, col, val).
 * - title: Título de la sección.
 */

const ROW_HEIGHT = 55; 
const HEADER_HEIGHT = 50;

export const AhpGenericMatrix = ({ matrix, rowNames, onUpdate, title, onRename }) => {
  const [results, setResults] = useState(null);
  const [consistency, setConsistency] = useState(null);

  // --- PERSISTENCIA: Recalcular solo si está completo ---
  useEffect(() => {
    if (isMatrixComplete(matrix)) {
        handleCalculate();
    } else {
        setResults(null);
        setConsistency(null);
    }
  }, [matrix, rowNames]); 

  const currentColSums = useMemo(() => {
    if (!matrix || matrix.length === 0) return [];
    return matrix[0].map((_, colIndex) => 
      matrix.reduce((sum, row) => sum + (parseFloat(row[colIndex]) || 0), 0)
    );
  }, [matrix]);

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

  const handleLocalChange = (row, col, val) => {
    if (val === "" || /^[1-9]$/.test(val)) {
        onUpdate(row, col, val);
        if (consistency) setConsistency(null); 
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={3} sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {title}
        </Typography>

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

      {/* CONTENEDOR DE TABLAS */}
      <Box display="flex" width="100%" gap={2} alignItems="flex-start">
        
        {/* 1. INPUT */}
        <Paper elevation={2} sx={{ p: 1, flex: 6, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" align="center" display="block" sx={{ mb: 1, fontWeight: 'bold' }}>Matriz de comparación</Typography>
            <Box sx={{ overflowX: 'auto', flexGrow: 1 }}>
                <Table size="small" padding="none" sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead>
                        <TableRow sx={{ height: HEADER_HEIGHT }}>
                            <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', borderBottom: '2px solid #ddd', width: '25%' }}>Alternativas</TableCell>
                            {rowNames.map((name, i) => (
                                <TableCell 
                                    key={i} align="center" 
                                    onClick={() => onRename && onRename(i)}
                                    sx={{ 
                                        bgcolor: '#f5f5f5',
                                        borderBottom: '2px solid #ddd',
                                        fontSize: '0.8rem',
                                        cursor: onRename ? 'pointer' : 'default',
                                        '&:hover': { bgcolor: onRename ? '#e0e0e0' : '#f5f5f5' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
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
                                    align="center" 
                                    onClick={() => onRename && onRename(i)}
                                    sx={{ 
                                        fontWeight: 'bold',
                                        bgcolor: '#fafafa',
                                        borderRight: '1px solid #ddd',
                                        fontSize: '0.8rem',
                                        px: 1,
                                        cursor: onRename ? 'pointer' : 'default',
                                        '&:hover': { bgcolor: onRename ? '#e0e0e0' : '#fafafa' }
                                    }}
                                >
                                    {rowNames[i]}
                                </TableCell>
                                {row.map((cell, j) => (
                                    <TableCell key={j} align="center" sx={{ borderRight: '1px solid #eee' }}>
                                        <TextField
                                            value={getDisplayValue(cell)}
                                            disabled={i === j}
                                            onChange={(e) => handleLocalChange(i, j, e.target.value)}
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
                                <TableCell key={i} align="center" sx={{ fontWeight: 'bold', color: '#f57c00' }}>{sum.toFixed(2)}</TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
            {/* BOTÓN ELIMINADO AQUÍ */}
        </Paper>

        {/* 2. NORMALIZADA */}
        <Paper elevation={2} sx={{ p: 1, flex: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" align="center" display="block" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>Matirz normalizada</Typography>
            <Box sx={{ overflowX: 'auto', flexGrow: 1 }}>
                <Table size="small" padding="none" sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead>
                        <TableRow sx={{ height: HEADER_HEIGHT }}>
                            {rowNames.map((_, i) => (
                                <TableCell key={i} align="center" sx={{ fontSize: '0.8rem', color: 'text.secondary', borderBottom: '2px solid #ddd' }}></TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rowNames.map((_, i) => (
                            <TableRow key={i} sx={{ height: ROW_HEIGHT }}>
                                {rowNames.map((_, j) => (
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

        {/* 3. VECTOR P */}
        <Paper elevation={2} sx={{ p: 1, flex: 0.8, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" align="center" display="block" sx={{ mb: 1, fontWeight: 'bold', color: 'success.main' }}>Vector de prioridad</Typography>
            <Box sx={{ overflowX: 'auto', flexGrow: 1 }}>
                <Table size="small" padding="none" sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead>
                        <TableRow sx={{ height: HEADER_HEIGHT }}>
                            <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: '2px solid #ddd', fontSize: '0.8rem' }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rowNames.map((_, i) => (
                            <TableRow key={i} sx={{ height: ROW_HEIGHT }}>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: results ? 'success.dark' : 'text.disabled' }}>
                                    {results ? results.weights[i].toFixed(4) : "-"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Paper>
      </Box>
    </Box>
  );
};
