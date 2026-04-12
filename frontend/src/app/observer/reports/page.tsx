'use client';

import { useState, useCallback } from 'react';
import { 
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Input, Badge, Alert } from '@/components/ui';
import observerService, { ReportData } from '@/services/observer';

const REPORT_TYPES = [
  { value: 'summary', label: 'Summary Report', description: 'Overview of election results and statistics' },
  { value: 'detailed', label: 'Detailed Report', description: 'Complete breakdown with county-by-county results' },
];

const FORMATS = [
  { value: 'csv', label: 'CSV', description: 'Comma-separated values for spreadsheet applications' },
  { value: 'json', label: 'JSON', description: 'Structured data format for developers' },
];

export default function ObserverReportsPage() {
  const [reportType, setReportType] = useState('summary');
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await observerService.generateReport(reportType, format);
      setResult(data);

      // If we got a URL, trigger download
      if (data.url) {
        // Create a blob and download
        const response = await fetch(data.url);
        const blob = await response.blob();
        
        // Determine filename
        const extension = format === 'csv' ? 'csv' : 'json';
        const filename = `election-${reportType}-report-${new Date().toISOString().split('T')[0]}.${extension}`;
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [reportType, format]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-observer-50 dark:bg-observer-900/30">
            <DocumentChartBarIcon className="w-8 h-8 text-observer-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Reports Generation
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Generate and download election reports
            </p>
          </div>
        </div>
      </Card>

      {/* Report Options */}
      <Card>
        <div className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Report Type
            </label>
            <div className="grid gap-3">
              {REPORT_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    reportType === type.value
                      ? 'border-observer-500 bg-observer-50 dark:bg-observer-900/20'
                      : 'border-neutral-200 dark:border-neutral-600 hover:border-observer-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={reportType === type.value}
                    onChange={(e) => setReportType(e.target.value)}
                    className="mt-1 w-4 h-4 text-observer-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {type.label}
                      </span>
                      {reportType === type.value && (
                        <Badge variant="primary" size="sm">Selected</Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {type.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Format
            </label>
            <div className="flex gap-3">
              {FORMATS.map((fmt) => (
                <label
                  key={fmt.value}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    format === fmt.value
                      ? 'border-observer-500 bg-observer-50 dark:bg-observer-900/20'
                      : 'border-neutral-200 dark:border-neutral-600 hover:border-observer-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={fmt.value}
                    checked={format === fmt.value}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-4 h-4 text-observer-500"
                  />
                  <div>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {fmt.label}
                    </span>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {fmt.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" title="Report Generation Failed">
              {error}
            </Alert>
          )}

          {/* Generate Button */}
          <div className="pt-2">
            <Button
              onClick={handleGenerate}
              loading={loading}
              disabled={loading}
              className="w-full"
              leftIcon={<ArrowDownTrayIcon className="w-5 h-5" />}
            >
              {loading ? 'Generating Report...' : 'Download Report'}
            </Button>
          </div>

          {/* Success Message */}
          {result && !error && (
            <Alert variant="success" title="Report Generated">
              {result.message || 'Your report has been downloaded successfully.'}
            </Alert>
          )}
        </div>
      </Card>

      {/* Report Preview Info */}
      <Card>
        <div className="flex gap-4">
          <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30">
            <DocumentArrowDownIcon className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              What&apos;s Included in Reports
            </h4>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
              {reportType === 'summary' ? (
                <>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Total registered voters</li>
                    <li>Total votes cast</li>
                    <li>Turnout percentage</li>
                    <li>Candidate vote totals and percentages</li>
                    <li>Election status</li>
                  </ul>
                </>
              ) : (
                <>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All summary data</li>
                    <li>County-by-county breakdown</li>
                    <li>Ward-level results</li>
                    <li>Polling station turnout</li>
                    <li>Timestamped vote records</li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <div className="flex gap-4">
          <InformationCircleIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
              Report Export Formats
            </h4>
            <div className="text-sm text-primary-700 dark:text-primary-300 space-y-2">
              <p>
                Choose the format that best suits your needs:
              </p>
              <ul className="space-y-1">
                <li>
                  <strong>CSV:</strong> Can be opened in Excel, Google Sheets, or any 
                  spreadsheet application
                </li>
                <li>
                  <strong>JSON:</strong>Structured format ideal for developers or 
                  importing into other systems
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}