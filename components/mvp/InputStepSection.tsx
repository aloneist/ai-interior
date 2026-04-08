type RoomType = "living" | "bedroom" | "workspace" | "dining"

type InputStepSectionProps = {
  imageUrl: string
  localPreviewUrl: string | null
  roomType: RoomType | null
  roomOptions: Array<{ value: RoomType; label: string }>
  canGoNext: boolean
  onChangeImageUrl: (value: string) => void
  onChangeFile: (file: File | null) => void
  onSelectRoomType: (value: RoomType) => void
  onNext: () => void
  onResetFileStateForUrlInput: () => void
}

export default function InputStepSection({
  imageUrl,
  localPreviewUrl,
  roomType,
  roomOptions,
  canGoNext,
  onChangeImageUrl,
  onChangeFile,
  onSelectRoomType,
  onNext,
  onResetFileStateForUrlInput,
}: InputStepSectionProps) {
  return (
    <section className="max-w-3xl">
      <h2 className="text-2xl font-bold">공간 사진과 유형을 입력해주세요</h2>
      <p className="mt-2 text-sm text-gray-600">
        사진 1장만으로도 시작할 수 있어요. 파일 업로드 또는 공개 이미지 URL 모두 가능합니다.
      </p>

      <div className="mt-6 rounded-2xl border p-5">
        <label className="text-sm font-medium">공간 사진 업로드</label>

        <div className="mt-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onChangeFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          <p className="mt-2 text-xs text-gray-500">
            방 전체가 보이는 사진이면 더 정확해요
          </p>
        </div>

        <div className="mt-5 border-t pt-5">
          <label className="text-sm font-medium">또는 공개 이미지 URL 사용</label>
          <input
            className="mt-2 w-full rounded-xl border px-3 py-3"
            value={imageUrl}
            onChange={(e) => {
              onChangeImageUrl(e.target.value)
              if (e.target.value.trim()) {
                onResetFileStateForUrlInput()
              }
            }}
            placeholder="공개 이미지 URL을 입력하세요"
          />
        </div>

        {(localPreviewUrl || imageUrl.trim()) && (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={localPreviewUrl ?? imageUrl}
              alt="room preview"
              className="max-h-[320px] w-full rounded-xl border object-cover"
            />
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border p-5">
        <div className="text-sm font-medium">공간 유형</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {roomOptions.map((item) => {
            const active = roomType === item.value
            return (
              <button
                key={item.value}
                onClick={() => onSelectRoomType(item.value)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  active ? "bg-black text-white border-black" : "bg-white text-black"
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        <button
          className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-40"
          disabled={!canGoNext}
          onClick={onNext}
        >
          다음
        </button>
        {!canGoNext && (
          <p className="mt-2 text-xs text-gray-500">
            사진 또는 공개 이미지 URL과 공간 유형을 선택해주세요.
          </p>
        )}
      </div>
    </section>
  )
}
