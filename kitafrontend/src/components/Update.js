import React, { useEffect, useState } from "react";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
} from "firebase/firestore";
import db from "../firebase.js";
import LoadingPane from "./Loading.js";
import SuccessPane from "./MessagePane.js";

function Update({ toggleMessagePane, setMessage, selectedCollection, messagePane, message}) {
    const [loading, setLoading] = useState(false);
    const [collections, setCollections] = useState([]);
    const [collectionData, setCollectionData] = useState({});
    const [metadata, setMetadata] = useState([]);

    // const syncDatabase = async () => {
    //     setLoading(true);
        
    //     const metadataCollectionRef = collection(db, "metadata");

    //     const metadataSnapshot = await getDocs(metadataCollectionRef);

    //     const existingCollections = metadataSnapshot.docs.map(
    //         (doc) => doc.data().name
    //     );
    //     await new Promise((resolve) => setTimeout(resolve, 2000));
    //     setCollections(existingCollections);
        
    //     setLoading(false);
    // };
    useEffect(() => {
        console.log("From update", selectedCollection);
        fetchMetaData(selectedCollection);
    }, [selectedCollection])

    const fetchMetaData = async (collectionName) => {
        try {
            console.log(collectionName);
            const metadataRef = collection(db, "metadata");
            const metaDataSnapshot = await getDocs(metadataRef);
            const metadataDoc = metaDataSnapshot.docs.find(
                (doc) => doc.data().name === collectionName
            );
            // setSelectedCollection(collectionName);
            const metadataFields = metadataDoc.data().fields;
            setMetadata(metadataFields);

            console.log(metadataFields);
        } catch (error) {
            console.log("Error fetching metadata:", error);
        }
    };

    const handleInputChange = (fieldName, e) => {
        const newCollectionData = {
            ...collectionData,
            [fieldName]: e.target.value,
        };
        setCollectionData(newCollectionData);
        console.log(newCollectionData);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const collectionDataRef = collection(db, selectedCollection);
            console.log(selectedCollection);
            await addDoc(collectionDataRef, collectionData);
            console.log("Data saved:", collectionData);
            setCollectionData({});
            // const message = {
            //     title: "Success",
            //     content: "New Record Added Successfully!",
            // };
            setMessage({
                title: "Success",
                content: "New Record Added Successfully!",
            });
            setLoading(false);
            toggleMessagePane();
            
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 p-4 rounded-md w-full min-w-min flex flex-col justify-center items-center">
            {/* <div className="flex">
                <button
                    htmlFor="fileInput"
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:cursor-pointer"
                    onClick={syncDatabase}
                >
                    Sync Database
                </button>
            </div> */}

            {metadata.length > 0 && (
                <div className="mt-4">
                    <table className="table-auto">
                        <tbody>
                            {[...Array(Math.ceil(metadata.length / 4))].map(
                                (_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {metadata
                                            .slice(
                                                rowIndex * 4,
                                                (rowIndex + 1) * 4
                                            )
                                            .map((field, colIndex) => (
                                                <React.Fragment key={colIndex}>
                                                    <td className="border px-4 py-2">
                                                        {field}
                                                    </td>
                                                    <td className="border px-4 py-2">
                                                        <input
                                                            type="text"
                                                            value={
                                                                collectionData[
                                                                    field
                                                                ] || ""
                                                            }
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    field,
                                                                    e
                                                                )
                                                            }
                                                            className="px-2 py-1 border rounded"
                                                        />
                                                    </td>
                                                </React.Fragment>
                                            ))}

                                        <td className="border px-4 py-2">
                                            {rowIndex === 0 && (
                                                <button
                                                    className="bg-blue-500 text-white py-2 px-4 rounded-md"
                                                    onClick={handleSave}
                                                >
                                                    Add
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {loading && <LoadingPane />}
            {messagePane && (
                <SuccessPane onClose={toggleMessagePane} message={message} />
            )}
        </div>
    );
}

export default Update;
