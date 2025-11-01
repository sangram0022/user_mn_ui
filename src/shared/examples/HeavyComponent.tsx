// Heavy component for lazy loading demo
export default function HeavyComponent() {
  return (
    <div className="p-6 bg-linear-to-br from-purple-100 to-pink-100 rounded-lg">
      <h4 className="text-lg font-semibold mb-2">🎨 Heavy Component Loaded!</h4>
      <p className="text-gray-700">
        This component was lazy-loaded using React 19's Suspense.
        It doesn't block the initial page load.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-white/50 rounded flex items-center justify-center">
            Block {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
