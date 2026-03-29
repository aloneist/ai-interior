type IntroSectionProps = {
  onStart: () => void
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="font-semibold">{title}</div>
      <div className="mt-2 text-sm text-gray-600">{desc}</div>
    </div>
  )
}

export default function IntroSection({ onStart }: IntroSectionProps) {
  return (
    <section className="py-10 md:py-16">
      <div className="max-w-3xl">
        <div className="text-sm text-gray-500">AI 인테리어 큐레이션 MVP</div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          내 공간에 맞는 실제 가구를
          <br />
          AI가 추천해드립니다
        </h1>
        <p className="mt-5 text-lg leading-8 text-gray-600">
          방 사진과 간단한 취향만 입력하면, 실제 구매 가능한 가구 후보를
          조합 형태로 추천해드려요.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="입력" desc="공간 사진과 기본 조건만 간단히 입력" />
          <InfoCard title="분석" desc="공간 톤과 밀도를 바탕으로 추천" />
          <InfoCard title="결과" desc="실제 구매 가능한 가구 후보를 조합으로 확인" />
        </div>

        <button
          className="mt-10 rounded-xl bg-black px-5 py-3 text-white"
          onClick={onStart}
        >
          내 공간으로 시작하기
        </button>
      </div>
    </section>
  )
}