import { cloudinaryProviderStub } from "@/automation/providers/cloudinary"
import { exampleProviderPlaceholder } from "@/automation/providers/example"
import { supabaseProviderStub } from "@/automation/providers/supabase"
import type {
  ProviderId,
  ProviderRegistry,
  RegisteredProvider,
} from "@/automation/providers/types"

const registeredProviders: RegisteredProvider[] = [
  supabaseProviderStub,
  cloudinaryProviderStub,
  exampleProviderPlaceholder,
]

export const providerRegistry: ProviderRegistry = registeredProviders.reduce(
  (registry, provider) => {
    registry[provider.provider.id] = provider
    return registry
  },
  {} as ProviderRegistry
)

export function listRegisteredProviders(): RegisteredProvider[] {
  return registeredProviders.slice()
}

export function getRegisteredProvider(
  providerId: ProviderId
): RegisteredProvider | undefined {
  return providerRegistry[providerId]
}
