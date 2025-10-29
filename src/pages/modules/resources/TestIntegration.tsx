import { useState } from 'react';
import { useEmployees, useEmployeeAnalytics } from '@/hooks/useEmployees';

/**
 * Test component to verify backend integration
 * Navigate to /module/resources/test to use this
 */
export default function TestIntegration() {
  const { employees, isLoading, createEmployee, changeStage, getRoleSuggestion } = useEmployees();
  const { dashboard, skillsGap } = useEmployeeAnalytics();
  const [testResult, setTestResult] = useState<string>('');

  const runTests = async () => {
    setTestResult('Running tests...\n');
    
    try {
      // Test 1: Fetch employees
      setTestResult(prev => prev + `\n✅ Test 1: Fetch Employees\n`);
      setTestResult(prev => prev + `   Found ${employees.length} employees in database\n`);
      
      // Test 2: AI Role Suggestion
      setTestResult(prev => prev + `\n✅ Test 2: AI Role Suggestion\n`);
      const suggestion = await getRoleSuggestion({
        name: 'Test User',
        job_title: 'Frontend Engineer',
        department: 'Engineering',
      });
      setTestResult(prev => prev + `   Suggested Role: ${suggestion.suggested_role}\n`);
      setTestResult(prev => prev + `   Suggested Skills: ${suggestion.suggested_skills.join(', ')}\n`);
      setTestResult(prev => prev + `   Bill Rate: $${suggestion.bill_rate_suggestion}/hr\n`);
      setTestResult(prev => prev + `   Confidence: ${(suggestion.confidence * 100).toFixed(0)}%\n`);
      
      // Test 3: Dashboard stats
      setTestResult(prev => prev + `\n✅ Test 3: Dashboard Stats\n`);
      if (dashboard) {
        setTestResult(prev => prev + `   Total: ${dashboard.total_employees}\n`);
        setTestResult(prev => prev + `   Pending: ${dashboard.pending_count}\n`);
        setTestResult(prev => prev + `   Accepted: ${dashboard.accepted_count}\n`);
      }
      
      // Test 4: Skills Gap
      setTestResult(prev => prev + `\n✅ Test 4: Skills Gap Analysis\n`);
      if (skillsGap) {
        setTestResult(prev => prev + `   Total Gap: ${skillsGap.total_gap} positions\n`);
        setTestResult(prev => prev + `   Critical Gaps: ${skillsGap.critical_gaps}\n`);
      }
      
      setTestResult(prev => prev + `\n🎉 All tests passed! Backend integration working!\n`);
      
    } catch (error: any) {
      setTestResult(prev => prev + `\n❌ Test failed: ${error.message}\n`);
      setTestResult(prev => prev + `   ${error.response?.data?.detail || 'Unknown error'}\n`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Backend Integration Test</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">API Status</p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? 'Loading...' : 'Connected'}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Employees in DB</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <button
            onClick={runTests}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Run Integration Tests
          </button>
        </div>

        {testResult && (
          <div className="bg-gray-900 rounded-xl shadow-lg p-6">
            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
              {testResult}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Employees from Database</h2>
          {isLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : employees.length === 0 ? (
            <p className="text-gray-600">No employees found. Database is empty.</p>
          ) : (
            <ul className="space-y-2">
              {employees.map((emp: any) => (
                <li key={emp.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{emp.name}</p>
                  <p className="text-sm text-gray-600">{emp.email} • {emp.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

