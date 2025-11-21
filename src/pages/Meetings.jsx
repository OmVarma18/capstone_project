import React from "react";
import Navbar from "../components/Navbar";

const MeetingsPage = () => {
    return (
        <div className="flex flex-col min-h-screen w-full bg-[#0c0321] text-white font-display pt-18">
          

            <main className="flex-1 p-10 overflow-auto relative">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-wrap justify-between gap-6 items-center mb-8">
                        <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                            My Meetings
                        </h1>

                        {/* Stats Cards */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col gap-2 rounded-lg p-4 bg-[#1a0938] border border-[#2a1255] min-w-[200px]">
                                <p className="text-gray-300 text-sm font-medium leading-normal">
                                    Meetings This Week
                                </p>
                                <p className="text-white text-2xl font-bold leading-tight">
                                    7
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 rounded-lg p-4 bg-[#1a0938] border border-[#2a1255] min-w-[200px]">
                                <p className="text-gray-300 text-sm font-medium leading-normal">
                                    Upcoming Tasks
                                </p>
                                <p className="text-white text-2xl font-bold leading-tight">
                                    3
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters Section */}
                    <div className="mt-6 flex flex-wrap gap-4 items-center">
                        {/* Search Input */}
                        <div className="flex-grow min-w-72">
                            <div className="flex w-full items-stretch rounded-lg h-12">
                                <div className="text-gray-400 flex bg-[#1a0938] border border-[#2a1255] items-center justify-center px-4 rounded-l-lg ">
                                    <span className="material-symbols-outlined">Search</span>
                                </div>
                                <input
                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-white bg-[#1a0938] border border-[#2a1255] border-l-0 h-full placeholder:text-gray-400 px-4 text-base font-normal leading-normal focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Search by meeting title, participant..."
                                />
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-center gap-2">
                            <button className="flex items-center justify-center h-12 px-4 rounded-lg bg-[#1a0938] text-gray-200 text-sm font-medium border border-[#2a1255] hover:bg-[#241044] hover:border-purple-500 transition-colors">
                                <span>Date Range</span>
                                <span className="material-symbols-outlined text-lg ml-1">expand_more</span>
                            </button>
                            <button className="flex items-center justify-center h-12 px-4 rounded-lg bg-[#1a0938] text-gray-200 text-sm font-medium border border-[#2a1255] hover:bg-[#241044] hover:border-purple-500 transition-colors">
                                <span>Participants</span>
                                <span className="material-symbols-outlined text-lg ml-1">expand_more</span>
                            </button>
                        </div>
                    </div>

                    {/* Meetings Table */}
                    <div className="mt-8 overflow-x-auto">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden rounded-xl border border-[#2a1255]">
                                <table className="min-w-full divide-y divide-[#2a1255]">
                                    <thead className="bg-[#1a0938]">
                                        <tr>
                                            <th className="py-3.5 px-6 text-left text-sm font-semibold text-gray-300" scope="col">
                                                Meeting Title
                                            </th>
                                            <th className="py-3.5 px-6 text-left text-sm font-semibold text-gray-300" scope="col">
                                                Date
                                            </th>
                                            <th className="py-3.5 px-6 text-left text-sm font-semibold text-gray-300" scope="col">
                                                Participants
                                            </th>
                                            <th className="relative py-3.5 px-6" scope="col">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2a1255] bg-[#0c0321]">
                                        {/* Meeting 1 */}
                                        <tr className="hover:bg-[#1a0938]/50 transition-colors">
                                            <td className="whitespace-nowrap py-4 px-6 text-sm font-medium text-white">
                                                Q4 Product Strategy Review
                                            </td>
                                            <td className="whitespace-nowrap py-4 px-6 text-sm text-gray-300">
                                                October 26, 2023
                                            </td>
                                            <td className="whitespace-nowrap py-4 px-6 text-sm text-gray-300">
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    <img
                                                        className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0c0321]"
                                                        data-alt="Participant avatar 1"
                                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWgtH1mBZk7u1M6q1utBzWdKDQtSqpMaNarFXBamvv057jK2sPUZnV7ClnYIIk4Q5lhe4YCqun3KmOfN4kavrL0D1aDTzH7bZ3XF1cEO6J6Iz0MvpgEBJi3OfIl2sIHU-ujEFq4ptiIhqAadCsmOI-DwgGmrgt_IHuJii2PkTyNtYj0CLMzvprnO8DzfmnSX6etU2ia3Xj2CaesxxBi5qwtcwBtaLp_Zt59PYiTCC2wIvzZIfQcoiiCjgITm54VRM4dV9iCExq0kA"
                                                    />
                                                    <img
                                                        className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0c0321]"
                                                        data-alt="Participant avatar 2"
                                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-C7m7IcfMCv0pQetZzylnjCI3g0C62LYFohZnsqwXfgKXYF6PGe7tcL5qShvgep4GKllSXEoUYc5T1fupXUZmMccGhm5Ih7bN0VCikAWIYVMgubkdxrijXXFap4W4UMuO3D1lb1ewIxd3ws83Yt1yofJxs3hP0GhmqmFHOFToEGXvfh7GV4l3d22vNrh_zLhR95wjkY-8G-tpWKXz8Kshx8J120AO_lZopXDwyUi-eHHOxLynAAAhFP2CNG3knnUq5pX0QnzH8yY"
                                                    />
                                                    <img
                                                        className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0c0321]"
                                                        data-alt="Participant avatar 3"
                                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBllQMrZB3AJp_OZPdww8wA-D7oxp5KpGsYV7ZI_puXsZXqkAnMOZy3bYXW-b9QFkBbhdYkGRIDR6xnLGX9yt5rCynUJ4xv3s5AogwwWGly5vTXxEeAmu_NQ8sOV7Xa0BNC9TybpNeuGqgBHfuutIDsipOH-59M2pfEWYhguOPFQR8YvzEzo09hRthHiheMJIZKiEYBviZaMB9ThHmBq7GANuXYG0FczVgaijH00O8kOU-u-r9N_BbZLlHqvVqvLfrZXUn9m0aZtAs"
                                                    />
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap py-4 px-6 text-right text-sm font-medium space-x-2">
                                                <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
                                                    <span className="material-symbols-outlined text-xl">description</span>
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
                                                    <span className="material-symbols-outlined text-xl">edit</span>
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Meeting 2 */}
                                        <tr className="hover:bg-[#1a0938]/50 transition-colors">
                                            <td className="whitespace-nowrap py-4 px-6 text-sm font-medium text-white">
                                                Marketing Campaign Sync
                                            </td>
                                            <td className="whitespace-nowrap py-4 px-6 text-sm text-gray-300">
                                                October 25, 2023
                                            </td>
                                            <td className="whitespace-nowrap py-4 px-6 text-sm text-gray-300">
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    <img
                                                        className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0c0321]"
                                                        data-alt="Participant avatar 4"
                                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOiIM0-LxKiSYqjDFIAiFlgH77Edx1n7qlX6pE0CEz8HrNOm0jkX22jAIqsMUi8Ty8Gd6UeXKs1UDi2yIitEFhj3qdVyLODF21-G8bSGfhIBhmBk9SqTocS8fPk2QQqNGNapojTKMVE4ItTF7TA2w-XT3jgoW-GzPUsiritwOMtMNWKpx0XZ8JzY2NrUCns0_L8_5px1hTvVD0WjWa7d9q58auDj1Z0pHAsY-gfhwQqdc5TXnxDRT8lPAbFWnIDdmnp6huyFFNoNU"
                                                    />
                                                    <img
                                                        className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0c0321]"
                                                        data-alt="Participant avatar 2"
                                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqnWKv_CLNjd5IIT_Y-K-wZ4rGeki7rZLCsPsMpUljERKBSqHJMIoYz4T8_XgLeR-0yhaU7lokM4VccNDmohgNNGu82Akd2hCVcMlez5szxgI28629gaT8RPPM4hA776hkAYR59FdnBR3NdqPaqjKkuZPV4GrKp8s8A_3sYhuoobR2N8mxb2xFyOmxKiR0Txdc25VpgQBXmFed1yPv34xgWEzOa4U9eML_8m0QRY6Gg41kwxvksiLfsEFJY2aUNXF-3cOMA09_uko"
                                                    />
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap py-4 px-6 text-right text-sm font-medium space-x-2">
                                                <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
                                                    <span className="material-symbols-outlined text-xl">description</span>
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
                                                    <span className="material-symbols-outlined text-xl">edit</span>
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Meeting 3 */}
                                        <tr className="hover:bg-[#1a0938]/50 transition-colors">
                                            <td className="whitespace-nowrap py-4 px-6 text-sm font-medium text-white">
                                                Weekly Design Standup
                                            </td>
                                            <td className="whitespace-nowrap py-4 px-6 text-sm text-gray-300">
                                                October 24, 2023
                                            </td>
                                            <td className="whitespace-nowrap py-4 px-6 text-sm text-gray-300">
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    <img
                                                        className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0c0321]"
                                                        data-alt="Participant avatar 1"
                                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGQ0wdAYl0yOc9JxUDhxRIB_HeR95alvaue0-UG-QTccniMKoslrp-QxnHUJgp09R75htiePbXH8DW5z3iCpaNB5s4mVUG5vkHxnb2y56pc_zKoSLxuNvfdzyH7TJWVunF8RwkP1tLoEkR0O2IiUEQxn-tqUkcj0m8IgJNzQqyix31Od3AuEoZMpttRdhGaD8UpscI9yRgdjegf3abtOi30pS4IXxU68T34_ofmt4F3uqqRsVYEWsX83lMZG9lTf8VA5u19bdT4jU"
                                                    />
                                                    <img
                                                        className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0c0321]"
                                                        data-alt="Participant avatar 3"
                                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEnDbAsYYgUIRcV912FQ5KWy4OVb3jMHtckJl1Pv2A8a-FxFSnp7X2MFAW6x0Q-ot6N4G4fLi3i06Px5Q3kJ-0AKV-uDs58C_YiYF7YrR2SzqEAUCSCvPZacYT1vwn3JITVTEoy9k7n5LdI7mz2jtvPis17ocdubiPvZieU3lZRmN_GCXGHUOVS1neQy5O9_3H4pr9bSkv_B7849tq-o4f2coaMJuqk9Zm7JOnYCaVL-q2RE2GenJr9_zpWQss3Guqtn4XJrzNR7w"
                                                    />
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a0938] ring-2 ring-[#0c0321]">
                                                        <span className="text-xs font-medium text-gray-300">+2</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap py-4 px-6 text-right text-sm font-medium space-x-2">
                                                <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
                                                    <span className="material-symbols-outlined text-xl">description</span>
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
                                                    <span className="material-symbols-outlined text-xl">edit</span>
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Action Button */}
                <button className="absolute bottom-10 right-10 flex cursor-pointer items-center justify-center overflow-hidden rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors ">
                    <a className=" text-md py-2 px-4 flex items-center" href="/LiveMeeting"> Start new meeting +</a>
                    {/* <span className="sr-only">Start New Meeting</span> */}
                </button>
            </main>
        </div>
    );
};

export default MeetingsPage;