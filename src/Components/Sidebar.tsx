import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TfiLayoutSlider } from "react-icons/tfi";
import { VscTypeHierarchySub } from "react-icons/vsc";
import { PiReadCvLogo } from "react-icons/pi";
import { GrGallery } from "react-icons/gr";
import { IoLocationSharp } from "react-icons/io5";
import { LuMails, LuCalendarDays  } from "react-icons/lu";
import { FaPhoneSquareAlt } from "react-icons/fa";
import { MdTour } from "react-icons/md";
import { IoMdCheckmarkCircleOutline, IoIosCloseCircleOutline  } from "react-icons/io";
import { TbCategoryFilled } from "react-icons/tb";
import { FaLocationDot,FaMapLocationDot, FaPassport } from "react-icons/fa6";
import { RiLinksLine } from "react-icons/ri";

const menuGroups = [
    {
        title: "Content Management",
        key: "content",
        links: [
            { href: "/admin/sliders", label: "Sliders", icon: TfiLayoutSlider },
        ],
    },
    {
        title: "Blogs",
        key: "blogs",
        links: [
            { href: "/admin/blogs", label: "Blogs", icon: PiReadCvLogo},
            { href: "/admin/blogs-gallery", label: "Blogs Gallery", icon: GrGallery },
        ],
    },
    {
        title: "Contacts",
        key: "contacts",
        links: [
            { href: "/admin/address", label: "Address", icon: IoLocationSharp },
            { href: "/admin/mails", label: "Mails", icon: LuMails },
            { href: "/admin/numbers", label: "Numbers", icon: FaPhoneSquareAlt },
            { href: "/admin/social-links", label: "Social Links", icon: RiLinksLine  },
            { href: "/admin/locations", label: "Locations", icon: FaLocationDot  },
        ],
    },
    {
        title: "Tours",
        key: "tours",
        links: [
            { href: "/admin/tours", label: "Tours", icon: MdTour},
            { href: "/admin/tour-types", label: "Types", icon: VscTypeHierarchySub},
            { href: "/admin/tour-category", label: "Category", icon: TbCategoryFilled},
            { href: "/admin/itinerary", label: "Itinerary", icon: LuCalendarDays},
            { href: "/admin/includes", label: "Includes", icon: IoMdCheckmarkCircleOutline},
            { href: "/admin/excludes", label: "Excludes", icon: IoIosCloseCircleOutline},
            { href: "/admin/tour-gallery", label: "Gallery", icon: GrGallery},
            { href: "/admin/tour-location", label: "Tours Location", icon: FaMapLocationDot},
            { href: "/admin/visa", label: "Visa Requirements", icon: FaPassport},
        ],
    },
];

const Sidebar = () => {
    const pathname = usePathname();
    const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const newOpenGroups: { [key: string]: boolean } = {};
        for (const group of menuGroups) {
            if (group.links.some((link) => pathname.startsWith(link.href))) {
                newOpenGroups[group.key] = true;
            }
        }
        setOpenGroups((prev) => ({ ...prev, ...newOpenGroups }));
    }, [pathname]);

    const toggleGroup = (key: string) => {
        setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <aside className="w-64 bg-white shadow-md h-screen fixed" aria-label="Sidebar">
            <div className="h-full px-3 py-4 overflow-y-auto space-y-4">
                <div>
                    <a
                        href="/admin"
                        className="block p-2 font-semibold text-gray-900 rounded-lg hover:bg-gray-100"
                    >
                        Dashboard
                    </a>
                </div>

                {menuGroups.map((group) => (
                    <div key={group.key}>
                        <button
                            onClick={() => toggleGroup(group.key)}
                            className="w-full text-left px-2 py-2 text-sm font-bold text-gray-600 uppercase hover:bg-gray-100 rounded"
                        >
                            {group.title}
                        </button>

                        {openGroups[group.key] && (
                            <ul className="mt-1 space-y-1 ml-2">
                                {group.links.map(({ href, label, icon: Icon }) => (
                                    <li
                                        key={href}
                                        className={`flex items-center p-2 rounded-md font-medium ${
                                            isActive(href) ? "bg text-white" : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <Icon className={`size-5 ${isActive(href) ? "text-white" : "text-gray-500"}`} />
                                        <a href={href} className="ml-3 w-full block">
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
