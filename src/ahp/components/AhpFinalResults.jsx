import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { 
    Box, Typography, Button, Paper, Table, TableHead, TableBody, TableRow, TableCell 
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { 
  selectCriteriaNames, selectAlternativeNames, selectCriteriaMatrix, selectAlternativeMatrices 
} from "../../shared/store/slices/ahp/ahp.slice";
import { calculateAhpWeights } from "../helpers/ahp.utils";
import { Footer } from "../../shared/ui";

export const AhpFinalResults = ({ onBack, onReset }) => {
  const criteriaNames = useSelector(selectCriteriaNames);
  const altNames = useSelector(selectAlternativeNames);
  const criteriaMatrix = useSelector(selectCriteriaMatrix);
  const altMatrices = useSelector(selectAlternativeMatrices);

  // --- CÁLCULOS FINALES ---
  const finalData = useMemo(() => {
    // 1. Calcular pesos globales de los Criterios (Wj)
    const { weights: criteriaWeights } = calculateAhpWeights(criteriaMatrix);

    // 2. Calcular pesos locales de Alternativas por Criterio (Aij)
    // Estructura: alternativesScores[altIndex][criteriaIndex] = puntaje
    const alternativesScores = altNames.map(() => Array(criteriaNames.length).fill(0));
    
    // Iteramos por cada criterio para llenar los puntajes
    criteriaNames.forEach((_, cIndex) => {
        const matrix = altMatrices[cIndex];
        if (matrix) {
            const { weights } = calculateAhpWeights(matrix);
            weights.forEach((w, aIndex) => {
                alternativesScores[aIndex][cIndex] = w;
            });
        }
        // Si no hay matriz cargada para un criterio, el peso queda en 0
    });

    // 3. Calcular Puntaje Final (Priorización)
    // Score = Sum(Wj * Aij)
    const finalScores = altNames.map((_, aIndex) => {
        let score = 0;
        criteriaNames.forEach((_, cIndex) => {
            const weightC = criteriaWeights[cIndex] || 0;
            const scoreA = alternativesScores[aIndex][cIndex] || 0;
            score += weightC * scoreA;
        });
        return score;
    });

    // Encontrar mejor opción para destacar
    const maxScore = Math.max(...finalScores);

    return { criteriaWeights, alternativesScores, finalScores, maxScore };
  }, [criteriaMatrix, altMatrices, criteriaNames, altNames]);

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
    }
  ];

  return (
    <>
    <Box sx={{ width: '100%' }}>
        {/* <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" color="primary.main" fontWeight="bold">
                Resultados Finales: Priorización
            </Typography>
            <Box>
                <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mr: 2 }}>
                    Volver a Comparaciones
                </Button>
                <Button startIcon={<RestartAltIcon />} color="error" onClick={onReset}>
                    Reiniciar
                </Button>
            </Box>
        </Box> */}

        <Paper elevation={3} sx={{ p: 2, overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 650 }}>
                <TableHead>
                    <TableRow sx={{ bgcolor: '#cfd8dc' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Alternativa</TableCell>
                        {criteriaNames.map((name, i) => (
                            <TableCell key={i} align="center" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                                {name}
                            </TableCell>
                        ))}
                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#b2dfdb', width: 200 }}>
                            PRIORIZACIÓN
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {altNames.map((altName, aIndex) => {
                        const score = finalData.finalScores[aIndex];
                        const isBest = score === finalData.maxScore && score > 0;
                        
                        return (
                            <TableRow key={aIndex} hover>
                                {/* Nombre Alternativa */}
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: isBest ? '#e8f5e9' : 'inherit' }}>
                                    {altName}
                                </TableCell>
                                
                                {/* Pesos Locales */}
                                {finalData.alternativesScores[aIndex].map((val, cIndex) => (
                                    <TableCell key={cIndex} align="center">
                                        {val.toFixed(3)}
                                    </TableCell>
                                ))}
                                
                                {/* Ranking Final con Barra */}
                                <TableCell sx={{ p: 1, verticalAlign: 'middle' }}>
                                    <Box sx={{ position: 'relative', height: 30, width: '100%', bgcolor: '#f1f8e9', border: '1px solid #ccc', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
                                        {/* Barra de progreso visual */}
                                        <Box 
                                            sx={{ 
                                                position: 'absolute', 
                                                left: 0, 
                                                top: 0, 
                                                height: '100%', 
                                                width: `${score * 100}%`, 
                                                bgcolor: isBest ? '#66bb6a' : '#81c784',
                                                borderRadius: 1,
                                                transition: 'width 0.5s ease'
                                            }} 
                                        />
                                        {/* Texto superpuesto */}
                                        <Typography variant="body2" sx={{ position: 'relative', zIndex: 1, width: '100%', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
                                            {score.toFixed(4)}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    
                    {/* Fila de Ponderación (Weights de Criterios) */}
                    <TableRow sx={{ bgcolor: '#90caf9', borderTop: '2px solid #1976d2' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#0d47a1' }}>PONDERACIÓN</TableCell>
                        {finalData.criteriaWeights.map((w, i) => (
                            <TableCell key={i} align="center" sx={{ fontWeight: 'bold', color: '#0d47a1', fontSize: '1rem' }}>
                                {w.toFixed(3)}
                            </TableCell>
                        ))}
                        <TableCell /> {/* Celda vacía bajo Priorización */}
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>

        {/* <Box mt={4}>
            <Typography variant="h6" gutterBottom>Interpretación:</Typography>
            <Typography variant="body1">
                La mejor alternativa es <strong>{altNames[finalData.finalScores.indexOf(finalData.maxScore)]}</strong> con un puntaje global de <strong>{finalData.maxScore.toFixed(4)}</strong>.
            </Typography>
        </Box> */}
    </Box>
    <Footer buttons={FOOTER_BUTTONS} />
    </>
  );
};
