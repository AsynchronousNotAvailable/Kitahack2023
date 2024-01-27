import React, { useState } from "react";
import {
    doc,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
} from "firebase/firestore";
import db from "../firebase.js";
import LoadingPane from "../components/Loading.js";
import SuccessPane from "../components/MessagePane.js";
import ConfirmationPane from "../components/ConfirmationPane.js";

function Create({
    loading,
    confirmPane,
    messagePane,
    toggleMessagePane,
    setMessage,
    message,
    toggleConfirmPane,
    confirmMessage,
    setConfirmMessage,
    setLoading,
}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [jsonData, setJsonData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [collectionName, setCollectionName] = useState("");
    const [fields, setFields] = useState([]);

    const rowsPerPage = 15;

    const totalPages = jsonData ? Math.ceil(jsonData.length / rowsPerPage) : 0;

    const tableCellStyle = "border px-4 py-2 text-center"; // Example styling
    const tableHeaderStyle =
        "border px-4 py-2 font-bold bg-gray-300 text-center"; // Example styling

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);

        const reader = new FileReader();

        reader.onload = (e) => {
            const csvData = e.target.result;
            const jsonData = convertCSVToJson(csvData);
            console.log(jsonData);
            setJsonData(jsonData);
        };

        reader.readAsText(file);
    };

    const convertCSVToJson = (csvData) => {
        const lines = csvData.split("\n");
        console.log(lines[0]);
        const headers = lines[0].split(",");
        headers[headers.length - 1] = headers[headers.length - 1].replace(
            /\r/g,
            ""
        );
        console.log(headers);
        setFields(headers);
        console.log('headers: ', fields);//store the headers into fields to be passed into metadata {}
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentLine = lines[i].split(",");

            if (currentLine.length === headers.length) {
                for (let j = 0; j < headers.length; j++) {
                    let header = headers[j] ? headers[j].trim() : "";
                    let value = currentLine[j] ? currentLine[j].trim() : "";

                    if (header === "Description")
                        value = value.replace(/"/g, "");

                    if (header === "Location") value = value.replace(/\r/g, "");

                    if (header === "Size") {
                        const pattern = /^"([\s\S]*)"/;
                        const match = value.match(pattern);
                        if (match) {
                            value = match[1];
                        }
                    }

                    obj[header] = value;
                }

                result.push(obj);
            }
        }

        return result;
    };

    const renderTableRows = () => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const currentPageData = jsonData
            ? jsonData.slice(startIndex, endIndex)
            : [];

        return currentPageData.map((row, index) => (
            <tr key={index}>
                {Object.values(row).map((value, i) => (
                    <td key={i} className={tableCellStyle}>
                        {value}
                    </td>
                ))}
            </tr>
        ));
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(jsonData.length / rowsPerPage);

        return (
            <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onSearchChange={handleSearchChange}
            />
        );
    };

    const Pagination = ({
        totalPages,
        currentPage,
        onPageChange,
        onSearchChange,
    }) => {
        return (
            <div className="min-h-min flex flex-1 justify-end gap-3">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-5 py-2.5 focus:ring-4 focus:ring-blue-300 bg-[#7B61FF] hover:bg-blue-500 rounded-lg font-medium cursor-pointer"
                >
                    &lt;
                </button>
                <span>
                    Page{" "}
                    <input
                        type="number"
                        value={currentPage}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />{" "}
                    of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-5 py-2.5 focus:ring-4 focus:ring-blue-300 bg-[#7B61FF] hover:bg-blue-500 rounded-lg font-medium cursor-pointer"
                >
                    &gt;
                </button>
            </div>
        );
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (value) => {
        const newPage = parseInt(value, 1);
        if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const downloadJsonFile = () => {
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleConfirm = async () => {
        return new Promise((resolve) => {
            setConfirmMessage({
                title: "Existing Collection Detected",
                content: `There is an existing collection named ${collectionName} in the database. Do you want to override it?`,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
            });
            // console.log(confirmMessage);
            toggleConfirmPane();
        });
    };

    const uploadToFirebase = async () => {
        console.log(fields);
        if (collectionName === "") {
            console.log("yes");
            setMessage({ title: "Error", content: "Collection Name is empty" });
            console.log(message)
            toggleMessagePane();
            return;
        }

        if (selectedFile === null) {
            setMessage({ title: "Error", content: "File Not Uploaded" });
            toggleMessagePane();
            return;
        }

        try {
            setLoading(true);
            //check from the metadata collection first
            const metadataCollectionRef = collection(db, "metadata");

            const metadataSnapshot = await getDocs(metadataCollectionRef);

            const existingCollections = metadataSnapshot.docs.map(
                (doc) => doc.data().name
            );

            //if exists, ask if want to override
            if (existingCollections.includes(collectionName)) {
                console.log("Existing Collection Detected");
                setLoading(false);

                const override = await handleConfirm();
                console.log("override:", override);
                if (override) {
                    //if override, update the metadata by its collectionName
                    console.log("override");
                    setLoading(true);
                    const collectionRef = collection(db, collectionName);
                    const existingDocsSnapshot = await getDocs(collectionRef);
                    existingDocsSnapshot.forEach(async (doc) => {
                        await deleteDoc(doc.ref);
                    });
                    for (const jsonObj of jsonData) {
                        await addDoc(collectionRef, jsonObj);
                    }

                    //update metadata
                    const metadataDoc = metadataSnapshot.docs.find(
                        (doc) => doc.data().name === collectionName
                    );
                    const metadataDocRef = doc(db, "metadata", metadataDoc.id);
                    await updateDoc(metadataDocRef, {
                        name: collectionName,
                        fields: fields,
                    });

                    console.log("Collection created successfully");
                    setLoading(false);
                    setMessage({
                        title: "Success",
                        content: "Collection overrided successfully",
                    });
                    toggleMessagePane();
                }
            } else {
                console.log("create new collection...");
                const metadata = { name: collectionName, fields: fields };
                console.log(metadata); //add one more "field" that stores an array of fields
                await addDoc(metadataCollectionRef, metadata);
                //create new collection, and push the collection name into "metadata" collection
                const collectionRef = collection(db, collectionName);
                await Promise.all(
                    jsonData.map(async (jsonObj) => {
                        await addDoc(collectionRef, jsonObj);
                    })
                );
                console.log("Collection created successfully");
                setLoading(false);
                setMessage({
                    title: "Success",
                    content: "Collection created successfully",
                });
                toggleMessagePane();
            }
        } catch (error) {
            console.error("Error saving JSON data to Firestore:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 rounded-md  flex justify-center border-black">
            {/* Main Container with Column Flex Direction */}
            <div className="flex flex-col mt-4 max-w-max">
                <h4 className="text-lg font-semibold ">Create Collection</h4>
                {/* First Row with Row Flex Direction */}
                <div className="flex flex-row mb-4 gap-4 border-black ">
                    {/* First Flex Item - Name Text and Input Field */}
                    <div className="flex flex-col mr-4 border-black ">
                        <input
                            type="text"
                            id="collectionName"
                            className="border border-gray-300 p-2 rounded-md"
                            placeholder="Enter collection name"
                            value={collectionName}
                            onChange={(e) => setCollectionName(e.target.value)}
                        />
                    </div>

                    {/* Second Flex Item - Choose File Button */}
                    <div className="flex">
                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="fileInput"
                                className="bg-[#E5E4FF] text-[#7B61FF] py-2 px-4 rounded-md hover:cursor-pointer"
                            >
                                Choose File
                            </label>
                            <input
                                type="file"
                                id="fileInput"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {selectedFile ? (
                                <span className="ml-2 whitespace-nowrap overflow-hidden overflow-ellipsis text-[#B6A5A5]">
                                    {selectedFile.name}
                                </span>
                            ) : (
                                <p className="text-[#B6A5A5]">No File Chosen</p>
                            )}
                        </div>
                    </div>

                    <div className="flex">
                        <div className="flex items-center">
                            <label
                                className="bg-[#7B61FF] text-white font-semibold py-2 px-4 rounded-md hover:cursor-pointer"
                                onClick={uploadToFirebase}
                            >
                                Save
                            </label>
                        </div>
                    </div>

                    <div className="flex">

                    </div>

                    {jsonData && renderPagination()}
                </div>

                {jsonData ? (
                    <div className="max-w-full overflow-x-auto mx-auto">
                        {" "}
                        {/* Updated class */}
                        <table className="w-full">
                            {" "}
                            {/* Updated class */}
                            <thead>
                                <tr>
                                    {Object.keys(jsonData[0]).map((header) => (
                                        <th
                                            key={header}
                                            className={tableHeaderStyle}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>{renderTableRows()}</tbody>
                        </table>
                    </div>
                ) : (
                    <p>Please select a CSV file.</p>
                )}
            </div>
            {loading && <LoadingPane />}
            {messagePane && (
                <SuccessPane onClose={toggleMessagePane} message={message} />
            )}
            {confirmPane && (
                <ConfirmationPane
                    onClose={toggleConfirmPane}
                    message={confirmMessage}
                />
            )}
        </div>
    );
}

export default Create;
