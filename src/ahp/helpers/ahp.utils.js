/**
 * Crea una matriz cuadrada de tamaño n rellena con 1s en la diagonal
 */
export const createInitialMatrix = (n) => {
  return Array.from({ length: n }, (_, i) => 
    Array.from({ length: n }, (_, j) => (i === j ? 1 : ""))
  );
};

/**
 * Calcula la matriz normalizada y el vector de pesos (Prioridades)
 */
export const calculateAhpWeights = (matrix) => {
  const n = matrix.length;
  
  // 1. Calcular suma de columnas
  const colSums = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      colSums[j] += parseFloat(matrix[i][j] || 0);
    }
  }

  // 2. Normalizar matriz y 3. Calcular promedio de filas (Vector de Prioridad/Pesos)
  const normalizedMatrix = [];
  const weights = [];

  for (let i = 0; i < n; i++) {
    const row = [];
    let rowSum = 0;
    for (let j = 0; j < n; j++) {
      const val = parseFloat(matrix[i][j] || 0);
      // Evitar división por cero
      const normalizedVal = colSums[j] !== 0 ? val / colSums[j] : 0;
      row.push(normalizedVal);
      rowSum += normalizedVal;
    }
    normalizedMatrix.push(row);
    weights.push(rowSum / n);
  }

  return { normalizedMatrix, weights, colSums };
};

/**
 * Calcula la Razón de Consistencia (CR) usando el método de aproximación de la Cátedra
 * Referencia: Nmax = Suma del vector (Matriz x Pesos)
 * Referencia RI: 1.98 * (n-2) / n
 */
export const calculateConsistency = (matrix, weights) => {
  const n = matrix.length;
  
  // 1. Calcular el vector AxP (Matriz original * Vector de pesos)
  // Esto corresponde a la columna "AxP" de tu Excel o al paso intermedio de la captura gris
  const AxP = [];
  
  for (let i = 0; i < n; i++) {
    let rowSum = 0;
    for (let j = 0; j < n; j++) {
      const cellValue = parseFloat(matrix[i][j] || 0);
      const weightValue = weights[j];
      rowSum += cellValue * weightValue;
    }
    AxP.push(rowSum);
  }

  // 2. Calcular Lambda Max (Nmax)
  // Según tu captura, Nmax es la SUMA de los elementos del vector resultante AxP
  const lambdaMax = AxP.reduce((a, b) => a + b, 0);

  // 3. Índice de Consistencia (CI)
  // Fórmula: (Nmax - n) / (n - 1)
  const CI = (lambdaMax - n) / (n - 1);

  // 4. Índice Aleatorio (RI)
  // Según tu Excel: RI = 1.98 * (n-2) / n
  // Nota: Si n=1 o n=2, esta fórmula da <= 0, lo cual es correcto (consistencia perfecta)
  const RI = n > 2 ? (1.98 * (n - 2)) / n : 0;

  // 5. Razón de Consistencia (CR)
  const CR = RI === 0 ? 0 : CI / RI;

  return {
    lambdaMax,
    CI,
    RI,
    CR,
    isConsistent: CR <= 0.1 // Generalmente aceptable si es menor o igual a 0.1
  };
};

/**
 * Verifica si la matriz tiene todos sus valores completados (ignora la diagonal).
 * Retorna false si encuentra alguna celda vacía.
 */
export const isMatrixComplete = (matrix) => {
  if (!matrix || matrix.length === 0) return false;
  
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix.length; j++) {
      // Solo verificamos fuera de la diagonal
      if (i !== j) { 
         const val = matrix[i][j];
         // Si es string vacío, null o undefined, está incompleta
         if (val === "" || val === null || val === undefined) {
             return false;
         }
      }
    }
  }
  return true;
};
