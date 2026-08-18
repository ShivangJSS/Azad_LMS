import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";

import {
    getMatchMakingById,
    updateMatchMaking,
} from "../services/MatchingMakingService";

import MatchMakingForm from "../components/MatchMakingForm";


export default function MatchMakingEdit() {

    const {
        matchMakingId,
    } = useParams();

    const navigate = useNavigate();

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);


    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {

        if (!matchMakingId) {
            return;
        }

        loadMatchMaking();

    }, [matchMakingId]);


    const loadMatchMaking = async () => {

        try {

            setLoading(true);



            const response =
                await getMatchMakingById(
                    matchMakingId,
                    1
                );




            let result =
                response?.data ??
                response;


            if (Array.isArray(result)) {

                result =
                    result.length > 0
                        ? result[0]
                        : null;

            }


            if (!result) {

                toast.error(
                    "Match Making not found."
                );

                navigate(
                    "/match-making-master"
                );

                return;
            }


            // ---------------------------------------------
            // IMAGE URL
            // ---------------------------------------------

            let imageUrl =
                result.image_url ?? "";


            /*
             * If backend returns:
             *
             * app/uploads/English/images/file.png
             *
             * convert it to:
             *
             * http://127.0.0.1:8000/app/uploads/English/images/file.png
             */

            if (
                imageUrl &&
                !imageUrl.startsWith("http://") &&
                !imageUrl.startsWith("https://")
            ) {

                imageUrl =
                    `http://127.0.0.1:8000/${imageUrl.replace(
                        /^\/+/,
                        ""
                    )}`;

            }


            setData({

                ...result,

                image_url:
                    imageUrl,

            });


        } catch (error) {

            console.error(
                "LOAD MATCH MAKING ERROR:",
                error
            );


            console.error(
                "BACKEND ERROR:",
                error?.response?.data
            );


            toast.error(
                "Unable to load Match Making."
            );


            navigate(
                "/match-making-master"
            );


        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // UPDATE
    // =====================================================

    const handleUpdate = async (
        payload,
        imageFile
    ) => {

        try {





            /*
             * Current backend PUT accepts JSON.
             *
             * imageFile is currently not sent.
             *
             * Once backend multipart upload is added,
             * imageFile can be uploaded here.
             */

            await updateMatchMaking(
                matchMakingId,
                payload
            );


            toast.success(
                "Match Making updated successfully."
            );


            navigate(
                "/match-making-master"
            );


        } catch (error) {

            console.error(
                "UPDATE MATCH MAKING ERROR:",
                error
            );


            console.error(
                "BACKEND ERROR:",
                error?.response?.data
            );


            toast.error(

                error
                    ?.response
                    ?.data
                    ?.detail ||

                "Unable to update Match Making."

            );


            throw error;

        }

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <AppLayout>

                <div className="p-4 text-sm text-gray-500">
                    Loading Match Making...
                </div>

            </AppLayout>

        );

    }


    // =====================================================
    // NO DATA
    // =====================================================

    if (!data) {
        return null;
    }


    // =====================================================
    // BREADCRUMB
    // =====================================================

    const breadcrumbItems = [

        {
            label: "Home",
            path: "/",
        },

        {
            label: "Match Making List",
            path: "/match-making-master",
        },

        {
            label: "Edit",
            path:
                `/match-making-master/edit/${matchMakingId}`,
        },

    ];


    // =====================================================
    // UI
    // =====================================================

    return (

        <AppLayout>

            {/* HEADER */}

            <div
                className="
                    mb-3
                    flex
                    flex-col
                    items-start
                    gap-2
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >

                <span
                    className="
                        text-[22px]
                        font-medium
                        text-[#344050]
                    "
                >
                    Edit Match Making
                </span>


                <Breadcrumbs
                    items={breadcrumbItems}
                />

            </div>


            {/* FORM */}

            <MatchMakingForm

                initialData={data}

                isEdit={true}

                onSubmit={handleUpdate}

            />

        </AppLayout>

    );
}