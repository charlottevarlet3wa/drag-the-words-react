// import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Game from './component/Game';

function App() {

  return (<>
      <Router>
      <Switch>
        <Route path="/1" component={<Game/>} />
      </Switch>
    </Router>
      {/* <BrowserRouter>
        <Routes>
          <Route path="/:textId" element={<Game />} />
          <Route path="*" element={<Game />} />
        </Routes>
      </BrowserRouter> */}
  </>
  );
}

export default App;
