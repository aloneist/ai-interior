export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"
import {
  publishImportJobToCanonicalProduct,
  type ImportJobRecord,
} from "@/lib/server/furniture-catalog"

function isAuthorizedAdmin(req: Request) {
  const token = req.headers.get("x-admin-token")
  return Boolean(process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN)
}

export async function POST(
  req: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobId } = await context.params

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: importJob, error: importJobError } = await supabase
      .from("import_jobs")
      .select(
        [
          "id",
          "source_site",
          "source_url",
          "raw_payload",
          "extracted_name",
          "extracted_brand",
          "extracted_category",
          "extracted_price",
          "extracted_material",
          "extracted_width_cm",
          "extracted_depth_cm",
          "extracted_height_cm",
          "extracted_color_options",
          "extracted_image_urls",
          "status",
          "review_note",
          "extracted_source_site",
          "extracted_affiliate_url",
          "extracted_size_label",
          "extracted_capacity_label",
          "extracted_source_variant_ids",
          "extracted_option_summaries",
          "extracted_confidence",
          "extraction_notes",
          "published_product_id",
        ].join(", ")
      )
      .eq("id", jobId)
      .single()

    if (importJobError) {
      const status =
        typeof importJobError === "object" &&
        importJobError !== null &&
        "code" in importJobError
          ? String((importJobError as { code?: unknown }).code ?? "")
          : ""

      if (status === "PGRST116") {
        return NextResponse.json(
          { error: "Import job not found", jobId },
          { status: 404 }
        )
      }

      throw importJobError
    }

    const typedImportJob = importJob as unknown as ImportJobRecord
    const publishResult = await publishImportJobToCanonicalProduct({
      supabase,
      importJob: typedImportJob,
    })

    if (!publishResult.ok) {
      return NextResponse.json(
        {
          error: "Import job is not publishable",
          code: publishResult.eligibility.code,
          message: publishResult.eligibility.message,
        },
        { status: 422 }
      )
    }

    return NextResponse.json({
      success: true,
      import_job_id: typedImportJob.id,
      published_product_id: publishResult.publishedProduct.id,
      repeated_publish: publishResult.repeated,
      published_product: publishResult.publishedProduct,
    })
  } catch (error: unknown) {
    console.error("IMPORT JOB PUBLISH ERROR:", error)

    return NextResponse.json(
      {
        error: "Import job publish failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
