import React from 'react';
import { ClipboardList } from 'lucide-react';

const MyWorkflowsPage: React.FC = () => (
  <section className="px-4 py-8 sm:px-6 lg:px-8">
    <div className="max-w-5xl mx-auto">
      <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <ClipboardList className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Workflows</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Workflow requests and submissions assigned to you will appear here. Once a workflow is created,
          you can track its status, review assigned tasks, and collaborate with team members in real time.
        </p>
        <div className="mt-8">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Explore workflow templates
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default MyWorkflowsPage;
