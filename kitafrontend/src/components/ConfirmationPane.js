const ConfirmationPane = ({ onClose, message }) => {
    const handleYes = () => {
        message.onConfirm(); // Call the callback function for "YES"
        onClose();
    };

    const handleNo = () => {
        message.onCancel(); // Call the callback function for "NO"
        onClose();
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-md max-w-md">
                <h2 className="text-2xl font-bold mb-4">{message.title}</h2>
                <p>{message.content}</p>

                <div className="flex flex-row gap-2">
                    <button
                        className="flex mt-4 bg-blue-500 text-white py-2 px-4 rounded-md"
                        onClick={handleYes}
                    >
                        YES
                    </button>

                    <button
                        className="flex mt-4 bg-red-500 text-white py-2 px-4 rounded-md"
                        onClick={handleNo}
                    >
                        NO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPane;