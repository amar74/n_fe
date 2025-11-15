import { apiClient } from '@/services/api/client';
import type {
  DeliveryModelTemplate,
  DeliveryModelTemplatePayload,
} from '@/types/deliveryModels';

const BASE_PATH = '/delivery-models';

export const deliveryModelsApi = {
  async listTemplates(): Promise<DeliveryModelTemplate[]> {
    const response = await apiClient.get<DeliveryModelTemplate[]>(BASE_PATH);
    return response.data;
  },

  async getTemplate(id: string): Promise<DeliveryModelTemplate> {
    const response = await apiClient.get<DeliveryModelTemplate>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  async createTemplate(payload: DeliveryModelTemplatePayload): Promise<DeliveryModelTemplate> {
    const response = await apiClient.post<DeliveryModelTemplate>(BASE_PATH, payload);
    return response.data;
  },

  async updateTemplate(
    id: string,
    payload: DeliveryModelTemplatePayload,
  ): Promise<DeliveryModelTemplate> {
    const response = await apiClient.put<DeliveryModelTemplate>(`${BASE_PATH}/${id}`, payload);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};

