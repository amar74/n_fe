import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deliveryModelsApi } from '@/services/api/deliveryModelsApi';
import type {
  DeliveryModelTemplate,
  DeliveryModelTemplatePayload,
} from '@/types/deliveryModels';

const DELIVERY_MODEL_KEYS = {
  all: ['delivery-model-templates'] as const,
  list: () => DELIVERY_MODEL_KEYS.all,
  detail: (id: string) => [...DELIVERY_MODEL_KEYS.all, id] as const,
};

export const useDeliveryModelTemplates = () =>
  useQuery({
    queryKey: DELIVERY_MODEL_KEYS.list(),
    queryFn: () => deliveryModelsApi.listTemplates(),
    staleTime: 5 * 60 * 1000,
  });

export const useCreateDeliveryModelTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeliveryModelTemplatePayload) => deliveryModelsApi.createTemplate(payload),
    onSuccess: (template: DeliveryModelTemplate) => {
      queryClient.invalidateQueries({ queryKey: DELIVERY_MODEL_KEYS.list() });
      queryClient.setQueryData(DELIVERY_MODEL_KEYS.detail(template.id), template);
    },
  });
};

export const useUpdateDeliveryModelTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DeliveryModelTemplatePayload }) =>
      deliveryModelsApi.updateTemplate(id, payload),
    onSuccess: (template: DeliveryModelTemplate) => {
      queryClient.invalidateQueries({ queryKey: DELIVERY_MODEL_KEYS.list() });
      queryClient.setQueryData(DELIVERY_MODEL_KEYS.detail(template.id), template);
    },
  });
};

export const useDeleteDeliveryModelTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliveryModelsApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DELIVERY_MODEL_KEYS.list() });
    },
  });
};

