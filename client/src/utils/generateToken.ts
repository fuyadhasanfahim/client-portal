import crypto from 'crypto';

export const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};
