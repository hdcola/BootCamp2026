import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import TextInput from './components/textbox.jsx';
import Citycard from './components/citytemweather.jsx';


function App() {
  return (
    <div className="app-container">



      <div className='app'>
        <Citycard />
      </div>



    </div>
  );
}

export default App;