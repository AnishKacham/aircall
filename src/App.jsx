import React, {useState} from 'react';
import ReactDOM from 'react-dom'; 
import './globals.css';
import Header from './Header.jsx';
import CallActivity from './pages/CallActivity.jsx';
import CallTabs from './components/CallTabs.jsx';
import CallArchive from './pages/CallArchive.jsx';

const App = () => {
  const [tabIndex,setTabIndex] = useState(0);

  return (
    <div className='container'>
      <CallTabs tabIndex={tabIndex} changeTabIndex={setTabIndex} />

      {tabIndex === 0 && <CallActivity/>}
      {tabIndex === 1 && <CallArchive/> }
    </div>
  );
};

ReactDOM.render(<App/>, document.getElementById('app'));

export default App;
