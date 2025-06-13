import { Schema } from 'mongoose';

const gigSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  companyId: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  requiredSkills: [{
    type: String
  }],
  preferredLanguages: [{
    type: String
  }],
  requiredExperience: {
    type: Number,
    required: true
  },
  expectedConversionRate: {
    type: Number,
    required: true
  },
  compensation: {
    base: {
      type: Number,
      required: true
    },
    commission: {
      type: Number,
      required: true
    }
  },
  duration: {
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    }
  },
  timezone: {
    type: String,
    required: true
  },
  targetRegion: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'published', 'closed'],
    default: 'draft'
  },
  requirements: [{
    type: String
  }],
  kpis: [{
    metric: String,
    target: Number,
    unit: String
  }],
  category: {
    type: String,
    required: true
  },
  team: {
    size: {
      type: String,
      required: true
    },
    roles: [{
      title: String,
      count: Number
    }]
  },
  commission: {
    base: {
      type: String,
      enum: ['fixed', 'percentage'],
      required: true
    },
    baseAmount: {
      type: String,
      required: true
    },
    currency: {
      type: String,
      required: true
    },
    transactionCommission: {
      type: {
        type: String,
        enum: ['fixed', 'percentage'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      }
    },
    minimumVolume: {
      amount: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        required: true
      },
      period: {
        type: String,
        required: true
      }
    }
  }
}, {
  timestamps: true
});

export const Gig = mongoose.model('Gig', gigSchema); 