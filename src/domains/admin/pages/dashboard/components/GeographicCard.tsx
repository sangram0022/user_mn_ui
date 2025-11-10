export interface GeoData {
  readonly country: string;
  readonly users: number;
  readonly percentage: number;
}

interface GeographicCardProps {
  readonly geoData: ReadonlyArray<GeoData>;
}

export default function GeographicCard({ geoData }: GeographicCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h2>
      {geoData.length > 0 ? (
        <div className="space-y-3">
          {geoData.slice(0, 5).map((geo) => (
            <div key={geo.country} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{geo.country}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${geo.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {geo.users} ({geo.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No geographic data available</p>
      )}
    </div>
  );
}
