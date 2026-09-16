import { useNavigate } from "react-router-dom";

const th =
    "border border-white/20 px-4 py-3 text-[14px] font-semibold whitespace-nowrap align-middle";

const td =
    "border border-[#dee2e6] px-4 py-3 text-[14px] align-middle";

const CourseTable = ({ loading, courses, activeTab = "english", startIndex = 0 }) => {

    const navigate = useNavigate();

    return (
        <div className="overflow-x-auto">

            <table className="w-full border-collapse">

                <thead>

                    <tr className="bg-[#732269] text-white">

                        <th className={`${th} text-center w-20`}>
                            S. No.
                        </th>

                        <th className={`${th} text-left`}>
                            Course Name
                        </th>

                        <th className={`${th} text-center`}>
                            Number of Modules
                        </th>

                        <th className={`${th} text-left`}>
                            Language
                        </th>

                        <th className={`${th} text-left`}>
                            Status
                        </th>

                        <th className={`${th} text-center`}>
                            Action
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {loading && (
                        <tr>
                            <td
                                colSpan={6}
                                className={`${td} text-center text-[#8492a6]`}
                            >
                                Loading...
                            </td>
                        </tr>
                    )}

                    {!loading && courses.length === 0 && (
                        <tr>
                            <td
                                colSpan={6}
                                className={`${td} text-center text-[#8492a6]`}
                            >
                                No Courses Found
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        courses.map((course, index) => (

                            <tr
                                key={course.course_id}
                            >
                                <td className={`${td} text-center text-[#4d5969]`}>
                                    {startIndex + index + 1}
                                </td>

                                <td className={`${td} text-left text-[#732269]`}>
                                    {course.course_name}
                                </td>

                                <td className={`${td} text-center text-[#4d5969]`}>
                                    {course.module_count ?? 0}
                                </td>

                                <td className={`${td} text-left text-[#732269]`}>
                                    {course.language_name}
                                </td>

                                <td className={`${td} text-left text-[#732269]`}>
                                    {course.status === 1 ? "Active" : "Inactive"}
                                </td>

                                <td className={td}>
                                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(`/courses/view/${course.course_id}?tab=${activeTab}`)
                                            }
                                            className="inline-flex h-8 items-center justify-center rounded-sm! border-2 border-[#67205e] bg-white px-4 text-[12px] font-medium text-[#67205e]"
                                        >
                                            View
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(`/courses/edit/${course.course_id}?tab=${activeTab}`)
                                            }
                                            className="inline-flex h-8 items-center justify-center rounded-sm! bg-[#732269] px-4 text-[12px] font-medium text-white"
                                        >
                                            Edit
                                        </button>

                                    </div>
                                </td>
                            </tr>

                        ))}

                </tbody>

            </table>

        </div>
    );
};

export default CourseTable;
