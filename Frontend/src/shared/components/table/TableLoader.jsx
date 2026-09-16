import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

export default function TableLoader({ rows = 10, columns = 6 }) {
    return (
        <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={`loader-row-${rowIndex}`}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td
                            key={`loader-cell-${rowIndex}-${colIndex}`}
                            className="border border-[#dee2e6] px-4 py-3"
                        >
                            <Skeleton className="h-4 w-full bg-[#732269]/8" />
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
}