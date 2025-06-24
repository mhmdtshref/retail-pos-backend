import { RequestHandler } from 'express';
import { createClerkClient } from '@clerk/backend';
import { getAuth } from '@clerk/express';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export class AuthController {
  // Get current user's profile from Clerk
  getProfile: RequestHandler = async (req, res, next) => {
    try {
      const auth = getAuth(req);
      if (!auth.userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
      }

      const user = await clerkClient.users.getUser(auth.userId);
      
      return res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            role: user.publicMetadata.role || 'CASHIER', // Role from Clerk metadata
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  };
}
