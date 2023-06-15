import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

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
  const [matrixSize, setMatrixSize] = useState<number>(5); // Size of the matrix
  const [startPosition, setStartPosition] = useState<Coordinates>({ x: 0, y: 0 }); // Starting position of the moving object
  const [endPosition, setEndPosition] = useState<Coordinates>({ x: matrixSize - 1, y: matrixSize - 1 }); // Ending position of the moving object
  const [numBlockingObjects, setNumBlockingObjects] = useState<number>(5); // Number of blocking objects in the matrix
  const [objectCoordinates, setObjectCoordinates] = useState<ObjectCoordinates[]>([]); // Coordinates of the moving and blocking objects
  const [executionResults, setExecutionResults] = useState<{ size: number; blockingObjects: number, steps: number; time: number }[]>([]); // Execution results of the matrix
  const [startTime, setStartTime] = useState<number>(0); // Size of the matrix
  const [totalTime, setTotalTime] = useState<number>(0); // Size of the matrix
  const [sequenceIndex, setSequenceIndex] = useState<number>(0);
  const [numBlockingObjectsIndex, setNumBlockingObjectsIndex] = useState<number>(0);
  const [sequenceRun, setSequenceRun] = useState<boolean>(false);

  const first = useRef(true);

  const sequence = [
    {
      matrixSize: 5,
      numBlockingObjects: [5, 10, 15]
    },
    {
      matrixSize: 10,
      numBlockingObjects: [10, 30, 81]
    },
    {
      matrixSize: 20,
      numBlockingObjects: [30, 100, 361]
    }
  ];

  // Hook to that runs on single matrix run
  useEffect(() => {

    // prevent execution on component load
    if (first.current) {
      first.current = false;
      return;
    }
    initialize();

  }, [objectCoordinates]);

  // Hook to that runs when sequence is run
  useEffect(() => {

    // prevent execution on component load
    if (first.current) {
      first.current = false;
      return;
    }
    if (sequenceRun) runSequence();

  }, [numBlockingObjectsIndex])

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

  // Function to run matrix once
  const runMatrix = () => {

    setStartTime(new Date().getTime());

    // Corrdinates change that triggers useEffect hook
    setObjectCoordinates([
      {
        movingObjectCoordinates: startPosition,
        blockingObjectCoordinates: [],
      },
    ]);

  };

  // Function to reset the matrix
  const resetMatrix = () => {

    setSequenceRun(false)
    setObjectCoordinates([]);
    setExecutionResults([]);
    setSequenceIndex(0);
    setNumBlockingObjectsIndex(0);
    setNumBlockingObjects(5);
    setMatrixSize(5);
    setEndPosition({ x: 4, y: 4 })
    setTotalTime(0);

  };

  const runSequence = () => {

    setSequenceRun(true);

    if (sequenceIndex >= sequence.length) {
      // All sequences have been run
      return;
    }

    // Set new matrix size, BO count and end position from sequence data set
    const { matrixSize, numBlockingObjects } = sequence[sequenceIndex];
    const currentNumBlockingObjects = numBlockingObjects[numBlockingObjectsIndex];

    setMatrixSize(matrixSize);
    setEndPosition({ x: matrixSize - 1, y: matrixSize - 1 });
    setNumBlockingObjects(currentNumBlockingObjects);

    runMatrix();
  };


  const initialize = () => {

    // Number of BO + MO must be less than size of the matrix
    if (matrixSize * matrixSize <= numBlockingObjects) {
      alert("Maximum number for matrix size of " + matrixSize + " of blocking objects is " + (matrixSize * matrixSize - 1))
      return;
    }

    if (objectCoordinates.length === 0) {
      return;
    }

    const { movingObjectCoordinates } = objectCoordinates[objectCoordinates.length - 1];

    // Condition that checks if MO has hit the end position
    if (movingObjectCoordinates.x === endPosition.x && movingObjectCoordinates.y === endPosition.y) {

      // MO steps
      const steps = objectCoordinates.length - 1;

      // Execution time
      const time = new Date().getTime() - startTime;
      setTotalTime((prev) => prev + time);
      setExecutionResults(prev => [...prev, { size: matrixSize, blockingObjects: numBlockingObjects, steps, time }]);

      // Prevent single matrix run to update indexes
      if (!sequenceRun) return;

      // Move to the next iteration
      setNumBlockingObjectsIndex(numBlockingObjectsIndex + 1);

      if (numBlockingObjectsIndex === 2) {

        // All iterations for the current sequence have been run
        setNumBlockingObjectsIndex(0);

        // Move to the next sequence
        setSequenceIndex(sequenceIndex + 1);
        return;
      }

    } else {

      moveObject();

    }
  }

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
          <div className='total-time'>Total Time {totalTime} ms</div>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              id="outlined-controlled"
              label="Matrix Size"
              type="number"
              value={matrixSize}
              onChange={handleMatrixSizeChange}
            />
            <TextField
              id="outlined-controlled"
              label="Start Position"
              value={`${startPosition.x}, ${startPosition.y}`}
              onChange={handleStartPositionChange}
            />
            <TextField
              id="outlined-controlled"
              label="End Position"
              value={`${endPosition.x}, ${endPosition.y}`}
              onChange={handleEndPositionChange}
            />
            <TextField
              id="outlined-controlled"
              label="Number of Blocking Objects"
              type="number"
              value={numBlockingObjects}
              onChange={handleBlockingObjectsChange}
            />
          </Box>
          <div className='btn-actions'>
            <ButtonGroup
              disableElevation
              color="primary"
              aria-label="medium secondary button group"
            >
              <Button onClick={runSequence}>Run Sequence 5/10/20</Button>
              <Button onClick={runMatrix}>Run</Button>
              <Button onClick={resetMatrix}>Reset</Button>
            </ButtonGroup>
          </div>
        </div>
        <TableContainer sx={{ width: '45%', margin: '1rem auto', border: '1px solid lightgrey', borderRadius: '10px', backgroundColor: '#f1f1f1' }}>
          <Table stickyHeader aria-label="a dense table sticky" sx={{ minWidth: '50%' }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Matrix Size</TableCell>
                <TableCell align="right">Blocking Objects</TableCell>
                <TableCell align="right">Steps</TableCell>
                <TableCell align="right">Time (ms)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {executionResults.map((result, index) => (
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  key={index}
                >
                  <TableCell component="th" scope="row">
                    {result.size}
                  </TableCell>
                  <TableCell align="right">{result.blockingObjects}</TableCell>
                  <TableCell align="right">{result.steps}</TableCell>
                  <TableCell align="right">{result.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
