import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';

const Chatbot = () => {
    const [prompt, setPrompt] = useState("");
    const [responses, setResponses] = useState([
        {
            text: "Hi! How can I assist you today?",
            type: "RESPONSE",
        },
    ]);

    const messagesEndRef = useRef(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [responses]);

    const submitPrompt = async (e) => {
        e.preventDefault();
        if (!prompt) return;
        
        // Display user's prompt
        setResponses([...responses, { text: prompt, type: "PROMPT" }]);
        const requestBody = {
            user_prompt: prompt
        }
        setPrompt("");
        try {
            const chatBotResponse = await axios.post('http://localhost:8000/kitaApp/chatbot', requestBody);
            console.log(chatBotResponse.data.message);
            const finalResponse = chatBotResponse.data.message;
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
