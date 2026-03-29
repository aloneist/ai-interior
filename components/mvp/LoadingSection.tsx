export default function LoadingSection() {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center text-center">
      <div className="h-12 w-12 animate-pulse rounded-full bg-black" />
      <h2 className="mt-6 text-2xl font-bold">분석 중입니다</h2>
      <div className="mt-3 space-y-2 text-sm text-gray-600">
        <p>공간을 분석하고 있어요</p>
        <p>취향과 예산을 반영하고 있어요</p>
        <p>실제 구매 가능한 가구를 찾고 있어요</p>
      </div>
    </section>
  )
}