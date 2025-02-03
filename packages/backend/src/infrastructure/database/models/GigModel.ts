import mongoose, { Schema } from 'mongoose';
import { Gig } from '../../../domain/entities/Gig';

const gigSchema = new Schema<Gig>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  quantity: { type: Number, required: true },
  timeline: { type: String, required: true },
  requirements: [String],
  skillsRequired: [String],
  languagesRequired: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native']
    }
  }],
  kpis: [String],
  compensation: {
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    frequency: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'published', 'closed'],
    default: 'draft'
  },
  creatorId: { type: String, required: true },
}, {
  timestamps: true
});

export const GigModel = mongoose.model<Gig>('Gig', gigSchema);