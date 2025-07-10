import { useState, useEffect, useCallback } from 'react';
import { ChartData } from 'chart.js';
import { logError } from '../utils/logger';

// Types based on the FastAPI backend models
interface AnalyticsMetric {
    value: string;
    change: string;
}

interface AnalyticsKeyMetrics {
    total: AnalyticsMetric;
    active: AnalyticsMetric;
    disabled: AnalyticsMetric;
}

interface AnalyticsDetailRow {
    affiliate: string;
    total: number;
    comptesGNOC: number;
    comptesAffiliate: number;
    comptesAdmin: number;
    change: string;
}

interface AnalyticsData {
    key_metrics: AnalyticsKeyMetrics;
    pie_chart_data: ChartData<'pie', number[], string>;
    line_chart_data: ChartData<'line', number[], string>;
    details_table: AnalyticsDetailRow[];
    affiliates_list: string[];
}

export const useAnalyticsData = (cluster: string, affiliate: string) => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (cluster && cluster !== 'all') params.append('cluster', cluster);
            if (affiliate && affiliate !== 'all') params.append('affiliate', affiliate);

            const response = await fetch(`http://127.0.0.1:8000/api/analytics-data?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result: AnalyticsData = await response.json();
            setData(result);
        } catch (e: any) {
            setError(e.message);
            logError('Failed to fetch analytics data', e);
        } finally {
            setLoading(false);
        }
    }, [cluster, affiliate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};
