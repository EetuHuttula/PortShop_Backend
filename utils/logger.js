const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sensitiveFields = ['password', 'passwordHash', 'token', 'SECRET', 'authorization'];
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in copy) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      copy[key] = '***REDACTED***';
    } else if (typeof copy[key] === 'object' && copy[key] !== null) {
      copy[key] = sanitize(copy[key]);
    }
  }

  return copy;
};

const info = (...params) => {

  if (process.env.NODE_ENV !== 'test') { 
    const sanitizedParams = params.map(param => 
      typeof param === 'object' ? sanitize(param) : param
    );
    console.log(...sanitizedParams);
  }
}

const error = (...params) => {

  if (process.env.NODE_ENV !== 'test') { 
    const sanitizedParams = params.map(param => 
      typeof param === 'object' ? sanitize(param) : param
    );
    console.error(...sanitizedParams);
  }
}

module.exports = {
  info, error, sanitize
}