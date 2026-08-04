import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }) {
    return (
        <nav className="flex items-center text-[17px] leading-[18px] italic">

            {items.map((item, index) => {

                const isLast = index === items.length - 1;

                return (
                    <div
                        key={index}
                        className="flex items-center"
                    >

                        {isLast ? (
                            <span className="!text-[#7b216f] !no-underline">
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.path}
                                className="!text-[#7b216f] !no-underline hover:!text-[#7b216f]"
                            >
                                {item.label}
                            </Link>
                        )}

                        {!isLast && (
                            <span className="mx-[6px] text-[#9ca3af]">
                                /
                            </span>
                        )}

                    </div>
                );
            })}

        </nav>
    );
}