import React from 'react';

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          </div>
          
          <div className="px-6 py-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">How do I reset my password?</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      You can reset your password from the login page by clicking "Forgot Password".
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">How do I update my profile?</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Go to your Profile page and click the edit button to update your information.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Contact Support</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Need more help? Contact our support team at support@example.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
