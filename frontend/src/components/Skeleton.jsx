export function Skeleton({ height = 20, width = '100%', marginTop = 10 }) {
  return (
    <div
      className="shimmer"
      style={{
        height,
        width,
        marginTop,
        borderRadius: 8,
      }}
    />
  );
}
