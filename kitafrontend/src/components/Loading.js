import React from "react";

const LoadingPane = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-99">
            <div className="bg-white p-8 rounded-md max-w-md">
                <div className="flex items-center justify-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-b-2 border-gray-500"></div>
                </div>
                <h2 className="text-2xl font-bold mb-4">Processing Request</h2>
                <p>Please wait while we process your request...</p>
            </div>
        </div>
    );
};

export default LoadingPane;
