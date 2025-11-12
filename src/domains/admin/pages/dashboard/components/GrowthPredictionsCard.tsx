interface Prediction {
  readonly expected_new_users: number;
  readonly confidence: string;
}

interface GrowthPredictionsCardProps {
  readonly next7Days: Prediction;
  readonly next30Days: Prediction;
}

export default function GrowthPredictionsCard({ next7Days, next30Days }: GrowthPredictionsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Growth Predictions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">Next 7 Days</p>
          <p className="text-2xl font-bold text-gray-900">
            +{next7Days.expected_new_users} users
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Confidence: {next7Days.confidence}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Next 30 Days</p>
          <p className="text-2xl font-bold text-gray-900">
            +{next30Days.expected_new_users} users
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Confidence: {next30Days.confidence}
          </p>
        </div>
      </div>
    </div>
  );
}
