import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Game from './component/Game';

function App() {

  return (<>
      <BrowserRouter>
        {/* <Game /> */}
        <Routes>
          <Route path="/:textId" element={<Game />} />
          <Route path="*" element={<Game />} />
        </Routes>
      </BrowserRouter>
  </>
  );
}

export default App;
