export const registerSchema = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email address",
  },
  password: {
    required: true,
    minLength: 8,
    message: "Password must be at least 8 characters",
  },
  name: {
    required: true,
    minLength: 2,
    message: "Name must be at least 2 characters",
  },
}

export const loginSchema = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email address",
  },
  password: {
    required: true,
    message: "Password is required",
  },
}

export const appointmentSchema = {
  doctorId: {
    required: true,
    message: "Doctor is required",
  },
  appointmentDate: {
    required: true,
    message: "Appointment date is required",
  },
  startTime: {
    required: true,
    message: "Start time is required",
  },
  reason: {
    required: true,
    minLength: 10,
    message: "Reason must be at least 10 characters",
  },
}

export function validateInput(data: Record<string, any>, schema: Record<string, any>) {
  const errors: Record<string, string> = {}

  for (const field in schema) {
    const rules = schema[field]
    const value = data[field]

    if (rules.required && (!value || value.trim() === "")) {
      errors[field] = rules.message || `${field} is required`
      continue
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.message || `Invalid ${field}`
      continue
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      errors[field] = rules.message || `${field} must be at least ${rules.minLength} characters`
      continue
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
