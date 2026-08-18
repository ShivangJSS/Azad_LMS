import { useNavigate } from "react-router-dom";

const th =
    "border border-white/20 px-3 py-[8px] text-[15px] font-semibold whitespace-nowrap";

const td =
    "border border-[#dee2e6] px-3 py-[8px] text-[15px]";

const CourseTable = ({ loading, courses, activeTab = "english" }) => {

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

                        <th className={`${th} text-center`}>
                            Number of Users Enrolled
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
                                colSpan={7}
                                className={`${td} text-center text-[#8492a6]`}
                            >
                                Loading...
                            </td>
                        </tr>
                    )}

                    {!loading && courses.length === 0 && (
                        <tr>
                            <td
                                colSpan={7}
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
                                className="hover:bg-[#fafafa]"
                            >
                                <td className={`${td} text-[#4d5969]`}>
                                    {index + 1}
                                </td>

                                <td className={`${td} text-[#732269]`}>
                                    {course.course_name}
                                </td>

                                <td className={`${td} text-[#4d5969]`}>
                                    {course.module_count ?? 0}
                                </td>

                                <td className={`${td} text-[#4d5969]`}>
                                    {course.enrolled_count ?? 0}
                                </td>

                                <td className={`${td} text-[#732269]`}>
                                    {course.language_name}
                                </td>

                                <td className={`${td} text-[#732269]`}>
                                    {course.status === 1 ? "Active" : "Inactive"}
                                </td>

                                <td className={td}>
                                    <div className="flex items-center justify-center gap-2">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(`/courses/view/${course.course_id}?tab=${activeTab}`)
                                            }
                                            className="px-4 py-1 text-[12px] font-medium text-[#67205e  ] bg-white border-2 border-[#67205e] rounded-sm! hover:bg-[#f7f8fa]"
                                        >
                                            View
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(`/courses/edit/${course.course_id}?tab=${activeTab}`)
                                            }
                                            className="px-4 py-1 text-[12px] font-medium text-white bg-[#732269]
                                             rounded-sm! hover:bg-[#67205e]"
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