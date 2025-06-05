import { GigData } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string[] };
  warnings: { [key: string]: string[] };
}

export function validateGigData(data: GigData): ValidationResult {
  const errors: { [key: string]: string[] } = {};
  const warnings: { [key: string]: string[] } = {};

  // Critical Validations (Errors)
  
  // Basic Info
  if (!data.title?.trim()) {
    errors.basic = [...(errors.basic || []), 'Title is required'];
  } else if (data.title.length < 3) {
    errors.basic = [...(errors.basic || []), 'Title must be at least 10 characters long'];
  }

  if (!data.description?.trim()) {
    errors.basic = [...(errors.basic || []), 'Description is required'];
  } else if (data.description.length < 10) {
    warnings.basic = [...(warnings.basic || []), 'Consider adding more details to the description'];
  }

  if (!data.category) {
    errors.basic = [...(errors.basic || []), 'Category is required'];
  }

  // Schedule
  if (!data.schedule) {
    errors.schedule = [...(errors.schedule || []), 'Schedule information is required'];
  } else {
    if (!data.schedule.days?.length) {
      errors.schedule = [...(errors.schedule || []), 'Working days are required'];
    }

    if (!data.schedule.hours?.trim()) {
      errors.schedule = [...(errors.schedule || []), 'Working hours are required'];
    }

    if (!data.schedule.timeZones?.length) {
      errors.schedule = [...(errors.schedule || []), 'At least one time zone is required'];
    }
  }

  // Commission
  if (!data.commission) {
    errors.commission = [...(errors.commission || []), 'Commission information is required'];
  } else {
    if (!data.commission?.currency) {
      errors.commission = [...(errors.commission || []), 'Currency is required'];
    }

    if (data.commission?.base) {
      if (!data.commission?.baseAmount) {
        errors.commission = [...(errors.commission || []), 'Base commission amount is required'];
      }
      if (!data.commission?.minimumVolume?.amount) {
        errors.commission = [...(errors.commission || []), 'Minimum volume amount is required'];
      }
      if (!data.commission.minimumVolume?.unit) {
        errors.commission = [...(errors.commission || []), 'Minimum volume unit is required'];
      }
      if (!data.commission?.minimumVolume?.period) {
        errors.commission = [...(errors.commission || []), 'Minimum volume period is required'];
      }
    }
  }

  // Team
  if (!data.team) {
    errors.team = [...(errors.team || []), 'Team information is required'];
  } else {
    if (!data.team.size) {
      errors.team = [...(errors.team || []), 'Team size is required'];
    }

    if (!data.team.structure?.length) {
      warnings.team = [...(warnings.team || []), 'Consider adding team structure'];
    }

    if (!data.team.territories?.length) {
      warnings.team = [...(warnings.team || []), 'Consider adding at least one territory'];
    }
  }

  // Non-Critical Validations (Warnings)
  
  // Leads
  if (data.leads?.types?.length) {
    const totalLeadPercentage = data.leads.types.reduce((sum, type) => sum + type.percentage, 0);
    if (totalLeadPercentage !== 100) {
      warnings.leads = [...(warnings.leads || []), 'Lead type percentages should sum to 100%'];
    }
  }

  if (!data.leads?.sources?.length) {
    warnings.leads = [...(warnings.leads || []), 'Consider adding at least one lead source'];
  }

  // Skills
  if (data.skills?.languages?.length === 0) {
    warnings.skills = [...(warnings.skills || []), 'Consider specifying required languages'];
  }

  if (data.skills?.professional?.length === 0) {
    warnings.skills = [...(warnings.skills || []), 'Consider adding professional skills requirements'];
  }

  // Documentation
  if (Object.values(data.documentation || {}).every(docs => !docs || docs.length === 0)) {
    warnings.documentation = [...(warnings.documentation || []), 'Consider adding relevant documentation'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
}