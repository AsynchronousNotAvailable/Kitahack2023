import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';
import { toast } from "react-toastify";

const Chatbot = () => {
    const [prompt, setPrompt] = useState("");
    const [responses, setResponses] = useState([
        {
            text: "Hi! How can I assist you today?",
            type: "RESPONSE",
        },
    ]);

    const [chatId, setChatId] = useState("");
    // const chatId = "xYjdnbogCKnArWBmTr8f";

    // Function to save chatId to local storage
    const saveChatIdToLocalStorage = (id) => {
        console.log(id, "saved to local storage")
        localStorage.setItem("chatId", id);
    };

    // Function to retrieve chatId from local storage
    const getChatIdFromLocalStorage = () => {
        return localStorage.getItem("chatId");
    };

    const startNewChat = async () => {
        try {
            const response = await axios.post('/kitaApp/initialize_chat');
            
            if (response.status === 200) {
                const sessionId = response.data["query_id"];
                console.log("New chat started");
                // Notify user that chat has been started
                console.log(sessionId);
                setChatId(sessionId);

                // Save chatId to local storage
                saveChatIdToLocalStorage(sessionId);

                toast.success("New chat started!");
                setResponses([
                    {
                        text: "Hi! How can I assist you today?",
                        type: "RESPONSE",
                    },
                ]);
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    const messagesEndRef = useRef(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const storedChatId = getChatIdFromLocalStorage();
        if (storedChatId) {
            setChatId(storedChatId);
            console.log(storedChatId);
        }
        scrollToBottom();
    }, [responses]);

    const submitPrompt = async (e) => {
        e.preventDefault();
        if (!prompt) return;
        
        // Display user's prompt
        setResponses([...responses, { text: prompt, type: "PROMPT" }]);
        const requestBody = {
            "user_prompt": prompt,
            "query_id": chatId
        }
        try {
            const chatBotResponse = await axios.post('/kitaApp/chatbot', requestBody);
            console.log(chatBotResponse.data.message);
            const finalResponse = chatBotResponse.data["response"];
            setResponses((prevResponses) => [
                ...prevResponses,
                { text: finalResponse, type: "RESPONSE" },
            ]);
        }
        catch (e) {
            console.log(e);
        }
        
        
        setPrompt("");
    };

    return (
        <div className="poppins p-4 rounded-lg flex flex-col justify-between h-[calc(100vh-65px)] w-full mx-auto">
            <div className="mb-4 overflow-y-scroll flex flex-col gap-4">
                {responses.map((resp, index) => (
                    <div
                        key={index}
                        className={`${
                            resp.type === "PROMPT" ? "justify-end" : "response"
                        } flex ${
                            resp.type === "RESPONSE" ? "justify-start" : ""
                        }`}
                    >
                        {resp.type !== "PROMPT" && (
                            <img
                                className="h-14 w-14 mr-4 object-cover rounded-full"
                                src="/chatbot_logo.png"
                                alt="Chatbot Logo"
                            />
                        )}

                        <p
                            className={
                                resp.type === "PROMPT"
                                    ? "bg-[#7B61FF] text-white p-4 rounded-lg"
                                    : "bg-[#ECEBFF] p-4 rounded-lg"
                            }
                            style={{ whiteSpace: "pre-line" }} // Add this style to preserve newlines
                        >
                            {resp.text}
                        </p>

                        {resp.type !== "RESPONSE" && (
                            <img
                                className="h-14 w-14 ml-4 object-cover rounded-full"
                                src="/user_icon.png"
                                alt="User Logo"
                            />
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="rounded-lg">
                <button
                    // rectanglular filled button
                    // className="border-2 border-black rounded-full h-14 w-fit-content mb-4" filled button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-5"
                    onClick={() => startNewChat()}
                >
                    New Chat
                </button>
                <form className="flex flex-row">
                    <input
                        autoFocus
                        className="flex-1 mr-4 p-4 rounded-lg border-2 border-black"
                        type="text"
                        placeholder="Enter a prompt here"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button
                        className="flex-2 border-2 border-black rounded-full h-14 w-14"
                        onClick={(e) => submitPrompt(e)}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
