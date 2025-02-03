import { Gig } from '../../domain/entities/Gig';
import { IGigRepository } from '../../domain/repositories/IGigRepository';

export class CreateGigUseCase {
  constructor(private gigRepository: IGigRepository) {}

  async execute(gigData: Omit<Gig, 'id' | 'createdAt' | 'updatedAt'>): Promise<Gig> {
    const gig = await this.gigRepository.create(gigData);
    return gig;
  }
}