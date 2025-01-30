import { IGigRepository } from '../../domain/repositories/IGigRepository';
import { Gig } from '../../domain/entities/Gig';
import { GigModel } from '../database/models/GigModel';

export class MongoGigRepository implements IGigRepository {
  async create(gig: Gig): Promise<Gig> {
    const created = await GigModel.create(gig);
    return created.toObject();
  }

  async findById(id: string): Promise<Gig | null> {
    const gig = await GigModel.findById(id);
    return gig ? gig.toObject() : null;
  }

  async findAll(): Promise<Gig[]> {
    const gigs = await GigModel.find();
    return gigs.map(gig => gig.toObject());
  }

  async update(id: string, gig: Partial<Gig>): Promise<Gig | null> {
    const updated = await GigModel.findByIdAndUpdate(id, gig, { new: true });
    return updated ? updated.toObject() : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await GigModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByCreator(creatorId: string): Promise<Gig[]> {
    const gigs = await GigModel.find({ creatorId });
    return gigs.map(gig => gig.toObject());
  }

  async findByStatus(status: Gig['status']): Promise<Gig[]> {
    const gigs = await GigModel.find({ status });
    return gigs.map(gig => gig.toObject());
  }
}