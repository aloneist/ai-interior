"use client"

import { useMemo, useState } from "react"
import type {
  BudgetLevel,
  CompareSummary,
  FurnitureType,
  GroupedRecommendation,
  MVPResponse,
  MvpRequestInput,
  ProductLike,
  RoomType,
  Step,
  StyleTag,
  UploadImageResponse,
} from "@/types/mvp"

type UseMvpFlowParams = {
  roomOptions: Array<{ value: RoomType; label: string }>
  styleOptions: Array<{ value: StyleTag; label: string }>
}

type UseMvpFlowReturn = {
  step: Step
  setStep: React.Dispatch<React.SetStateAction<Step>>

  imageUrl: string
  setImageUrl: React.Dispatch<React.SetStateAction<string>>
  selectedFile: File | null
  localPreviewUrl: string | null
  roomType: RoomType | null
  setRoomType: React.Dispatch<React.SetStateAction<RoomType | null>>

  styles: StyleTag[]
  budget: BudgetLevel | null
  setBudget: React.Dispatch<React.SetStateAction<BudgetLevel | null>>
  furniture: FurnitureType[]
  requestText: string
  setRequestText: React.Dispatch<React.SetStateAction<string>>

  loading: boolean
  data: MVPResponse | null
  error: string | null

  selectedGroupId: GroupedRecommendation["id"]
  setSelectedGroupId: React.Dispatch<React.SetStateAction<GroupedRecommendation["id"]>>
  selectedProductId: string | null
  setSelectedProductId: React.Dispatch<React.SetStateAction<string | null>>

  savedProductIds: string[]
  comparedProductIds: string[]

  selectedProduct: ProductLike | null
  comparedProducts: ProductLike[]
  comparisonSummary: CompareSummary | null
  savedProducts: ProductLike[]

  canGoInputNext: boolean
  canGoPreferenceNext: boolean
  headerTitle: string
  headerSubtitle: string

  handleFileChange: (file: File | null) => void
  resetFileStateForUrlInput: () => void
  toggleStyle: (value: StyleTag) => void
  toggleFurniture: (value: FurnitureType) => void
  toggleSavedProduct: (productId: string) => void
  toggleComparedProduct: (productId: string) => void
  openExternalProductLink: (product: ProductLike) => Promise<void>
  runMVP: () => Promise<void>
  resetResultAndGoPreference: () => void
}

function toBudgetLabel(budget: BudgetLevel | null) {
  if (budget === "low") return "낮은 예산"
  if (budget === "medium") return "보통 예산"
  if (budget === "high") return "여유 있는 예산"
  return null
}

export default function useMvpFlow({
  roomOptions,
  styleOptions,
}: UseMvpFlowParams): UseMvpFlowReturn {
  const [step, setStep] = useState<Step>("intro")

  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  const [roomType, setRoomType] = useState<RoomType | null>(null)
  const [styles, setStyles] = useState<StyleTag[]>([])
  const [budget, setBudget] = useState<BudgetLevel | null>(null)
  const [furniture, setFurniture] = useState<FurnitureType[]>([])
  const [requestText, setRequestText] = useState("답답해 보이지 않았으면 좋겠어요")

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MVPResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [selectedGroupId, setSelectedGroupId] =
    useState<GroupedRecommendation["id"]>("balanced")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const [savedProductIds, setSavedProductIds] = useState<string[]>([])
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([])

  const selectedProduct = useMemo(() => {
    const groupedProducts =
      data?.grouped_recommendations?.flatMap((group) => group.products) ?? []

    const groupedMatch =
      groupedProducts.find((item) => item.id === selectedProductId) ?? null

    if (groupedMatch) return groupedMatch

    return data?.recommendations.find((item) => item.id === selectedProductId) ?? null
  }, [data, selectedProductId])

  const comparedProducts = useMemo(() => {
    const groupedProducts =
      data?.grouped_recommendations?.flatMap((group) => group.products) ?? []

    const fallbackProducts = data?.recommendations ?? []
    const allProducts = [...groupedProducts, ...fallbackProducts]

    return comparedProductIds
      .map((id) => allProducts.find((item) => item.id === id) ?? null)
      .filter(Boolean) as ProductLike[]
  }, [data, comparedProductIds])

  const comparisonSummary = useMemo(() => {
    if (comparedProducts.length !== 2) return null

    const [a, b] = comparedProducts

    const aPrice = typeof a.price === "number" ? a.price : null
    const bPrice = typeof b.price === "number" ? b.price : null

    const cheaperItem =
      aPrice != null && bPrice != null
        ? aPrice < bPrice
          ? a
          : bPrice < aPrice
          ? b
          : null
        : null

    const higherScoreItem =
      a.recommendation_score > b.recommendation_score
        ? a
        : b.recommendation_score > a.recommendation_score
        ? b
        : null

    let recommendationText = "두 후보가 각각 장점이 있어요."

    if (cheaperItem && higherScoreItem && cheaperItem.id === higherScoreItem.id) {
      recommendationText = `${cheaperItem.name}이(가) 가격과 추천 점수 모두 유리해요.`
    } else if (
      higherScoreItem &&
      cheaperItem &&
      higherScoreItem.id !== cheaperItem.id
    ) {
      recommendationText = `${higherScoreItem.name}은 더 잘 맞고, ${cheaperItem.name}은 더 저렴해요.`
    } else if (higherScoreItem) {
      recommendationText = `${higherScoreItem.name}이(가) 현재 공간 기준으로 더 잘 맞아요.`
    } else if (cheaperItem) {
      recommendationText = `${cheaperItem.name}이(가) 가격 부담이 더 적어요.`
    }

    return {
      left: a,
      right: b,
      cheaperItem,
      higherScoreItem,
      recommendationText,
    }
  }, [comparedProducts])

  const savedProducts = useMemo(() => {
    const groupedProducts =
      data?.grouped_recommendations?.flatMap((group) => group.products) ?? []

    const fallbackProducts = data?.recommendations ?? []
    const allProducts = [...groupedProducts, ...fallbackProducts]

    return savedProductIds
      .map((id) => allProducts.find((item) => item.id === id) ?? null)
      .filter(Boolean) as ProductLike[]
  }, [data, savedProductIds])

  const canGoInputNext =
    Boolean(roomType) && (Boolean(selectedFile) || Boolean(imageUrl.trim()))

  const canGoPreferenceNext =
    Boolean(budget) && styles.length > 0 && furniture.length > 0

  const headerTitle = useMemo(() => {
    const roomLabel =
      roomOptions.find((item) => item.value === roomType)?.label ?? "공간"
    return `${roomLabel}을 위한 추천`
  }, [roomOptions, roomType])

  const headerSubtitle = useMemo(() => {
  const styleLabels = styleOptions
    .filter((item) => styles.includes(item.value))
    .map((item) => item.label)

  const styleText =
    styleLabels.length > 0 ? `${styleLabels.slice(0, 2).join(", ")} 중심으로 ` : ""

  const budgetText = toBudgetLabel(budget) ? `${toBudgetLabel(budget)} 안에서 ` : ""

  const requestSnippet = requestText.trim()
    ? `요청하신 "${requestText.trim()}"를 반영해 `
    : ""

  return `${styleText}${budgetText}${requestSnippet}실제 구매 가능한 후보를 골랐어요`
}, [budget, requestText, styleOptions, styles])

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file)
    setUploadedImageUrl(null)

    if (!file) {
      setLocalPreviewUrl(null)
      return
    }

    const nextPreviewUrl = URL.createObjectURL(file)
    setLocalPreviewUrl(nextPreviewUrl)
  }

  const resetFileStateForUrlInput = () => {
    setSelectedFile(null)
    setLocalPreviewUrl(null)
    setUploadedImageUrl(null)
  }

  const toggleStyle = (value: StyleTag) => {
    setStyles((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const toggleFurniture = (value: FurnitureType) => {
    setFurniture((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const toggleSavedProduct = (productId: string) => {
    setSavedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleComparedProduct = (productId: string) => {
    setComparedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      }

      if (prev.length >= 2) {
        alert("비교는 최대 2개까지 가능합니다.")
        return prev
      }

      return [...prev, productId]
    })
  }

  const openExternalProductLink = async (product: {
    id: string
    name: string
    external_url?: string
  }) => {
    await fetch("/api/log-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request_id: data?.request_id,
        furniture_id: product.id,
      }),
    })

    if (product.external_url) {
      window.open(product.external_url, "_blank", "noopener,noreferrer")
      return
    }

    alert("이 상품의 외부 링크를 찾지 못했어요.")
  }

  const runMVP = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    setStep("loading")

    try {
      let finalImageUrl = imageUrl.trim()

      if (selectedFile) {
        if (!uploadedImageUrl) {
          const formData = new FormData()
          formData.append("file", selectedFile)

          const uploadRes = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          })

          const uploadJson = (await uploadRes.json()) as UploadImageResponse

          if (!uploadRes.ok || !uploadJson.success || !uploadJson.imageUrl) {
            setError(uploadJson.message || uploadJson.error || "이미지 업로드 실패")
            setStep("input")
            return
          }

          finalImageUrl = uploadJson.imageUrl
          setUploadedImageUrl(uploadJson.imageUrl)
        } else {
          finalImageUrl = uploadedImageUrl
        }
      }

      if (!finalImageUrl) {
        setError("이미지를 업로드하거나 URL을 입력해주세요")
        setStep("input")
        return
      }

      const payload: MvpRequestInput = {
  imageUrl: finalImageUrl,
  roomType,
  styles,
  budget,
  furniture,
  requestText,
}

const res = await fetch("/api/mvp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
})

      const json = (await res.json()) as MVPResponse

      if (!res.ok || !json.success) {
        setError(json.message || json.error || "요청 실패")
        setStep("preference")
        return
      }

      setData(json)
      setStep("result")
    } catch (e: any) {
      setError(e?.message || "에러 발생")
      setStep("preference")
    } finally {
      setLoading(false)
    }
  }

  const resetResultAndGoPreference = () => {
    setData(null)
    setSelectedGroupId("balanced")
    setSelectedProductId(null)
    setStep("preference")
  }

  return {
    step,
    setStep,

    imageUrl,
    setImageUrl,
    selectedFile,
    localPreviewUrl,
    roomType,
    setRoomType,

    styles,
    budget,
    setBudget,
    furniture,
    requestText,
    setRequestText,

    loading,
    data,
    error,

    selectedGroupId,
    setSelectedGroupId,
    selectedProductId,
    setSelectedProductId,

    savedProductIds,
    comparedProductIds,

    selectedProduct,
    comparedProducts,
    comparisonSummary,
    savedProducts,

    canGoInputNext,
    canGoPreferenceNext,
    headerTitle,
    headerSubtitle,

    handleFileChange,
    resetFileStateForUrlInput,
    toggleStyle,
    toggleFurniture,
    toggleSavedProduct,
    toggleComparedProduct,
    openExternalProductLink,
    runMVP,
    resetResultAndGoPreference,
  }
}