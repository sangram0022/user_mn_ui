export interface DeviceData {
  readonly name: string;
  readonly value: number;
}

interface DeviceStatsCardProps {
  readonly deviceData: ReadonlyArray<DeviceData>;
  readonly total: number;
}

export default function DeviceStatsCard({ deviceData, total }: DeviceStatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h2>
      {deviceData.length > 0 ? (
        <div className="space-y-4">
          {deviceData.map((device) => {
            const percentage = total > 0 ? ((device.value / total) * 100).toFixed(1) : '0';
            return (
              <div key={device.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{device.name}</span>
                  <span className="text-sm text-gray-600">
                    {device.value} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No device data available</p>
      )}
    </div>
  );
}
