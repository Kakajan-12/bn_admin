'use client';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";

const AdminPanel = () => {

    return (
        <div className="flex bg-gray-200">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>


            </div>
        </div>
    );
};

export default AdminPanel;