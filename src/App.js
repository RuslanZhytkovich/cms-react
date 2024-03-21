import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Registration from "./components/registration/register";
import Login from "./components/login/login";

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <header className="App-header">
                    <h1>Header</h1>
                </header>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Registration />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;

