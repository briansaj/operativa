import { createSlice } from "@reduxjs/toolkit";
import { createInitialMatrix } from "../../../../ahp/helpers/ahp.utils";

const initialState = {
  criteriaNames: ["Criterio 1", "Criterio 2", "Criterio 3"], 
  alternativeNames: ["Alternativa 1", "Alternativa 2", "Alternativa 3"],
  criteriaMatrix: createInitialMatrix(3), 
  alternativeMatrices: {}, 
};

export const ahpSlice = createSlice({
  name: "ahp",
  initialState,
  reducers: {
    setCriteriaCount: (state, action) => {
      const newCount = parseInt(action.payload);
      if (newCount < 2 || newCount > 15) return;

      const oldCount = state.criteriaNames.length;
      
      if (newCount > oldCount) {
        const diff = newCount - oldCount;
        for (let i = 0; i < diff; i++) {
          state.criteriaNames.push(`Criterio ${oldCount + i + 1}`);
        }
      } else {
        state.criteriaNames = state.criteriaNames.slice(0, newCount);
      }

      const oldMatrix = state.criteriaMatrix;
      const newMatrix = [];

      for (let i = 0; i < newCount; i++) {
        const row = [];
        for (let j = 0; j < newCount; j++) {
          if (i === j) {
            row.push(1); 
          } else if (i < oldCount && j < oldCount) {
             row.push(oldMatrix[i][j]);
          } else {
             row.push("");
          }
        }
        newMatrix.push(row);
      }
      state.criteriaMatrix = newMatrix;
    },

    setAlternativesCount: (state, action) => {
      const newCount = parseInt(action.payload);
      if (newCount < 2 || newCount > 15) return;

      const oldCount = state.alternativeNames.length;
       if (newCount > oldCount) {
        const diff = newCount - oldCount;
        for (let i = 0; i < diff; i++) {
          state.alternativeNames.push(`Alternativa ${oldCount + i + 1}`);
        }
      } else {
        state.alternativeNames = state.alternativeNames.slice(0, newCount);
      }
      state.alternativeMatrices = {}; 
    },

    updateCriteriaName: (state, action) => {
      const { index, name } = action.payload;
      state.criteriaNames[index] = name;
    },
    updateAlternativeName: (state, action) => {
        const { index, name } = action.payload;
        state.alternativeNames[index] = name;
      },
    
    // --- LÓGICA CORREGIDA PARA CRITERIOS ---
    updateCriteriaMatrixCell: (state, action) => {
      const { row, col, value } = action.payload;
      
      // Actualizamos celda directa
      state.criteriaMatrix[row][col] = value;
      
      // Actualizamos inversa
      if (row !== col) {
          if (value === "" || value === "0") {
              // Si borran el valor, borramos el inverso
              state.criteriaMatrix[col][row] = "";
          } else {
              const numValue = parseFloat(value);
              if (!isNaN(numValue) && numValue !== 0) {
                  state.criteriaMatrix[col][row] = 1 / numValue;
              }
          }
      }
    },

    // --- LÓGICA CORREGIDA PARA ALTERNATIVAS ---
    updateAlternativeMatrixCell: (state, action) => {
      const { criterionIndex, row, col, value } = action.payload;
      
      const n = state.alternativeNames.length;
      if (!state.alternativeMatrices[criterionIndex]) {
        state.alternativeMatrices[criterionIndex] = createInitialMatrix(n);
      }

      state.alternativeMatrices[criterionIndex][row][col] = value;
      
      if (row !== col) {
          if (value === "" || value === "0") {
              state.alternativeMatrices[criterionIndex][col][row] = "";
          } else {
              const numValue = parseFloat(value);
              if (!isNaN(numValue) && numValue !== 0) {
                  state.alternativeMatrices[criterionIndex][col][row] = 1 / numValue;
              }
          }
      }
    },
    
    resetAhp: () => initialState,
  },
});

export const { 
    setCriteriaCount, setAlternativesCount, 
    updateCriteriaName, updateAlternativeName, 
    updateCriteriaMatrixCell, updateAlternativeMatrixCell,
    resetAhp 
} = ahpSlice.actions;

export const selectCriteriaNames = (state) => state.ahp.criteriaNames;
export const selectAlternativeNames = (state) => state.ahp.alternativeNames;
export const selectCriteriaMatrix = (state) => state.ahp.criteriaMatrix;
export const selectAlternativeMatrices = (state) => state.ahp.alternativeMatrices;

export default ahpSlice.reducer;
