import "./App.css";
import Navbar from "./components/Navbar";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    BrowserRouter,
} from "react-router-dom";

import Create from "./Pages/Create";
import Fetch from "./Pages/Fetch";
import Update from "./components/Update";
import Chatbot from "./Pages/Chatbot";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    const [selectedCollection, setSelectedCollection] = useState();
    const [message, setMessage] = useState(false);
    const [messagePane, setMessagePane] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState(
        false
    );
    const [confirmPane, setConfirmPane] = useState(false);
    const toggleMessagePane = () => {
        setMessagePane(!messagePane);
    };
    const toggleConfirmPane = () => {
        setConfirmPane(!confirmPane);
    };
    return (
        <BrowserRouter>
            <ToastContainer />
            <div className=" ">
                <Navbar
                    selectedCollection={selectedCollection}
                    setSelectedCollection={setSelectedCollection}
                />
            </div>

            <Routes>
                <Route
                    path="/"
                    element={<Fetch selectedCollection={selectedCollection} />}
                />

                <Route
                    path="create"
                    element={
                        <Create
                            loading={loading}
                            setLoading={setLoading}
                            messagePane={messagePane}
                            confirmPane={confirmPane}
                            toggleMessagePane={toggleMessagePane}
                            toggleConfirmPane={toggleConfirmPane}
                            setMessage={setMessage}
                            message={message}
                            confirmMessage={confirmMessage}
                            setConfirmMessage={setConfirmMessage}
                        />
                    }
                />
                <Route
                    path="update"
                    element={
                        <Update
                            
                            selectedCollection={selectedCollection}
                            messagePane={messagePane}
                            setMessage={setMessage}
                            message={message}
                            toggleMessagePane={toggleMessagePane}
                        />
                    }
                />

                <Route path="chatbot" element={<Chatbot />} />
            </Routes>

            {/* <Footer /> */}
        </BrowserRouter>
    );
}

export default App;
