import { Fragment, useState, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
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

const Navigation = [
    { name: "Dashboard", href: "/", current: false },
    { name: "Chatbot", href: "/chatbot", current: false },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Navbar({selectedCollection, setSelectedCollection}) {
    const [loading, setLoading] = useState(false);
    const [collections, setCollections] = useState([]);
    // const [selectedCollection, setSelectedCollection] = useState("");
    

    const [navigation, setNavigation] = useState(Navigation);
    const location = useLocation();

    useEffect(() => {
        // Update the current state based on the current path
        setNavigation((prevNavigation) => {
            return prevNavigation.map((item) => ({
                ...item,
                current: item.href === location.pathname,
            }));
        });
    }, [location]);

    useEffect(() => {
        syncDatabase();
        
        // console.log("collections:", collections);
    }, []);

    const syncDatabase = async () => {
        setLoading(true);

        const metadataCollectionRef = collection(db, "metadata");

        const metadataSnapshot = await getDocs(metadataCollectionRef);

        const existingCollections = metadataSnapshot.docs.map(
            (doc) => doc.data().name
        );

        console.log("Existing Collection: " + existingCollections);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setCollections(existingCollections);

        //set the default selected collection for the first collection
        setSelectedCollection(existingCollections[0]);

        setLoading(false);
    };

    const loadCollection = (collectionName) => {
        setSelectedCollection(collectionName);
    }

    // const fetchMetaData = async (collectionName) => {
    //     try {
    //         console.log(collectionName);
    //         const metadataRef = collection(db, "metadata");
    //         const metaDataSnapshot = await getDocs(metadataRef);
    //         const metadataDoc = metaDataSnapshot.docs.find(
    //             (doc) => doc.data().name === collectionName
    //         );
    //         setSelectedCollection(collectionName);
    //         console.log(selectedCollection);
    //         const metadataFields = metadataDoc.data().fields;
    //         setMetadata(metadataFields);

    //         console.log(metadataFields);
    //     } catch (error) {
    //         console.log("Error fetching metadata:", error);
    //     }
    // };

    return (
        <Disclosure
            as="nav"
            className="bg-gray-800 absolute w-full z-40 sticky text-white"
        >
            {({ open }) => (
                <>
                    <div
                        id="drawer-contact"
                        class="fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform -translate-x-full w-80 bg-gray-800"
                        tabindex="-1"
                        aria-labelledby="drawer-contact-label"
                    >
                        <h5
                            id="drawer-label"
                            class="inline-flex items-center mb-6 text-base font-semibold  text-white uppercase "
                        >
                            Collection
                        </h5>
                        <button
                            type="button"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={syncDatabase}
                        >
                            {loading ? (
                                <i class="fa-solid fa-rotate fa-spin"></i>
                            ) : (
                                <i class="fa-solid fa-rotate"></i>
                            )}

                            <span class="sr-only">Sync Database</span>
                        </button>
                        <div class="mb-6">
                            {collections.length > 0 && (
                                <div class=" bg-gray-800 mb-6">
                                    <ul class="space-y-2 font-medium">
                                        {collections.map(
                                            (collectionName, index) => (
                                                <li>
                                                    <a
                                                        className={`${
                                                            selectedCollection ===
                                                            collectionName
                                                                ? "bg-[#6366F1]"
                                                                : "bg-gray-200"
                                                        } flex items-center px-4 py-2 gap-2 text-black rounded-lg`}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            height="14"
                                                            width="12.25"
                                                            viewBox="0 0 448 512"
                                                        >
                                                            <path
                                                                fill="#ffffff"
                                                                d="M448 80v48c0 44.2-100.3 80-224 80S0 172.2 0 128V80C0 35.8 100.3 0 224 0S448 35.8 448 80zM393.2 214.7c20.8-7.4 39.9-16.9 54.8-28.6V288c0 44.2-100.3 80-224 80S0 332.2 0 288V186.1c14.9 11.8 34 21.2 54.8 28.6C99.7 230.7 159.5 240 224 240s124.3-9.3 169.2-25.3zM0 346.1c14.9 11.8 34 21.2 54.8 28.6C99.7 390.7 159.5 400 224 400s124.3-9.3 169.2-25.3c20.8-7.4 39.9-16.9 54.8-28.6V432c0 44.2-100.3 80-224 80S0 476.2 0 432V346.1z"
                                                            />
                                                        </svg>
                                                        <button
                                                            key={index}
                                                            value={
                                                                collectionName
                                                            }
                                                            onClick={() =>
                                                                loadCollection(
                                                                    collectionName
                                                                )
                                                            }
                                                        >
                                                            {collectionName}
                                                        </button>
                                                    </a>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}
                            <Link to="create">
                                <button
                                    type="submit"
                                    class="text-black bg-white hover:bg-blue-500 w-full focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 block"
                                >
                                    + new collection
                                </button>
                            </Link>
                        </div>
                        <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <a href="#" class="hover:underline">
                                opensauce@gmail.com
                            </a>
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            <a href="#" class="hover:underline">
                                +60 3 7733 2858
                            </a>
                        </p>
                    </div>

                    <div
                        className="font-poppins mx-auto px-2 sm:px-6 lg:px-8"
                        id="navbar"
                    >
                        <div className="relative flex h-20 items-center justify-between">
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                {/* company logo */}
                                <div className="flex flex-shrink-0 items-center gap-1">
                                    <a href="/">
                                        <img
                                            className="h-7 w-auto"
                                            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                                            alt="Your Company"
                                        />
                                    </a>
                                    <span className="text-lg font-semibold">
                                        OpenSauce
                                    </span>
                                </div>

                                <div className="hidden sm:ml-6 sm:block">
                                    <button
                                        type="button"
                                        data-drawer-target="drawer-contact"
                                        data-drawer-show="drawer-contact"
                                        aria-controls="drawer-contact"
                                        class="z-99 text-white bg-blue-500 hover:bg-purple-500 duration-150 font-medium rounded-xl text-md px-5 py-3"
                                    >
                                        Show Collections
                                    </button>
                                </div>
                            </div>

                            <div className="hidden sm:ml-6 sm:block">
                                <div className="flex space-x-6">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={classNames(
                                                item.current
                                                    ? "bg-gray-200 text-black"
                                                    : "text-black-300 hover:bg-gray-700 hover:text-white duration-300",
                                                "rounded-lg px-3 py-3 text-md font-medium "
                                            )}
                                            aria-current={
                                                item.current
                                                    ? "page"
                                                    : undefined
                                            }
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Disclosure>
    );
}
