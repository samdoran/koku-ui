import axios from 'axios';

import type { PagedLinks, PagedMetaData } from './api';

export interface SettingsData {
  clusters?: string[];
  default?: boolean;
  project_name?: string;
  group?: string;
  uuid?: string;
  key?: string;
  enabled?: boolean;
}

export interface PagedMetaDataExt extends PagedMetaData {
  limit?: number;
  offset?: number;
  enabled_tags_count?: number;
  enabled_tags_limit?: number;
}

export interface Settings {
  meta: PagedMetaDataExt;
  links?: PagedLinks;
  data: SettingsData;
}

export interface SettingsPayload {
  ids?: string[];
}

// eslint-disable-next-line no-shadow
export const enum SettingsType {
  costCategories = 'costCategories',
  costCategoriesEnable = 'costCategoriesEnable',
  costCategoriesDisable = 'costCategoriesDisable',
  platformProjects = 'platformProjects',
  platformProjectsAdd = 'platformProjectsAdd',
  platformProjectsRemove = 'platformProjectsRemove',
  tags = 'tags',
  tagsEnable = 'tagsEnable',
  tagsDisable = 'tagsDisable',
}

export const SettingsTypePaths: Partial<Record<SettingsType, string>> = {
  [SettingsType.costCategories]: 'settings/aws_category_keys/',
  [SettingsType.costCategoriesEnable]: 'settings/aws_category_keys/enable/',
  [SettingsType.costCategoriesDisable]: 'settings/aws_category_keys/disable/',
  [SettingsType.platformProjects]: 'settings/cost-groups/',
  [SettingsType.platformProjectsAdd]: 'settings/cost-groups/add',
  [SettingsType.platformProjectsRemove]: 'settings/cost-groups/remove',
  [SettingsType.tags]: 'settings/tags',
  [SettingsType.tagsEnable]: 'settings/tags/enable/',
  [SettingsType.tagsDisable]: 'settings/tags/disable/',
};

export function fetchSettings(settingsType: SettingsType, query: string) {
  const path = SettingsTypePaths[settingsType];
  return axios.get<Settings>(`${path}?${query}`);
}

export function updateSettings(settingsType: SettingsType, payload: SettingsPayload) {
  const path = SettingsTypePaths[settingsType];
  return axios.put(`${path}`, payload);
}
