const SuccessPane = ({onClose, message}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-md max-w-md">
                <h2 className="text-2xl font-bold mb-4">{message.title}</h2>
                <p>{message.content}</p>
                <button
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md"
                    onClick={onClose}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default SuccessPane;
