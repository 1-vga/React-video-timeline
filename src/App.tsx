import { Timeline } from './timeline'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import './App.css';

function App() {
  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
					<Timeline />
			</DndProvider>
    </div>
  );
}

export default App;
