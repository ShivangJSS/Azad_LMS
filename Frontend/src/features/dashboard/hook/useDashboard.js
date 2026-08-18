import { useCallback, useEffect, useState } from "react";

import {
    getDashboardSummary,
    getStateWiseParticipants,
    getDistrictWiseParticipants,
    getGenderDistribution,
    getAgeGroupDistribution,
    getStateWiseCentres,
    getModulePerformance,
    getDocumentDistribution,
    getMonthlyLogins,
} from "../services/DashboardService";

export default function useDashboard() {

    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({});

    const [dashboard, setDashboard] = useState({

        summary: null,

        stateWiseParticipants: [],

        districtWiseParticipants: [],

        genderDistribution: [],

        ageGroupDistribution: [],

        stateWiseCentres: [],

        modulePerformance: [],

        documentDistribution: [],

        monthlyLogins: [],

    });

    const fetchDashboard = useCallback(async () => {

        try {

            setLoading(true);

            const [

                summary,

                stateWiseParticipants,

                districtWiseParticipants,

                genderDistribution,

                ageGroupDistribution,

                stateWiseCentres,

                modulePerformance,

                documentDistribution,

                monthlyLogins,

            ] = await Promise.all([

                getDashboardSummary(filters),

                getStateWiseParticipants(filters),

                getDistrictWiseParticipants(filters),

                getGenderDistribution(filters),

                getAgeGroupDistribution(filters),

                getStateWiseCentres(filters),

                getModulePerformance(filters),

                getDocumentDistribution(),

                getMonthlyLogins(filters),

            ]);

            setDashboard({

                summary,

                stateWiseParticipants,

                districtWiseParticipants,

                genderDistribution,

                ageGroupDistribution,

                stateWiseCentres,

                modulePerformance,

                documentDistribution,

                monthlyLogins,

            });

        } catch (error) {

            console.error("Dashboard Error :", error);

        } finally {

            setLoading(false);

        }

    }, [filters]);

    useEffect(() => {

        fetchDashboard();

    }, [fetchDashboard]);

    return {

        loading,

        dashboard,

        filters,

        setFilters,

        refreshDashboard: fetchDashboard,

    };

}