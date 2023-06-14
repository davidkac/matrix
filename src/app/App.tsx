import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';

// Define the type for coordinates in the matrix
interface Coordinates {
  x: number;
  y: number;
}

// Define the type for the object coordinates
interface ObjectCoordinates {
  movingObjectCoordinates: Coordinates;
  blockingObjectCoordinates: Coordinates[];
}

const Matrix: React.FC = () => {

  // Define state variables using the useState hook
  const [matrixSize, setMatrixSize] = useState<number>(10); // Size of the matrix
  const [startPosition, setStartPosition] = useState<Coordinates>({ x: 0, y: 0 }); // Starting position of the moving object
  const [endPosition, setEndPosition] = useState<Coordinates>({ x: matrixSize - 1, y: matrixSize - 1 }); // Ending position of the moving object
  const [numBlockingObjects, setNumBlockingObjects] = useState<number>(5); // Number of blocking objects in the matrix
  const [objectCoordinates, setObjectCoordinates] = useState<ObjectCoordinates[]>([]); // Coordinates of the moving and blocking objects
  const [executionResults, setExecutionResults] = useState<{ size: number; steps: number; time: number }[]>([]); // Execution results of the matrix
  const [startTime, setStartTime] = useState<number>(0); // Size of the matrix

  // Function to generate random coordinates within the matrix
  const generateRandomCoordinates = (): Coordinates => {
    const x = Math.floor(Math.random() * matrixSize);
    const y = Math.floor(Math.random() * matrixSize);
    return { x, y };
  };

  // Function to check if a coordinate is blocked by any blocking objects
  const isCoordinateBlocked = (coordinate: Coordinates, blockingObjects: Coordinates[]): boolean => {
    return blockingObjects.some(obj => obj.x === coordinate.x && obj.y === coordinate.y);
  };

  // Function to generate coordinates for blocking objects
  const generateBlockingObjects = (): Coordinates[] => {
    const blockingObjects: Coordinates[] = [];
    for (let i = 0; i < numBlockingObjects; i++) {
      let coordinate = generateRandomCoordinates();
      while (
        isCoordinateBlocked(coordinate, blockingObjects) ||
        isCoordinateBlocked(coordinate, [objectCoordinates[objectCoordinates.length - 1].movingObjectCoordinates])
      ) {
        coordinate = generateRandomCoordinates();
      }
      blockingObjects.push(coordinate);
      console.log("blocing obj", blockingObjects)
    }
    return blockingObjects;
  };

  // Function to calculate the shortest path between two coordinates
  const calculateShortestPath = (start: Coordinates, end: Coordinates, blockingObjects: Coordinates[]): Coordinates => {
    // Placeholder implementation
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      return { x: start.x + Math.sign(dx), y: start.y };
    } else {
      return { x: start.x, y: start.y + Math.sign(dy) };
    }
  };

  // Function to move the object in the matrix
  const moveObject = () => {
    const lastObjectCoordinates = objectCoordinates[objectCoordinates.length - 1];
    const { movingObjectCoordinates, blockingObjectCoordinates } = lastObjectCoordinates;

    const newBlockingObjects = generateBlockingObjects();
    const newPathCoordinate = calculateShortestPath(movingObjectCoordinates, endPosition, newBlockingObjects);

    setObjectCoordinates(prev => [
      ...prev,
      {
        movingObjectCoordinates: newPathCoordinate,
        blockingObjectCoordinates: newBlockingObjects,
      },
    ]);
  };

  // Function to run the matrix simulation
  const runMatrix = () => {
    setStartTime(new Date().getTime())
    setObjectCoordinates([
      {
        movingObjectCoordinates: startPosition,
        blockingObjectCoordinates: [],
      },
    ]);
  };

  
  // Function to reset the matrix
  const resetMatrix = () => {
    setObjectCoordinates([]);
    setExecutionResults([]);
  };

  useEffect(() => {
    if (objectCoordinates.length === 0) {
      return;
    }
    const { movingObjectCoordinates } = objectCoordinates[objectCoordinates.length - 1];
    if (movingObjectCoordinates.x === endPosition.x && movingObjectCoordinates.y === endPosition.y) {

      // MO steps
      const steps = objectCoordinates.length - 1;
      const time = new Date().getTime() - startTime;
      setExecutionResults(prev => [...prev, { size: matrixSize, steps, time }]);
    } else {
      moveObject();
    }
  }, [objectCoordinates]);

   // Event handler for matrix size change
   const handleMatrixSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value);
    setMatrixSize(newSize);
    setStartPosition({ x: 0, y: 0 });
    setEndPosition({ x: newSize - 1, y: newSize - 1 });
  };

  // Event handler for start position change
  const handleStartPositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [x, y] = event.target.value.split(',').map(coord => parseInt(coord.trim()));
    setStartPosition({ x, y });
  };

  // Event handler for end position change
  const handleEndPositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [x, y] = event.target.value.split(',').map(coord => parseInt(coord.trim()));
    setEndPosition({ x, y });
  };

  // Event handler for number of blocking objects change
  const handleBlockingObjectsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNumBlockingObjects(parseInt(event.target.value));
  };


  return (
    <div>
      <div className='wrapper-container'>
        <div className='wrapper'>
          <div>
            <label>Matrix Size:</label>
            <input type="number" min="1" value={matrixSize} onChange={handleMatrixSizeChange} />
          </div>
          <div>
            <label>Start Position:</label>
            <input type="text" value={`${startPosition.x}, ${startPosition.y}`} onChange={handleStartPositionChange} />
          </div>
          <div>
            <label>End Position:</label>
            <input type="text" value={`${endPosition.x}, ${endPosition.y}`} onChange={handleEndPositionChange} />
          </div>
          <div>
            <label>Number of Blocking Objects:</label>
            <input type="number" min="0" value={numBlockingObjects} onChange={handleBlockingObjectsChange} />
          </div>
          <div className='btn-actions'>
            <Button color="secondary" onClick={runMatrix}>Run</Button>
            <Button color="primary" onClick={resetMatrix}>Reset</Button>
          </div>
        </div>
      </div>
      <div className="matrix-container">
        {Array.from({ length: matrixSize }, (_, row) => (
          <div key={row} className="matrix-row">
            {Array.from({ length: matrixSize }, (_, col) => {
              const isStart = startPosition.x === col && startPosition.y === row;
              const isEnd = endPosition.x === col && endPosition.y === row;
              const isBlocking = objectCoordinates.some(
                obj => isCoordinateBlocked({ x: col, y: row }, obj.blockingObjectCoordinates)
              );
              const isPath = objectCoordinates.some(obj => obj.movingObjectCoordinates.x === col && obj.movingObjectCoordinates.y === row);
              return (
                <div
                  key={col}
                  className={`matrix-cell ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''} ${isBlocking ? 'blocking' : ''
                    } ${isPath ? 'path' : ''}`}
                ></div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matrix;
