import { Api } from './Api';
import { ApiProfessor } from '../types/professor';

class ProfessorService extends Api {
    getProfessor(options: { id: string }) {
        return this.get(`/api/instructors/?${new URLSearchParams(options)}`);
    }

    searchProfessor(query: string) {
        return this.get<ApiProfessor[]>(`/api/instructors/search?q=${encodeURIComponent(query)}`);
    }
}

export default new ProfessorService();
