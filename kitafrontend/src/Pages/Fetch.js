import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import db from "../firebase.js";
import LoadingPane from "../components/Loading.js";
import { Link } from "react-router-dom";

function Fetch({ selectedCollection }) {
    const [loading, setLoading] = useState(false);
    const [collections, setCollections] = useState([]);
    const [metaData, setMetadata] = useState("");

    const [collectionData, setCollectionData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15;
    const totalPages = collectionData
        ? Math.ceil(collectionData.length / rowsPerPage)
        : 0;
 

    const fetchData = async (collectionName) => {
        try {
            setLoading(true);
            // setSelectedCollection(collectionName);
            const collectionRef = collection(db, collectionName);
            const collectionSnapshot = await getDocs(collectionRef);
            const data = collectionSnapshot.docs.map((doc) => doc.data());
            console.log(data);

            setCollectionData(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    useEffect(() => {
        // fetchMetaData(selectedCollection);
        fetchData(selectedCollection);
    }, [selectedCollection]);

    const renderTableRows = () => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const currentPageData = collectionData
            ? collectionData.slice(startIndex, endIndex)
            : [];

        const keys =
            currentPageData.length > 0 ? Object.keys(currentPageData[0]) : [];

        return currentPageData.map((row, rowIndex) => (
            <tr key={rowIndex}>
                {keys.map((key, columnIndex) => (
                    <td key={columnIndex} className={tableCellStyle}>
                        {row[key]}
                    </td>
                ))}
            </tr>
        ));
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(collectionData.length / rowsPerPage);

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
            <div className="flex flex-1 items-end justify-end">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
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

    const tableCellStyle = "border px-4 py-2 text-center"; // Example styling
    const tableHeaderStyle =
        "border px-4 py-2 font-bold bg-[#E8EAFF] text-center"; // Example styling

    return (
        <div className="h-full bg-gray-50 p-4 rounded-md w-full min-w-min flex flex-col justify-center items-center">
            <div className="flex flex-col mt-4">
                <div className="flex flex-col mb-4 ">
                    <div className="flex flex-col">
                        {selectedCollection && (
                            <div className="mt-2 max-w-full overflow-x-auto mx-auto">
                                <div className="flex flex-row items-center gap-4">
                                    {" "}
                                    <h2 className="text-lg font-semibold ">
                                        {selectedCollection}
                                    </h2>
                                    <Link to="update">
                                        <button
                                            type="submit"
                                            class="text-black bg-[#7B61FF] hover:bg-blue-500 w-full focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 "
                                        >
                                            + new record
                                        </button>
                                    </Link>
                                </div>

                                {collectionData.length > 0 ? (
                                    <div className="flex flex-col">
                                        {collectionData && renderPagination()}{" "}
                                        {/* Updated class */}
                                        <table className="w-full">
                                            {" "}
                                            {/* Updated class */}
                                            <thead>
                                                <tr>
                                                    {Object.keys(
                                                        collectionData[0]
                                                    ).map((header) => (
                                                        <th
                                                            key={header}
                                                            className={
                                                                tableHeaderStyle
                                                            }
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
                                    <p>
                                        No data available for{" "}
                                        {selectedCollection}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center"></div>

            {loading && <LoadingPane />}
        </div>
    );
}

export default Fetch;
