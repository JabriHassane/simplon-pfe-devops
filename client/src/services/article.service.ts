import type {
	CreateArticleDtoType,
	ArticleDtoType,
	UpdateArticleDtoType,
} from '../../../shared/dtos/article.dto';
import {
	ApiService,
	type PaginationParams,
	type PaginatedResponse,
} from './api.service';

export const ArticleService = {
	async getPage(
		params?: PaginationParams
	): Promise<PaginatedResponse<ArticleDtoType>> {
		return ApiService.getPaginated<ArticleDtoType>('/articles', params);
	},

	async getById(id: string) {
		return ApiService.get<ArticleDtoType>(`/articles/${id}`);
	},

	async create(data: CreateArticleDtoType) {
		return ApiService.post<ArticleDtoType>('/articles', data);
	},

	async update(id: string, data: UpdateArticleDtoType) {
		return ApiService.put<ArticleDtoType>(`/articles/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/articles/${id}`);
	},
};
