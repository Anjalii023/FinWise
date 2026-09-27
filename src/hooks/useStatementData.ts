import { useState, useMemo, useCallback } from 'react';
import { ParseResult, AnalyticsSummary } from '../types';
import { SAMPLE_DATASETS, SampleDataset } from '../services/parsers/samples';
import { DeterministicAnalyticsEngine } from '../services/analytics/engine';

export function useStatementData() {
  const [activeDataset, setActiveDataset] = useState<SampleDataset>(SAMPLE_DATASETS[0]);
  const [customParsedData, setCustomParsedData] = useState<{
    name: string;
    result: ParseResult;
  } | null>(null);

  const activeStatement: ParseResult = useMemo(() => {
    return customParsedData ? customParsedData.result : activeDataset.data;
  }, [customParsedData, activeDataset]);

  const activeDatasetName: string = useMemo(() => {
    return customParsedData ? customParsedData.name : activeDataset.name;
  }, [customParsedData, activeDataset]);

  const analyticsSummary: AnalyticsSummary = useMemo(() => {
    return DeterministicAnalyticsEngine.computeSummary(activeStatement.transactions);
  }, [activeStatement]);

  const selectSampleDataset = useCallback((dataset: SampleDataset) => {
    setCustomParsedData(null);
    setActiveDataset(dataset);
  }, []);

  const ingestParsedData = useCallback((result: ParseResult, name: string) => {
    setCustomParsedData({ name, result });
  }, []);

  return {
    activeStatement,
    activeDatasetName,
    analyticsSummary,
    selectSampleDataset,
    ingestParsedData,
  };
}
