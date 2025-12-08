import React, { useState } from "react";
import { Container, Stepper, Step, StepLabel, Box, Button, Paper } from "@mui/material";
import { AhpCriteriaAnalysis } from "../components/AhpCriteriaAnalysis";
import { AhpAlternativesAnalysis } from "../components/AhpAlternativesAnalysis";
import { AhpFinalResults } from "../components/AhpFinalResults";
import { useDispatch } from "react-redux";
import { resetAhp } from "../../shared/store/slices/ahp/ahp.slice";

const STEPS = ["Criterios", "Alternativas", "Resultados"];

export const AhpPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  
  const handleReset = () => {
    dispatch(resetAhp());
    setActiveStep(0);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, minHeight: '80vh', boxShadow: 'none' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4, width: '70%', mx: 'auto' }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box>
        {/* PASO 1: CRITERIOS */}
        {activeStep === 0 && (
            <AhpCriteriaAnalysis onNext={handleNext} onReset={handleReset} />
        )}

        {/* PASO 2: ALTERNATIVAS */}
        {activeStep === 1 && (
            <AhpAlternativesAnalysis onBack={handleBack} onNext={handleNext} onReset={handleReset} />
        )}

        {/* PASO 3: RESULTADOS */}
        {activeStep === 2 && (
            <AhpFinalResults onBack={handleBack} onReset={handleReset} />
        )}
      </Box>
    </Paper>
  );
};

export default AhpPage;
