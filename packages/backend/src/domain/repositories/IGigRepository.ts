import { Gig } from '../entities/Gig';

export interface IGigRepository {
  create(gig: Gig): Promise<Gig>;
  findById(id: string): Promise<Gig | null>;
  findAll(): Promise<Gig[]>;
  update(id: string, gig: Partial<Gig>): Promise<Gig | null>;
  delete(id: string): Promise<boolean>;
  findByCreator(creatorId: string): Promise<Gig[]>;
  findByStatus(status: Gig['status']): Promise<Gig[]>;
}