import {
  useState,
  useEffect,
  useRef,
  useReducer,
  createContext,
  useMemo,
  useContext,
} from 'react'
import './App.css'
import useInterval from 'use-interval'

function gridInitial() {
  return Array.from({length: 100}, () => {
    return Array.from({length: 100}, () => Math.trunc(Math.random() * 100))
  })
}
const GridContext = createContext()

function updateGrid(grid) {
  return grid.map(row => {
    return row.map(col =>
      Math.random() > 0.7 ? Math.trunc(Math.random() * 100) : col,
    )
  })
}

function updateCell(grid, {row, col}) {
  return grid.map((_row, rI) => {
    if (rI !== row) return _row
    return _row.map((_col, cI) => {
      if (cI !== col) return _col
      return Math.trunc(Math.random() * 100)
    })
  })
}

const gridActions = {updateGrid: 'updateGrid', updateCell: 'updateCell'}
function gridReducer(state, action) {
  switch (action.type) {
    case gridActions.updateGrid:
      return {...state, grid: updateGrid(state.grid)}

    case gridActions.updateCell:
      return {...state, grid: updateCell(state.grid, action)}

    default:
      throw new Error(
        `action ${action.type} is not handled in grid reducer function`,
      )
  }
}
function GridProvider(props) {
  const [state, dispatch] = useReducer(
    gridReducer,
    {grid: gridInitial()},
    init => init,
  )
  const value = useMemo(() => [state, dispatch], [state])
  return (
    <GridContext.Provider value={value}>{props.children}</GridContext.Provider>
  )
}

function useGridContext() {
  let context = useContext(GridContext)
  if (!context)
    throw new Error('gridContext can be used only within GridProvider')
  return context
}

function Interval() {
  const [, dispatch] = useGridContext()
  const updateGrid = () => dispatch({type: gridActions.updateGrid})
  useInterval(updateGrid, 200)
  return null
}

function GridImpl({rows, cols, setRows, setCols, updateGridHandler, Cell}) {
  const [keepUpdated, setKeepUpdate] = useState(false)

  const grid = Array.from({length: rows}, (_, _row) => {
    return (
      <div key={_row} style={{}}>
        {Array.from({length: cols}, (_, _col) => (
          <div key={_col}>
            <Cell row={_row} col={_col} />
          </div>
        ))}
      </div>
    )
  })
  return (
    <>
      <button type="button" onClick={updateGridHandler}>
        Update Grid Data
      </button>
      <form onSubmit={e => e.preventDefault()}>
        <label htmlFor="keepUpdated">Keep Grid Data updated</label>
        <input
          type="checkbox"
          name="updatedCheckBox"
          id="keepUpdated"
          checked={keepUpdated}
          value={keepUpdated}
          onChange={e => {
            console.log(e.target.checked)
            setKeepUpdate(e.target.checked)
          }}
        />
        <label htmlFor="rowsDisplay">Rows to display</label>
        <input
          type="number"
          id="rowsDisplay"
          min={1}
          max={100}
          defaultValue={rows}
          onChange={e => setRows(e.target.value)}
        />
        <label htmlFor="colsDisplay">Cols to display</label>
        <input
          type="number"
          id="colsDisplay"
          min={1}
          max={100}
          defaultValue={cols}
          onChange={e => setCols(e.target.value)}
        />
      </form>
      {keepUpdated ? <Interval grid={grid} /> : null}
      <div
        style={{
          maxWidth: 800,
          maxHeight: 800,
        }}
      >
        {grid}
      </div>
    </>
  )
}

function Grid() {
  const [, dispatch] = useGridContext()
  const [rows, setRows] = useState(50)
  const [cols, setCols] = useState(50)
  const updateGrid = () => dispatch({type: gridActions.updateGrid})

  return (
    <GridImpl
      rows={rows}
      setRows={setRows}
      cols={cols}
      setCols={setCols}
      updateGridHandler={updateGrid}
      Cell={Cell}
    />
  )
}

function Cell({row, col}) {
  const [state, dispatch] = useGridContext()
  const cell = state.grid[row][col]

  return (
    <div
      className="cell"
      style={{width: 40, height: 40}}
      onClick={() => dispatch({type: gridActions.updateCell, row, col})}
    >
      {cell}
    </div>
  )
}

function App() {
  return (
    <>
      <GridProvider>
        <p>Hello world</p>
        <div className="grid-app">
          <Grid />
        </div>
      </GridProvider>
    </>
  )
}

export default App
